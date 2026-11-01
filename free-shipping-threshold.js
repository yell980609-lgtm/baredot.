export const FREE_SHIPPING_THRESHOLD=100000;
// Preserve existing set/coupon benefits below the threshold.
export function withFreeShippingThreshold(html){return html.replaceAll('singleItemsOnly?3000:0','subtotal>=100000?0:(singleItemsOnly?3000:0)').replaceAll('baseShipping=items.length&&','baseShipping=subtotal>=100000?0:items.length&&')}
