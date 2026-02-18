# Specification

## Summary
**Goal:** Ensure the first authenticated user on a fresh canister is permanently bootstrapped as the sole admin so the Admin UI appears immediately after login.

**Planned changes:**
- Update backend admin bootstrap logic so that when no admin is set, the first *authenticated* principal making a backend call is assigned admin permanently, and no later principals are auto-assigned.
- Ensure `isCallerAdmin()` participates in bootstrap: on a fresh canister, the first authenticated caller receives `true` immediately; anonymous callers receive `false` and do not trigger bootstrap.
- Update frontend to re-check admin status immediately after successful login and update navbar/admin gating without requiring a hard refresh; ensure logout removes admin UI access and shows existing “Access Denied” behavior for non-admins.

**User-visible outcome:** The first user to log in on a new deployment immediately sees the “Admin” link after login and retains admin access on refresh/re-login, while all other users do not see/administer admin-only features.
