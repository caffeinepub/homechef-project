import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export type BookingStatus = {
    __kind__: "cancelled";
    cancelled: {
        reason: string;
    };
} | {
    __kind__: "pendingPayment";
    pendingPayment: null;
} | {
    __kind__: "rejected";
    rejected: {
        reason: string;
    };
} | {
    __kind__: "confirmed";
    confirmed: null;
} | {
    __kind__: "paymentFailed";
    paymentFailed: null;
};
export interface OrderItem {
    itemId: bigint;
    specialInstructions: string;
    quantity: bigint;
}
export interface ChefBooking {
    id: bigint;
    status: BookingStatus;
    eventDetails: string;
    createdAt: Time;
    user: Principal;
    updatedAt: Time;
    paymentReference?: string;
    price: bigint;
    location: string;
    eventDate: Time;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    deliveryAddress: string;
    createdAt: Time;
    user: Principal;
    statusHistory: Array<OrderStatus>;
    updatedAt: Time;
    specialInstructions: string;
    totalAmount: bigint;
    contactNumber: string;
    paymentReference?: string;
    items: Array<OrderItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MenuItem {
    id: bigint;
    name: string;
    createdAt: Time;
    isAvailable: boolean;
    description: string;
    imageUrl: string;
    category: string;
    price: bigint;
    preparationTimeMinutes: bigint;
}
export type OrderStatus = {
    __kind__: "cancelled";
    cancelled: {
        reason: string;
    };
} | {
    __kind__: "outForDelivery";
    outForDelivery: null;
} | {
    __kind__: "completed";
    completed: null;
} | {
    __kind__: "pendingPayment";
    pendingPayment: null;
} | {
    __kind__: "rejected";
    rejected: {
        reason: string;
    };
} | {
    __kind__: "confirmed";
    confirmed: null;
} | {
    __kind__: "inProgress";
    inProgress: null;
} | {
    __kind__: "paymentFailed";
    paymentFailed: null;
};
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface DashboardMetrics {
    pendingBookings: Array<ChefBooking>;
    totalOrders: bigint;
    pendingOrders: Array<Order>;
    recentOrders: Array<Order>;
    totalRevenue: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(name: string, description: string, price: bigint, category: string, imageUrl: string, isAvailable: boolean, preparationTimeMinutes: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createChefBooking(eventDate: Time, location: string, eventDetails: string, price: bigint): Promise<bigint>;
    createOrder(items: Array<OrderItem>, deliveryAddress: string, contactNumber: string, specialInstructions: string): Promise<bigint>;
    deleteMenuItem(itemId: bigint): Promise<void>;
    getAcceptsCashOnDelivery(): Promise<boolean>;
    getAllAvailableMenuItems(): Promise<Array<MenuItem>>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAvailableItemsByCategory(category: string): Promise<Array<MenuItem>>;
    getBookingIdsByUser(user: Principal): Promise<Array<bigint>>;
    getBookingStatus(bookingId: bigint): Promise<BookingStatus | null>;
    getBookingStatusText(bookingId: bigint): Promise<string>;
    getBookingsByUser(): Promise<Array<ChefBooking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChefBooking(bookingId: bigint): Promise<ChefBooking | null>;
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getMenuCategories(): Promise<Array<string>>;
    getMenuItem(itemId: bigint): Promise<MenuItem | null>;
    getMenuItemsByCategory(category: string): Promise<Array<MenuItem>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getOrderIdsByUser(user: Principal): Promise<Array<bigint>>;
    getOrderStatus(orderId: bigint): Promise<OrderStatus | null>;
    getOrderStatusHistory(orderId: bigint): Promise<Array<OrderStatus>>;
    getOrderStatusText(orderId: bigint): Promise<string>;
    getOrdersByUser(): Promise<Array<Order>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSuccessfulOrderCountForToday(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAcceptsCashOnDelivery(acceptsCash: boolean): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBookingPaymentRef(bookingId: bigint, paymentRef: string, newStatus: BookingStatus): Promise<void>;
    updateBookingStatus(bookingId: bigint, newStatus: BookingStatus): Promise<void>;
    updateMenuItem(itemId: bigint, name: string, description: string, price: bigint, category: string, imageUrl: string, isAvailable: boolean, preparationTimeMinutes: bigint): Promise<void>;
    updateOrderPaymentRef(orderId: bigint, paymentRef: string, newStatus: OrderStatus): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
}
