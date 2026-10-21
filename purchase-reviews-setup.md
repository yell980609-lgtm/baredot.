# BARE. purchase-only review form

## Activate

1. Run `purchase-reviews-schema.sql` once in the existing Supabase SQL Editor. It creates a private review table and service-role-only functions. Existing orders, products and managed reviews are not modified. Re-running the script is safe.
2. Deploy the site commit. The existing `SUPABASE_SERVICE_ROLE_KEY` signs review links with a separate purpose-specific key derivation; no new secret is required. Optionally set `REVIEW_LINK_SECRET` via the Cloudflare secret UI. Never send secret keys through chat. Rotating either active signing secret invalidates outstanding links.
3. In `/admin/orders`, open an order with `payment_status=paid` and `fulfillment_status=done`. Click **리뷰 작성 링크 복사**. This generates a 30-day purchaser-specific link. The drawer displays the URL, copy result and an open-form action. Clipboard restrictions and generation errors are shown inline, with manual selection/copy available. Ineligible orders show why link creation is disabled. It does not send any message or change order status.
4. The intended purchaser opens the link, selects a purchased item, rates it and submits 10–2,000 characters of text. Nonmembers can use the same link without creating an account. The link authorizes only this order; treat it as confidential and send it only to the purchaser.

`/review` without a valid link shows guidance instead of a public write form. Tokens use the URL fragment, are removed from history after loading and are never saved in local/session storage. Reopening the original message is necessary after refreshing the cleaned URL. The page has no analytics or third-party widgets and uses no-referrer/noindex headers. Its submit endpoint requires a same-origin request and an unexpired HMAC token.

## Eligibility and public display

- A database transaction locks the order and verifies paid/delivered state, item ownership, rating, length and a unique review per order-item row. Cancellation, return and exchange request states are ineligible. An external refund not yet reflected in the order database cannot be detected by this form.
- Current order items contain product titles rather than stable catalog IDs. The database accepts a review only when its purchased title matches exactly one current product name. Renamed, removed or ambiguous products show a customer-service notice rather than attaching feedback to the wrong product. New checkout schema changes and manual mapping are outside this change.
- Each review stores the verified product slug, masked author, purchased option, rating and text. Public endpoints expose only those display fields and the date, never order IDs, item IDs, contact information or full names.
- Reviews are published immediately on submit. Deletion requests go through customer service; there is no new moderation dashboard in this change. Authorized database administrators can delete the private review row if requested. Foreign keys remove dependent reviews when their underlying order/item is deleted.
- Existing managed/legacy reviews remain. Verified purchaser reviews are added to them in product detail and `Review(n)` thumbnail counts. Counts use full database aggregation; detail loads the latest 50 purchase reviews on demand and discloses this display limit. No per-card requests or new database changes are needed for ordinary checkout.
- If the review schema is not initialized or temporarily unavailable, product browsing and checkout continue. Link creation and review submission show an availability error; no fake review success is shown.

## Alimtalk follow-up

This adds the form and link generation only. It does **not** activate SOLAPI messaging, schedule sends or send any live SMS/Alimtalk. The approved review-request template and the three-day delivery-completion scheduler are separate follow-up work. Use the same signed link generator for that integration. Generate the URL when the request is actually sent so its full validity starts then.

## Validation

Tests use mocked order/provider APIs and isolated PostgreSQL. They create no real orders, reviews or outbound messages. Run the API and storefront unit tests with Node; the browser tests accept `PLAYWRIGHT_MODULE`/`CHROMIUM_PATH`, and the SQL test accepts `PGLITE_MODULE` for tools installed outside the repository.
