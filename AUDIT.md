# ShopGenie Functional Audit

## Scope
Audited the existing workspace dashboard, client state, and `/api/agent` route before the repair pass.

## Existing feature status
| Surface | Status | Notes |
|---|---|---|
| Overview dashboard | WORKING | Renders responsive workspace UI. |
| Shopping agent composer | PARTIALLY WORKING | Calls server route; no live provider. |
| Query validation | WORKING | Empty and oversized input handled server-side. |
| Recommendations | PARTIALLY WORKING | Fixed demo catalog; now explicitly labeled. |
| Shortlist buttons | WORKING | Client session state; no durable persistence. |
| Sidebar navigation | PARTIALLY WORKING | Changes active label, but views are not yet distinct. |
| Mobile navigation | WORKING | Opens and closes with accessible controls. |
| Refresh/help/alerts/settings | PARTIALLY WORKING | Visible interactions provide lightweight feedback only. |
| Cart, compare, history, plans, AI Lab | MISSING | No dedicated state or views in the original implementation. |
| Product details and optimization | MISSING | No detail route or approval proposal flow. |
| Auth/database persistence | MISSING BY DESIGN | User declined integrations and env vars. |
| Provider abstraction | MISSING | Added in repair pass. |
| Provenance | PARTIALLY WORKING | Added demo-provider warning; field-level provenance remains demo. |
| API security | PARTIALLY WORKING | Input length/type validation; no auth/rate limiting without integration. |

## Repair targets
Typed contracts, provider seam, deterministic searchable fallback, unified browser session state, distinct functional views, approval-based cart optimization, and executable test coverage.
