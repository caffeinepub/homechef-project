# Specification

## Summary
**Goal:** Make the Menu and Cart experience fast and reliable by fixing add-to-cart for anonymous users, improving menu loading UX/performance, and ensuring cart persistence across refreshes.

**Planned changes:**
- Allow anonymous users on `/menu` to add items to the cart without being prompted to sign in; require authentication only at checkout/order placement.
- Fix cart persistence to localStorage when cart items contain `BigInt` fields, so serialization does not error and the cart restores correctly after refresh.
- Improve Menu loading reliability and perceived performance by adding a skeleton/placeholder loading grid, tuning React Query caching for menu data, and adding an error state with Retry on fetch failures.
- Update navigation so Cart link/icon (with cart count) is available to anonymous users, while keeping Orders/Book Chef/Admin gated as before.

**User-visible outcome:** Users can browse `/menu`, add items to the cart and view `/cart` without signing in; the cart count updates immediately and persists after refresh; the Menu page loads with a skeleton UI, feels faster on repeat visits, and shows a clear retryable error state if loading fails.
