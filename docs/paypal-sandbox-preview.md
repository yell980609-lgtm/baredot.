# Isolated PayPal preview

This branch (`paypal-sandbox`) forces sandbox mode. Deploy it to **Preview only**. Production `main` remains unchanged.

Open `/sandbox` on the Preview hostname. It displays configuration presence, never secret values.

Preview environment variables:
- `TOSS_USD_CLIENT_KEY`: test payment-widget client (`test_gck_...`).
- `TOSS_USD_SECRET_KEY`: matching `test_gsk_...` or `test_sk_...` secret.
- `TOSS_USD_MID`: `tpbaredsw0d` (test MID, default on this branch).
- `SUPABASE_SERVICE_ROLE_KEY`: existing service-role key, as a Secret, required to read the catalog and write private sandbox records.
- `ADMIN_EMAILS`: existing allowed admin email(s), for example the same setting as Production. Existing admin_users table authorization also works.
- If Production uses custom `SUPABASE_URL` / `SUPABASE_ANON_KEY`, copy the corresponding configuration to Preview too. Default project configuration remains the same as main.

Prices and availability use `settings/usd-commerce-sandbox.json`. The first authenticated admin load fills missing USD prices using the current verified FX reference, independently of live USD settings. Enable test USD checkout on the Preview admin page.

Approved orders are JSON records in a **private** Supabase Storage bucket `bare-paypal-sandbox`. They never invoke the production order saver or stock decrement. Storage is created automatically with the service-role key; an existing public bucket is refused. `/admin/usd-sandbox-orders` requires administrator authentication and lists only sandbox records.

The receipt has a `Test full refund (Sandbox)` button, authorized by the signed checkout quote (30-minute validity). It reads the saved private payment key, verifies USD amount and test MID with Toss, then requests an idempotent full test refund and updates the private record. The real `orders`, `order_items`, member rewards and inventory are unchanged.

Production-changing non-GET routes, including domestic payment confirmation, product edits, SMS and live order cancellation, are blocked on this branch. Legacy cart/orderform URLs route to the sandbox USD checkout. Live keys cannot enable this sandbox checkout. Signed USD quote keys use a separate sandbox namespace, preventing quote reuse between main and preview.

Validation: mocked desktop/mobile browser flows for USD cart, address, widget, approval, private persistence, admin list, and refund; unit checks for production-write rejection, missing config display, private bucket enforcement and live-key rejection. No actual PayPal transaction or refund was submitted by the agent.
