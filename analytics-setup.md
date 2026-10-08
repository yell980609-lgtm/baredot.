# BARE. visitor analytics

The administrator dashboard is `/admin/analytics`. This is first-party analytics backed by the existing Supabase project, not a Google Analytics integration.

## Activate once

1. Open the existing Supabase project's **SQL Editor**.
2. Run the complete contents of `analytics-schema.sql`. The migration is repeatable, creates only the new analytics table/functions/trigger, and does not change product or order tables.
3. Open the administrator's **방문 통계** page and refresh. Before initialization it shows a setup notice rather than fabricated zero counts.
4. Visit the storefront in a normal browser, accept optional analytics collection, open a product, and check the dashboard. Headless browsers, common bots, DNT/GPC, rejected consent, and admin/account/payment pages are excluded.

The deployed Worker already uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. No new credential is required. Never place the service-role key in the browser or SQL source.

## Interpretation

- **Visitors:** distinct random browser identifiers, hashed server-side. Not a count of identified people.
- **Sessions:** random tab/session identifiers renewed after 30 minutes without a tracked action. First source in a session is retained.
- **Views:** initial page loads and supported product/collection hash navigation, deduplicated for consecutive identical routes in the same session.
- **Dates:** Asia/Seoul; today, 7 days, or 30 days.
- **Sources:** UTM source first, then external referrer hostname, otherwise `direct / unknown`. Query strings are not stored. App browsers may hide referrers.
- **Campaigns:** `utm_source`, `utm_medium`, `utm_campaign`, with restricted length/characters.
- **Retention:** records older than 90 days are removed on collection or administrator report access. An entirely inactive site needs a scheduled cleanup if deletion must occur on a fixed calendar deadline. Browser IDs expire after 90 days.

Instagram profile example:
`https://baredot.pages.dev/?utm_source=instagram&utm_medium=social&utm_campaign=profile`

Existing visits cannot be reconstructed. Only consented visits after database activation are counted. Data collection does not block shopping if the analytics database is unavailable.

## Validation performed

A separate PostgreSQL engine verified migration repeatability, visitor/session deduplication, Korean dates, source/campaign aggregation, old-record cleanup, and database access restrictions. Browser/API fixtures verified consent, withdrawal, rejection, UTM attribution, route tracking, dashboard display, date selection, missing-schema errors, and authentication. Production database activation remains a separate required step; no production visitor records were created during tests.
