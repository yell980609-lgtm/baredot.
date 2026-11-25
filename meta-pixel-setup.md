# Meta Pixel

Pixel ID: **2846254909105262**.

The browser integration sends **PageView** after optional advertising measurement consent. It also counts storefront product/category hash navigation once per route change. The existing analytics-only acceptance does not opt a visitor into Meta measurement. Rejection, withdrawal, DNT and GPC prevent measurement. The Meta script is independent of the internal analytics database.

Live hosts are `baredot.pages.dev`, `baredot.kr`, and `www.baredot.kr`. Cloudflare deployment/branch preview URLs and localhost do not send events. Administrator, account, checkout/payment, cart, review-writing and sandbox pages are excluded, as are URLs containing authentication or personal-data parameters. No email, phone, order contents, advanced matching data, automatic events, AddToCart, Purchase, or server-side Conversions API events are configured by this integration. The script has no unconditional noscript image.

Consent choices are shown in the existing storefront notice. The privacy policy explains Meta measurement and offers withdrawal/change buttons. Withdrawing while the external script is loading also removes pending PageView calls. Rejected visitors can continue shopping.

## Verify in Meta

1. Open Meta Events Manager → the dataset/pixel with the ID above → **Test Events**.
2. Open the live website using the browser test option.
3. Accept the optional tracking notice, or use **Privacy policy → Change cookie choices** if previously rejected.
4. Confirm `PageView`; open a product and confirm the next `PageView`.

Use a browser without an ad blocker and with tracking permitted for this verification. Meta's dashboard reporting can be delayed. Test event receipt in the actual Meta account must be confirmed there; browser and worker tests use a mocked Meta library and never send test data to the real pixel.
