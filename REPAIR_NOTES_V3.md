# ShopGenie V3 Repair

- Strengthened query-to-catalog reconciliation so Gemini cannot replace a deterministic catalog product type with an incompatible category.
- Expanded aliases and normalized common singular/plural and spelling forms.
- Enriched the demo catalog's feature metadata so feature-focused queries such as lightweight running shoes can rank relevant variants.
- Test runner now executes Gemini intent through the same execution path and validates product type + budget/currency for every returned candidate.
- The demo provider remains synthetic; it is not live retailer data.
