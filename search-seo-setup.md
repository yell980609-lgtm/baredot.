# Naver brand icon and category discovery

The storefront now provides:

- An explicit PNG favicon and apple-touch icon using the existing BARE. logo at `/assets/baredot-logo.png`, plus a fallback `/favicon.ico` redirect. No logo artwork was changed.
- Production canonical URLs, `og:site_name`, WebSite and Organization identity including the brand logo/Instagram profile, and category navigation structured data. Existing home title and description are retained.
- Direct category URLs: `/women/all`, `/women/top`, `/women/bottom`, `/men/all`, `/men/top`, `/men/bottom`. These return normal HTTP 200 pages, descriptive titles, breadcrumbs and server-rendered product links/prices. The existing storefront hydrates the same categories, preserving stock, reviews, cart and product-detail navigation. Published/sold-out products only; the BARED SET remains included in WOMEN / ALL.
- Crawlable category links in menus/footer, `/robots.txt` and `/sitemap.xml`. Temporary database errors return HTTP 503/noindex instead of publishing a misleading empty category. Canonical identity always uses `https://baredot.pages.dev`, including preview deployments; update the origin constant if the official domain changes.

## Search Advisor follow-up (site owner)

1. Register/verify `https://baredot.pages.dev` in Naver Search Advisor if not already registered. Ownership verification needs the actual token/file supplied by Naver; none is fabricated by this change.
2. Under site submission, submit `https://baredot.pages.dev/sitemap.xml`.
3. Request collection of the home page and major category URLs, starting with `/women/all` and `/men/all`.
4. Check crawl/index status after Naver processes those requests.

A favicon is the small icon shown beside a result; Open Graph thumbnails are a separate setting. Providing a favicon, brand schema and navigable category pages helps discovery but **does not guarantee** the favicon, site-name label, category sitelinks, wording, placement or timing of a search result. Naver selects and updates them independently. This implementation does not submit Search Advisor requests or access the owner's Naver account.

The repository tests cover metadata/robots/sitemap/category status, server rendering without JavaScript, mobile/desktop hydration, direct category entry and transitions back to product detail. No production product, order or review records are modified by these checks.
