const providers=[
 {url:'https://api.frankfurter.dev/v1/latest?base=USD&symbols=KRW',parse:d=>({rate:d.base==='USD'&&d.rates?.KRW,date:d.date,timestamp:Date.parse(d.date+'T00:00:00Z')})},
 {url:'https://open.er-api.com/v6/latest/USD',parse:d=>({rate:d.result==='success'&&d.base_code==='USD'&&d.rates?.KRW,date:new Date(Number(d.time_last_update_unix)*1000).toISOString().slice(0,10),timestamp:Number(d.time_last_update_unix)*1000})}
];
export async function fetchUsdKrwRate(fetcher=fetch,now=Date.now()){
 for(const provider of providers){try{const response=await fetcher(provider.url,{cache:'no-store',signal:AbortSignal.timeout(7000)});if(!response.ok)continue;const data=provider.parse(await response.json()),rate=Number(data.rate);if(!Number.isFinite(rate)||rate<500||rate>5000||!Number.isFinite(data.timestamp)||now-data.timestamp>4*86400000||data.timestamp>now+3600000)continue;return {rateKrwPerUsd:rate,date:data.date,source:provider.url,retrievedAt:new Date(now).toISOString()}}catch{}}
 throw Error('최신 원·달러 환율을 조회하지 못해 가격을 자동 입력하지 않았습니다. 잠시 후 어드민을 새로고침해주세요.');
}
export function fillMissingUsdPrices(settings,products,rate){
 const prices={...settings.prices};let filledCount=0;
 for(const product of products){const won=Number(product.price);if(!product.slug||Object.hasOwn(prices,product.slug)||!['published','soldout'].includes(product.status)||!Number.isFinite(won)||won<=0)continue;const dollars=Math.ceil(won/rate.rateKrwPerUsd);if(dollars<1||dollars>100000)continue;prices[product.slug]=dollars*100;filledCount++}
 return {...settings,prices,priceImport:{version:1,...rate,rounding:'ceil-whole-dollar',filledCount},updatedAt:new Date().toISOString()};
}
