import assert from 'node:assert/strict';
import {cancelAdminOrder} from '../order-cancellation.js';
const base={order_id:'BARE-test',payment_key:'test-key',amount:67000,fulfillment_status:'paid',payment_status:'paid'};
async function run({order={...base},auth=true,payment={orderId:'BARE-test',totalAmount:67000,balanceAmount:67000,status:'DONE',method:'카드'},fail=false,saveFail=false}={}){
 let cancels=0,patches=0;const result=await cancelAdminOrder(new Request('https://site/api/admin/orders/BARE-test/cancel',{method:'POST',body:JSON.stringify({reason:'고객 요청'})}),{TOSS_SECRET_KEY:'test'},'BARE-test',{
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
