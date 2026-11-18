# USD / PayPal setup

Routes:
- `/admin/usd-prices`: fixed USD prices, US shipping price, checkout availability.
- `/cart/usd` and `/order/usd-checkout`: United States checkout.
- `/api/usd/quote`: verifies product status, variant stock, quantity, country and registered USD prices; issues a signed 30-minute quote.
- `/api/usd/confirm`: verifies signed quote, order, amount, USD currency, payment status, payment key and foreign MID before saving the order.

## Cloudflare environment variables

Set these in the existing Pages project, then redeploy. Do not paste secret keys into chat, source code, or public admin inputs.

- `TOSS_USD_CLIENT_KEY`: Toss **payment widget** client key for the account used for the foreign USD UI (`test_gck_...` in sandbox or `live_gck_...` in production).
- `TOSS_USD_SECRET_KEY`: matching Toss secret key, stored as an encrypted environment secret. Use the matching test/live mode and foreign payment account.
- Optional `TOSS_USD_MID`: defaults to the merchant-provided `pbaredsw0d`.

Existing `SUPABASE_SERVICE_ROLE_KEY` and member identity configuration remain required. Domestic `TOSS_SECRET_KEY` is used only for domestic payments and domestic refunds. Foreign approvals/refunds use the USD secret.

In Toss admin:
- Foreign USD MID: `pbaredsw0d`
- Payment widget variant: `PAYPAL_USD`
- English agreements: create `AGREEMENT-EN` for an English customer experience. If that variant has not been created, the checkout falls back to existing `AGREEMENT` only when Toss reports a variant-key error.
- Test and live UI variants are configured separately. Start with test keys and a PayPal Sandbox Personal account. Test approval, order save, and refund before live activation.

## Prices and shipping

1. Open `/admin/usd-prices` and sign in with the existing admin account.
2. On the first authenticated admin load, missing USD prices are filled and saved from the latest published USD/KRW reference rate (Frankfurter; ExchangeRate-API fallback). The KRW sale price is divided by KRW per USD and rounded up to a whole dollar. Existing USD prices are preserved. The rate, source date and number of filled products appear in admin. The import runs once; later prices remain fixed and editable. If a sufficiently recent rate cannot be verified, no prices are invented or saved. Blank prices remain unavailable for USD checkout.
3. Review the shipping charge. Initial **$25 to the United States** is a configurable merchant policy, **not a verified carrier quotation**. Korea Post EMS official rate pages and search access were blocked in this environment. Weigh a packed order and obtain a carrier quote before relying on this as cost recovery. Import duties/taxes are not included in the displayed shipping charge and the checkout states that the recipient pays any charges.
4. Save prices. After matching keys and sandbox validation are ready, enable USD checkout and save.

USD prices are not guessed; the one-time import requires a validated published exchange rate (at most four days old to accommodate weekends). USD checkout is off by default and cannot be enabled without prices and both keys. Changing the browsing currency does not alter KRW prices stored in cart items. The server ignores browser-provided prices and creates an authoritative USD quote.

## Storage and amounts

No schema migration is required. Settings are stored in the existing site-media bucket as `settings/usd-commerce.json`; settings contain public prices, not customer details or secrets. Quote customer details are returned only to that checkout in a signed token; they are not written to public storage.

Existing orders and order_items have integer amount fields. **USD orders use integer cents**, marked by `raw_payment.bare_currency = "USD"` and `bare_amount_unit = "cents"`. Admin, member order history, approval and cancellation format these as USD; original KRW orders remain in whole won. KRW aggregate sales exclude USD rather than adding currencies. The summary API exposes `paidUsdAmount` separately.

Stock is checked when issuing a quote; the existing order save/stock update mechanism handles successful USD orders as it does KRW orders. This does not introduce a stock reservation system.

## Validation performed

All payment requests, approval, refund, auth and storage calls in automated tests are mocked. Browser tests cover desktop/mobile currency display, cart, US address, widget `USD` amount and `PAYPAL_USD`, product/shipping data, signed approval, member ownership, cents storage, and admin price reload. Backend tests reject amount/signature/currency/MID mismatches, unavailable prices, invalid stock and unsupported destinations. No real customer payment or live refund was submitted.

Reference: merchant-provided Toss foreign-payment guide screenshots, plus official `@tosspayments/tosspayments-sdk` 2.10.0 type definitions for `foreignEasyPay.products` and `.shipping` (`https://www.npmjs.com/package/@tosspayments/tosspayments-sdk`).
