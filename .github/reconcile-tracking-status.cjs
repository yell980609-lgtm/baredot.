const fs = require('fs');
const workerPath = '_worker.js';
const marker = 'bare-reconcile-tracking-status-v1';
let source = fs.readFileSync(workerPath, 'utf8');
if (!source.includes(marker)) {
  source += String.raw`

/* bare-reconcile-tracking-status-v1 */
const bareAdminApiReconcileTracking = adminApi;
adminApi = async function(request, env, url) {
  const response = await bareAdminApiReconcileTracking(request, env, url);
  if (url.pathname === '/api/admin/summary' && request.method === 'GET' && response.ok) {
    try {
      const data = await response.clone().json();
      const stale = (data.orders || []).filter((order) => order.tracking_number && ['paid', 'confirmed', 'ready'].includes(order.fulfillment_status));
      if (stale.length) {
        const now = new Date().toISOString();
        await Promise.all(stale.map((order) => supabaseRest(env, 'orders?order_id=eq.' + encodeURIComponent(order.order_id), {
          method: 'PATCH',
          body: JSON.stringify({
            fulfillment_status: 'shipping',
            shipped_at: order.shipped_at || now,
            updated_at: now
          })
        })));
        const staleIds = new Set(stale.map((order) => order.order_id));
        data.orders = (data.orders || []).map((order) => staleIds.has(order.order_id) ? {
          ...order,
          fulfillment_status: 'shipping',
          shipped_at: order.shipped_at || now
        } : order);
        if (data.metrics) {
          data.metrics.shipping = data.orders.filter((order) => order.fulfillment_status === 'shipping').length;
          data.metrics.needAction = data.orders.filter((order) => ['paid', 'confirmed', 'ready'].includes(order.fulfillment_status)).length;
        }
      }
      return jsonResponse(data);
    } catch (error) {
      console.error('tracking status reconciliation failed', error);
    }
  }
  return response;
};

const bareCustomerOrdersReconcileTracking = customerOrdersApi;
customerOrdersApi = async function(request, env) {
  const response = await bareCustomerOrdersReconcileTracking(request, env);
  if (response.ok) {
    try {
      const data = await response.clone().json();
      data.orders = (data.orders || []).map((order) => order.tracking_number && ['paid', 'confirmed', 'ready'].includes(order.fulfillment_status) ? {
        ...order,
        fulfillment_status: 'shipping'
      } : order);
      return jsonResponse(data);
    } catch (error) {
      console.error('customer tracking status normalization failed', error);
    }
  }
  return response;
};

const bareAdminOrdersReconcileMarker = adminOrdersPage;
adminOrdersPage = function(env = {}) {
  return bareAdminOrdersReconcileMarker(env).replace('</body>', '<!-- bare-reconcile-tracking-status-v1 --></body>');
};
`;
  fs.writeFileSync(workerPath, source);
}
for (const path of ['.github/reconcile-tracking-status.cjs', '.github/workflows/reconcile-tracking-status.yml']) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
