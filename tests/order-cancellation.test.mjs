import assert from 'node:assert/strict';
import {cancelAdminOrder,orderAmountSummary} from '../order-cancellation.js';
const base={order_id:'BARE-test',payment_key:'test-key',amount:67000,fulfillment_status:'paid',payment_status:'paid'};
async function run({order={...base},auth=true,payment={orderId:'BARE-test',totalAmount:67000,balanceAmount:67000,status:'DONE',method:'카드'},fail=false,saveFail=false,method='POST',expectedAmount}={}){
 let cancels=0,patches=0;const result=await cancelAdminOrder(new Request('https://site/api/admin/orders/BARE-test/cancel',{method,body:method==='GET'?undefined:JSON.stringify({reason:'고객 요청',expectedAmount})}),{TOSS_SECRET_KEY:'test'},'BARE-test',{
 requireAdmin:async()=>{if(!auth)throw Error('Unauthorized')},
 rest:async(e,p,o)=>{if(o){patches++;if(saveFail)throw Error('DB failed');const body=JSON.parse(o.body);assert.equal(body.payment_status,'cancelled');return[body]}return order?[order]:[]},
 fetchPayment:async(url,opt)=>{if(opt.method==='POST'){cancels++;assert(opt.headers['Idempotency-Key']);assert.deepEqual(JSON.parse(opt.body),{cancelReason:'고객 요청'});return Response.json(fail?{message:'취소 거절'}:{...payment,status:'CANCELED'},{status:fail?400:200})}return Response.json(payment)}
 });return{status:result.status,body:await result.json(),cancels,patches};
}
assert.equal((await run()).status,200);
for(const [args,code] of [[{auth:false},403],[{order:null},404],[{order:{...base,tracking_number:'123'}},409],[{order:{...base,payment_key:''}},409],[{payment:{orderId:'wrong',totalAmount:67000}},409],[{payment:{orderId:'BARE-test',totalAmount:67000,status:'PARTIAL_CANCELED',balanceAmount:100}},409]]){const r=await run(args);assert.equal(r.status,code);assert.equal(r.cancels,0);assert.equal(r.patches,0)}
let r=await run({fail:true});assert.equal(r.status,502);assert.equal(r.patches,0);
r=await run({saveFail:true});assert.equal(r.status,503);assert.equal(r.cancels,1);
r=await run({payment:{orderId:'BARE-test',totalAmount:67000,status:'CANCELED'}});assert.equal(r.status,200);assert.equal(r.cancels,0);assert.equal(r.patches,1);
r=await run({order:{...base,payment_status:'cancelled',fulfillment_status:'cancelled'}});assert.equal(r.cancels,0);assert.equal(r.status,200);
console.log('PASS cancellation, authorization, shipped/manual/mismatch/partial rejection, gateway failure, DB retry reconciliation and duplicate safety');

const discountedOrder={...base,amount:70500,items:[{price:75000,quantity:1}]};
const discountedPayment={orderId:'BARE-test',totalAmount:70500,balanceAmount:70500,status:'DONE',method:'카드'};
assert.deepEqual(orderAmountSummary(discountedOrder),{subtotal:75000,paid:70500,adjustment:-4500});
r=await run({order:discountedOrder,payment:discountedPayment,method:'GET'});assert.equal(r.status,200);assert.equal(r.body.paidAmount,70500);assert.equal(r.body.refundAmount,70500);assert.equal(r.cancels,0);assert.equal(r.patches,0);
r=await run({order:discountedOrder,payment:discountedPayment,expectedAmount:75000});assert.equal(r.status,409);assert.equal(r.cancels,0);assert.equal(r.patches,0);
r=await run({order:discountedOrder,payment:{...discountedPayment,totalAmount:75000},method:'GET'});assert.equal(r.status,409);assert.equal(r.cancels,0);assert.equal(r.patches,0);
r=await run({order:discountedOrder,payment:{...discountedPayment,status:'CANCELED',balanceAmount:0},method:'GET'});assert.equal(r.body.alreadyCancelled,true);assert.equal(r.cancels,0);assert.equal(r.patches,0);
console.log('PASS 75,000 product / 70,500 payment summary; read-only gateway preview; stale or mismatched amounts blocked');
