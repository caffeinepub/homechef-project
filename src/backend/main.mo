import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type MenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    imageUrl : Text;
    isAvailable : Bool;
    createdAt : Time.Time;
    preparationTimeMinutes : Nat;
  };

  type OrderItem = {
    itemId : Nat;
    quantity : Nat;
    specialInstructions : Text;
  };

  type OrderStatus = {
    #pendingPayment;
    #paymentFailed;
    #confirmed;
    #rejected : { reason : Text };
    #inProgress;
    #outForDelivery;
    #completed;
    #cancelled : { reason : Text };
  };

  type Order = {
    id : Nat;
    user : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    deliveryAddress : Text;
    contactNumber : Text;
    specialInstructions : Text;
    paymentReference : ?Text;
    status : OrderStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    statusHistory : [OrderStatus];
  };

  type BookingStatus = {
    #pendingPayment;
    #paymentFailed;
    #confirmed;
    #rejected : { reason : Text };
    #cancelled : { reason : Text };
  };

  type ChefBooking = {
    id : Nat;
    user : Principal;
    eventDate : Time.Time;
    location : Text;
    eventDetails : Text;
    price : Nat;
    paymentReference : ?Text;
    status : BookingStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type DashboardMetrics = {
    totalOrders : Nat;
    totalRevenue : Nat;
    pendingOrders : [Order];
    recentOrders : [Order];
    pendingBookings : [ChefBooking];
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  module BookingStatus {
    public func getText(status : BookingStatus) : Text {
      switch (status) {
        case (#pendingPayment) { "Pending Payment" };
        case (#paymentFailed) { "Payment Failed" };
        case (#confirmed) { "Confirmed" };
        case (#rejected({ reason })) { "Rejected: " # reason };
        case (#cancelled({ reason })) { "Cancelled: " # reason };
      };
    };
  };

  module OrderStatus {
    public func getText(status : OrderStatus) : Text {
      switch (status) {
        case (#pendingPayment) { "Pending Payment" };
        case (#paymentFailed) { "Payment Failed" };
        case (#confirmed) { "Confirmed" };
        case (#rejected({ reason })) { "Rejected: " # reason };
        case (#inProgress) { "In Progress" };
        case (#outForDelivery) { "Out for Delivery" };
        case (#completed) { "Completed" };
        case (#cancelled({ reason })) { "Cancelled: " # reason };
      };
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let menuItems = Map.empty<Nat, MenuItem>();
  let bookings = Map.empty<Nat, ChefBooking>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextMenuItemId = 1;
  var nextBookingId = 1;
  var nextOrderId = 1;

  let categories = Set.empty<Text>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Menu Management (Admin Only)
  public shared ({ caller }) func addMenuItem(name : Text, description : Text, price : Nat, category : Text, imageUrl : Text, isAvailable : Bool, preparationTimeMinutes : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };

    let menuItem : MenuItem = {
      id = nextMenuItemId;
      name;
      description;
      price;
      category;
      imageUrl;
      isAvailable;
      preparationTimeMinutes;
      createdAt = Time.now();
    };

    menuItems.add(nextMenuItemId, menuItem);
    categories.add(category);
    nextMenuItemId += 1;

    menuItem.id;
  };

  public shared ({ caller }) func updateMenuItem(itemId : Nat, name : Text, description : Text, price : Nat, category : Text, imageUrl : Text, isAvailable : Bool, preparationTimeMinutes : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };

    let existingItem = switch (menuItems.get(itemId)) {
      case (null) { Runtime.trap("MenuItem not found") };
      case (?item) { item };
    };

    let updatedItem : MenuItem = {
      existingItem with
      name;
      description;
      price;
      category;
      imageUrl;
      isAvailable;
      preparationTimeMinutes;
    };

    menuItems.add(itemId, updatedItem);
    categories.add(category);
  };

  public shared ({ caller }) func deleteMenuItem(itemId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };

    if (not menuItems.containsKey(itemId)) {
      Runtime.trap("MenuItem not found");
    };

    menuItems.remove(itemId);
  };

  // Menu Browsing (Public - no auth required)
  public query ({ caller }) func getMenuItem(itemId : Nat) : async ?MenuItem {
    menuItems.get(itemId);
  };

  public query ({ caller }) func getMenuItemsByCategory(category : Text) : async [MenuItem] {
    menuItems.values().toArray().filter(
      func(item) { item.category == category },
    );
  };

  public query ({ caller }) func getAvailableItemsByCategory(category : Text) : async [MenuItem] {
    menuItems.values().toArray().filter(
      func(item) { item.category == category and item.isAvailable },
    );
  };

  public query ({ caller }) func getMenuCategories() : async [Text] {
    categories.toArray();
  };

  public query ({ caller }) func getAllAvailableMenuItems() : async [MenuItem] {
    menuItems.values().toArray().filter(
      func(item) { item.isAvailable },
    );
  };

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    menuItems.values().toArray();
  };

  // Order Management
  public shared ({ caller }) func createOrder(items : [OrderItem], deliveryAddress : Text, contactNumber : Text, specialInstructions : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let totalAmount = items.foldLeft(
      0,
      func(acc, item) {
        let menuItem = switch (menuItems.get(item.itemId)) {
          case (null) { Runtime.trap("Menu item not found") };
          case (?mi) { mi };
        };
        acc + (item.quantity * menuItem.price);
      },
    );

    let order : Order = {
      id = nextOrderId;
      user = caller;
      items;
      totalAmount;
      deliveryAddress;
      contactNumber;
      specialInstructions;
      paymentReference = null;
      status = #pendingPayment;
      createdAt = Time.now();
      updatedAt = Time.now();
      statusHistory = [#pendingPayment];
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;

    order.id;
  };

  public shared ({ caller }) func updateOrderPaymentRef(orderId : Nat, paymentRef : Text, newStatus : OrderStatus) : async () {
    let existingOrder = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    // Only the order owner can update payment reference (during payment flow)
    if (caller != existingOrder.user) {
      Runtime.trap("Unauthorized: Can only update payment for your own orders");
    };

    let updatedOrder : Order = {
      existingOrder with
      paymentReference = ?paymentRef;
      status = newStatus;
      updatedAt = Time.now();
      statusHistory = existingOrder.statusHistory.concat([newStatus]);
    };

    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let existingOrder = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let updatedOrder : Order = {
      existingOrder with
      status = newStatus;
      updatedAt = Time.now();
      statusHistory = existingOrder.statusHistory.concat([newStatus]);
    };

    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    let order = switch (orders.get(orderId)) {
      case (null) { return null };
      case (?o) { o };
    };

    // Users can only view their own orders, admins can view all
    if (caller != order.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    ?order;
  };

  public query ({ caller }) func getOrderStatus(orderId : Nat) : async ?OrderStatus {
    let order = switch (orders.get(orderId)) {
      case (null) { return null };
      case (?o) { o };
    };

    // Users can only view their own order status, admins can view all
    if (caller != order.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own order status");
    };

    ?order.status;
  };

  public query ({ caller }) func getOrderStatusText(orderId : Nat) : async Text {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    // Users can only view their own order status, admins can view all
    if (caller != order.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own order status");
    };

    OrderStatus.getText(order.status);
  };

  public query ({ caller }) func getOrderStatusHistory(orderId : Nat) : async [OrderStatus] {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    // Users can only view their own order history, admins can view all
    if (caller != order.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own order history");
    };

    order.statusHistory;
  };

  public query ({ caller }) func getOrdersByUser() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    orders.values().toArray().filter(func(order) { order.user == caller });
  };

  public query ({ caller }) func getOrderIdsByUser(user : Principal) : async [Nat] {
    // Users can only get their own order IDs, admins can get any user's
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.entries().toArray().filter(func(entry) { entry.1.user == user }).map(func(entry) { entry.0 });
  };

  // Chef Booking Management
  public shared ({ caller }) func createChefBooking(eventDate : Time.Time, location : Text, eventDetails : Text, price : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    let booking : ChefBooking = {
      id = nextBookingId;
      user = caller;
      eventDate;
      location;
      eventDetails;
      price;
      paymentReference = null;
      status = #pendingPayment;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    bookings.add(nextBookingId, booking);
    nextBookingId += 1;

    booking.id;
  };

  public shared ({ caller }) func updateBookingPaymentRef(bookingId : Nat, paymentRef : Text, newStatus : BookingStatus) : async () {
    let existingBooking = switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) { booking };
    };

    // Only the booking owner can update payment reference (during payment flow)
    if (caller != existingBooking.user) {
      Runtime.trap("Unauthorized: Can only update payment for your own bookings");
    };

    let updatedBooking : ChefBooking = {
      existingBooking with
      paymentReference = ?paymentRef;
      status = newStatus;
      updatedAt = Time.now();
    };

    bookings.add(bookingId, updatedBooking);
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, newStatus : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };

    let existingBooking = switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) { booking };
    };

    let updatedBooking : ChefBooking = {
      existingBooking with
      status = newStatus;
      updatedAt = Time.now();
    };

    bookings.add(bookingId, updatedBooking);
  };

  public query ({ caller }) func getChefBooking(bookingId : Nat) : async ?ChefBooking {
    let booking = switch (bookings.get(bookingId)) {
      case (null) { return null };
      case (?b) { b };
    };

    // Users can only view their own bookings, admins can view all
    if (caller != booking.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };

    ?booking;
  };

  public query ({ caller }) func getBookingStatus(bookingId : Nat) : async ?BookingStatus {
    let booking = switch (bookings.get(bookingId)) {
      case (null) { return null };
      case (?b) { b };
    };

    // Users can only view their own booking status, admins can view all
    if (caller != booking.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own booking status");
    };

    ?booking.status;
  };

  public query ({ caller }) func getBookingStatusText(bookingId : Nat) : async Text {
    let booking = switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    // Users can only view their own booking status, admins can view all
    if (caller != booking.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own booking status");
    };

    BookingStatus.getText(booking.status);
  };

  public query ({ caller }) func getBookingsByUser() : async [ChefBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    bookings.values().toArray().filter(func(booking) { booking.user == caller });
  };

  public query ({ caller }) func getBookingIdsByUser(user : Principal) : async [Nat] {
    // Users can only get their own booking IDs, admins can get any user's
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };

    bookings.entries().toArray().filter(func(entry) { entry.1.user == user }).map(func(entry) { entry.0 });
  };

  // Admin Dashboard (Admin Only)
  public query ({ caller }) func getDashboardMetrics() : async DashboardMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard metrics");
    };

    let allOrders = orders.values().toArray();
    let totalOrders = allOrders.size();
    
    let totalRevenue = allOrders.foldLeft(
      0,
      func(acc, order) {
        switch (order.status) {
          case (#completed) { acc + order.totalAmount };
          case (_) { acc };
        };
      },
    );

    let pendingOrders = allOrders.filter(
      func(order) {
        switch (order.status) {
          case (#confirmed) { true };
          case (#inProgress) { true };
          case (#outForDelivery) { true };
          case (_) { false };
        };
      },
    );

    let sortedOrders = allOrders.sort(
      func(a : Order, b : Order) : { #less; #equal; #greater } {
        if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal };
      },
    );

    let recentOrders = if (sortedOrders.size() <= 10) {
      sortedOrders;
    } else {
      sortedOrders.sliceToArray(0, 10);
    };

    let pendingBookings = bookings.values().toArray().filter(
      func(booking) {
        switch (booking.status) {
          case (#confirmed) { true };
          case (_) { false };
        };
      },
    );

    {
      totalOrders;
      totalRevenue;
      pendingOrders;
      recentOrders;
      pendingBookings;
    };
  };

  public query ({ caller }) func getSuccessfulOrderCountForToday() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view metrics");
    };

    let today = Time.now() / 86_400_000_000_000;
    orders.values().toArray().filter(func(order) { order.status == #completed and (order.createdAt / 86_400_000_000_000 == today) }).size();
  };
};
