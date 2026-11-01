export function contactEmail(value){const email=String(value||'').trim();return /@(?:social|login)\.baredot\.kr$/i.test(email)?'':email}
export function cleanEmailDraft(value){const draft=value&&typeof value==='object'&&!Array.isArray(value)?{...value}:{};const domain=draft['email-domain']==='직접입력'?draft['email-domain-direct']:draft['email-domain'];if(/^(?:social|login)\.baredot\.kr$/i.test(String(domain||'').trim())){draft['email-id']='';draft['email-domain']='';draft['email-domain-direct']=''}return draft}
export function withCheckoutContactEmail(html){
 const helpers='<script id="bare-contact-email">window.bareContactEmail='+contactEmail.toString()+';window.bareCleanEmailDraft='+cleanEmailDraft.toString()+';</script>';
 return html.replace('</head>',helpers+'</head>')
 .replace('<select id="email-domain">','<select id="email-domain" required><option value="">선택</option>')
 .replace("const email=String(profile.contact_email||profile.email||user.email||''),parts=email.split('@')","const email=[profile.contact_email,profile.email,user.email].map(window.bareContactEmail).find(Boolean)||'',parts=email.split('@')")
 .replace("const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}},write=data=>", "const read=()=>{try{const stored=JSON.parse(localStorage.getItem(key)||'{}'),clean=window.bareCleanEmailDraft(stored);if(JSON.stringify(stored)!==JSON.stringify(clean)){try{localStorage.setItem(key,JSON.stringify(clean))}catch{}}return clean}catch{return{}}},write=data=>");
}
