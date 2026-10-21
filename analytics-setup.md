# BARE. visitor analytics

The administrator dashboard is `/admin/analytics`. This is first-party analytics backed by the existing Supabase project, not a Google Analytics integration.

## Detailed dashboard update (report version 2)

Run the updated `analytics-schema.sql` once in Supabase SQL Editor, including when the original analytics table already exists. It retains current records, adds two indexes and replaces the report function; product and order tables are untouched. The administrator dashboard detects an old report response and shows an update notice rather than displaying invented detailed counts. Existing page collection continues during the upgrade. This repository change alone does not apply SQL to the production database.

The detailed dashboard adds:

- Visitors, sessions, views and views per session with previous-period comparisons. For 7 days including today, comparison shifts both endpoints back 7 days; the previous interval ends at the same time of day. No percentage is fabricated when the previous count is zero.
- Daily metric switching, a zero-filled date series, hourly view totals in Seoul time, and accessible numeric tables.
- First-session source share, distinct source visitors, campaign visitor/session counts and first-entry pages. A session active within the selected interval keeps its earliest retained source, even if it started before the interval.
- Product TOP 20 grouped by product route, independent of the page TOP 50. Repeated views count as views while visitors/sessions are deduplicated per product. `/` and `/index.html` product hashes group together. Product names and default thumbnails come from the existing product catalog; catalog failures do not prevent viewing counts. Product ranking search searches only the displayed TOP 20.
- First-time versus returning browsers based on first appearance in the retained 90-day history, not lifetime customers. First appearance inside the selected interval remains first-time even after repeated visits during that interval.
- CSV export of the loaded interval, with spreadsheet-formula escaping, and Instagram profile/story/advertisement UTM links. Use these links before running a campaign; historic unattributed visits cannot be reassigned.

All detailed aggregations run inside PostgreSQL, without row-limit sampling or exporting visitor/session identifiers to the administrator browser. Sources and device categories can each contain the same visitor; their visitor counts should not be summed into site visitors. Sessions remain tab-specific.

## Activate once

1. Open the existing Supabase project's **SQL Editor**.
2. Run the complete contents of `analytics-schema.sql`. The migration is repeatable, creates only the new analytics table/functions/trigger, and does not change product or order tables.
3. Open the administrator's **방문 통계** page and refresh. Before initialization it shows a setup notice rather than fabricated zero counts.
4. Visit the storefront in a normal browser, accept optional analytics collection, open a product, and check the dashboard. Headless browsers, common bots, DNT/GPC, rejected consent, and admin/account/payment pages are excluded.

The deployed Worker already uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. No new credential is required. Never place the service-role key in the browser or SQL source.

## Interpretation

- **Visitors:** distinct random browser identifiers, hashed server-side. Not a count of identified people.
- **Sessions:** random tab/session identifiers renewed after 30 minutes without a tracked action. First source in a session is retained. Reports use the earliest retained event for sessions active in the selected interval.
- **Views:** initial page loads and supported product/collection hash navigation, deduplicated for consecutive identical routes in the same session.
- **Dates:** Asia/Seoul; today, 7 days, or 30 days, including the current incomplete day.
- **Sources:** UTM source first, then external referrer hostname, otherwise `direct / unknown`. Query strings are not stored. App browsers may hide referrers.
- **Campaigns:** `utm_source`, `utm_medium`, `utm_campaign`, with restricted length/characters.
- **Retention:** records older than 90 days are removed on collection or administrator report access. An entirely inactive site needs a scheduled cleanup if deletion must occur on a fixed calendar deadline. Browser IDs expire after 90 days.

Instagram profile example:
`https://baredot.pages.dev/?utm_source=instagram&utm_medium=social&utm_campaign=profile`

Existing visits cannot be reconstructed. Only consented visits after database activation are counted. Data collection does not block shopping if the analytics database is unavailable.

## Validation performed

A separate PostgreSQL engine verified migration repeatability, visitor/session deduplication, Korean dates, source/campaign aggregation, old-record cleanup, and database access restrictions. Browser/API fixtures verified consent, withdrawal, rejection, UTM attribution, route tracking, dashboard display, date selection, missing-schema errors, and authentication. Production database activation remains a separate required step; no production visitor records were created during tests.
