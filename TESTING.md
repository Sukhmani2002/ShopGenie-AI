# ShopGenie Test Matrix

The app is intentionally runnable without integrations. The following 50 cases are the acceptance matrix for the demo provider and browser session fallback.

## API and validation
1. POST empty body returns 400. 2. POST missing query returns 400. 3. POST non-string query returns 400. 4. POST whitespace query returns 400. 5. POST query over 240 chars is bounded. 6. Malformed JSON returns 400. 7. Budget under is extracted. 8. Budget below is extracted. 9. No-budget request is medium confidence. 10. Excluded brand is parsed. 11. Demo provenance is returned. 12. Route steps are returned. 13. Warnings are returned. 14. Product IDs are stable. 15. Recommendation count matches response.

## UI and navigation
16. Overview opens by default. 17. Shopping agent nav is clickable. 18. Shortlist nav is clickable. 19. Price alerts nav is clickable. 20. Settings nav is clickable. 21. Mobile menu opens. 22. Mobile menu closes. 23. Notification control gives feedback. 24. Sync refresh gives feedback. 25. Help control is reachable. 26. Example query fills composer. 27. Enter submits after hydration. 28. IME composition Enter does not submit. 29. Empty submit is blocked. 30. Loading state disables submit.

## Shopping state
31. Successful request renders system result. 32. Result shows route. 33. Result shows confidence. 34. Result shows demo warning. 35. Shortlist adds a product. 36. Duplicate shortlist is idempotent. 37. Shortlist button changes state. 38. Toast is announced. 39. Product image has alt text. 40. Product cards have accessible controls.

## Resilience and security
41. Unexpected API error produces user-facing warning. 42. API does not expose secrets. 43. API output is JSON. 44. Query is trimmed. 45. External image failures do not break text content. 46. Dark viewport remains readable. 47. Narrow viewport does not overflow. 48. Build passes TypeScript compilation. 49. No fake live-provider claim is shown. 50. No durable persistence claim is shown without integration.
