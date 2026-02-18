# Specification

## Summary
**Goal:** Restrict checkout to Cash on Delivery only and fully disable Stripe/card/QR payment flows across the app.

**Planned changes:**
- Update the post-acceptance Checkout Wait UI to show only Cash on Delivery, removing/hiding Card (Stripe) and QR payment options, and ensure completing the flow does not redirect to Stripe-related success/failure pages.
- Ensure completing Cash on Delivery sets the order payment reference to a Cash-on-Delivery marker (e.g., "CASH_ON_DELIVERY") and navigates the user to the Orders page.
- Disable Stripe checkout session creation paths in the frontend when Cash on Delivery only mode is in effect, and show a clear English error if any Stripe/card action is still invoked directly.
- Enforce Cash on Delivery only in the backend by preventing Stripe checkout session creation while keeping non-Stripe order operations working.
- Remove/hide admin Stripe setup UI and update any checkout/payment-related copy to clearly state payments are Cash on Delivery only (English text).

**User-visible outcome:** Users can place orders and complete checkout using only Cash on Delivery, with no Stripe/card/QR options shown and no redirects to Stripe payment success/failure pages; admins no longer see Stripe setup when COD-only is enabled.
