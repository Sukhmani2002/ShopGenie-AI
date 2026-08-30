# ShopGenie Universal Commerce Coverage

The coverage generator is dimension-driven and creates 1,024 unique query variants per practical product type across the taxonomy. Queries are not rendered in the dashboard; the test API can summarize or paginate them.

## Dimensions
- Product type and category
- Budget and currency
- Intent
- Use case and occasion
- Attribute preference
- Natural-language variation

## Status semantics
- `PASS`: valid structured result, including an honest no-results response.
- `NO_RESULTS`: provider has no eligible product facts.
- `CONSTRAINT_VIOLATION`: a hard constraint would have been relaxed (must never be returned as a recommendation).
- `ERROR`: invalid or unavailable execution.

The fallback provider remains demo data. It does not claim live price, stock, delivery, reviews, or checkout.
