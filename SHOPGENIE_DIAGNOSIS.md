# ShopGenie Current Diagnosis

The original project had two conflicting demo paths: a six-product provider in `lib/shopgenie.ts` and a small structured catalog in `lib/commerce-engine.ts`. The dashboard also contained independent hardcoded recommendation cards, activity events, and savings metrics. As a result, searches such as `running shoes under ₹5000` could return unrelated AirPods/keyboard/laptop-stand cards even when the search engine reported no match.

The repair pass replaces that architecture with one structured demo catalog and one deterministic validation/ranking pipeline. Gemini, when configured, supplies structured intent to that pipeline. The page clears old search state before each request and renders recommendations/activity only from the current response.

The current provider remains explicitly demo data. Live retailer integration is not present in the uploaded project and should be treated as a separate integration step.
