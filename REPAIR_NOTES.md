# ShopGenie Repair Pass

## Fixed

- Removed the old six-product recommendation path from the active shopping flow.
- Replaced the tiny demo catalog with 3,714 clearly marked structured demo listings covering 619 item types from the supplied search dataset, with INR and USD demo variants.
- Made product type/category/budget validation generic instead of relying on a small set of hardcoded products.
- Connected Gemini structured intent extraction to the production search execution path when `GEMINI_API_KEY` is configured; deterministic extraction remains the safe fallback.
- Added normalization for common shopping aliases such as mobile → smartphones, iphone → smartphones, watch → watches, shoes → footwear, and common spelling mistakes.
- Cleared stale recommendations and agent events whenever a new search starts.
- Made Smart Recommendations and Agent Activity render only the current search result state.
- Removed fake savings/price-drop dashboard numbers from the active search dashboard; shortlist count is now session state.
- Replaced broken static product-image assumptions with an explicit demo visual when no verified image exists.
- Updated the legacy `/api/agent` route to use the same commerce engine instead of the old six-product provider.
- Updated the CSV test runner summary so the displayed tested count is the number actually executed, while also showing total dataset size.

## Important demo limitation

The provider is still a **DEMO PROVIDER**. It does not provide live retailer prices, inventory, reviews, checkout, or verified product images. The generated listings are intentionally labeled demo data and should not be presented as real commerce listings.

## Validation

The runtime image/build could not be executed in this environment because the uploaded project has no installed `node_modules`, `pnpm` is unavailable, and dependency installation timed out. TypeScript syntax was checked with the globally available compiler; the remaining diagnostics are dependency/type-environment errors caused by the missing installed packages rather than a successful application build.
