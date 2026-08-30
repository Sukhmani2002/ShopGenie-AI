# Purchase flow test report

## Verified

- Search `headphones under 25000` returns provider-backed demo products.
- Purchase workspace preserves the exact selected product title, store, and price.
- Quantity is bounded to 1–10 and totals are recalculated from the selected product.
- Cart requires a separate review step before delivery details.
- Delivery details require name and address before payment.
- Payment offers explicit demo card and cash-on-delivery simulation choices.
- Purchase requires an explicit `confirm: true` server request.
- Confirmation displays a demo order ID and demo tracking estimate.
- Empty/no-match searches keep Add to cart disabled.
- Production build passes with Next.js 16.

## Provenance

This flow uses the existing in-memory demo provider. No real payment is processed, no retailer order is submitted, and delivery tracking is simulated. Server-side totals are derived from session cart product facts rather than client-provided totals.

## Known scope

Session state is process-local and intended for the demo workspace. Production persistence, authenticated accounts, live inventory, live shipping, and payment-provider integration remain separate follow-up work.
