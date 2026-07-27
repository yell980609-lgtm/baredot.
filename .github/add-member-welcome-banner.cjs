const fs=require('fs');
const file='_worker.js';
let source=fs.readFileSync(file,'utf8');
if(!source.includes('bare-member-welcome-banner-v1'))source+=String.raw`

/* bare-member-welcome-banner-v1 */
const bareMemberWelcomeStyle='<style id="bare-member-welcome-style">.member-welcome-banner{position:relative;display:grid;place-items:center;width:100%;min-height:clamp(250px,34vw,430px);margin:34px auto 0;overflow:hidden;background:#111;color:#fff;text-decoration:none}.member-welcome-banner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(.12) brightness(.5)}.member-welcome-banner:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.48))}.member-welcome-copy{position:relative;z-index:1;display:grid;justify-items:center;gap:10px;padding:28px 20px;text-align:center}.member-welcome-copy small{font:900 10px/1 InterDisplay,sans-serif;letter-spacing:.2em}.member-welcome-copy strong{font:900 clamp(34px,6vw,72px)/.88 InterDisplay,Arial,sans-serif;letter-spacing:-.045em}.member-welcome-copy span{font:900 clamp(13px,1.4vw,18px)/1.45 Pretendard,"Noto Sans KR",sans-serif}.member-welcome-copy b{display:inline-flex;align-items:center;min-height:38px;margin-top:5px;padding:0 16px;border:1px solid #fff;font:900 10px/1 InterDisplay,sans-serif}.login-wrap .member-welcome-banner{max-width:520px}.signup-shell .member-welcome-banner{max-width:900px}@media(max-width:600px){.member-welcome-banner{min-height:280px;margin-top:26px}.member-welcome-copy strong{font-size:42px}}</style>';
const bareMemberWelcomeMarkup='<a class="member-welcome-banner" href="/member/signup.html" aria-label="신규회원 웰컴팩"><img src="https://shop-phinf.pstatic.net/20260514_299/17787381562510SFCd_JPEG/57535494600578401_1343151862.jpg?type=o1000" alt="BARE. welcome pack temporary image"><span class="member-welcome-copy"><small>NEW MEMBER BENEFIT</small><strong>WELCOME<br>PACK</strong><span>신규회원 첫 구매 10% 할인<br>무료배송 혜택까지 자동 적용</span><b>10% OFF + FREE SHIPPING</b></span></a>';
function bareAddMemberWelcome(page){return page.replace('</head>',bareMemberWelcomeStyle+'</head>').replace('</main>',bareMemberWelcomeMarkup+'</main>')}
const bareMemberWelcomeLogin=simpleLoginPage;
simpleLoginPage=function(){return bareAddMemberWelcome(bareMemberWelcomeLogin())};
const bareMemberWelcomeSignup=signupPage;
signupPage=function(){return bareAddMemberWelcome(bareMemberWelcomeSignup())};
`;
fs.writeFileSync(file,source);
for(const path of ['.github/add-member-welcome-banner.cjs','.github/workflows/add-member-welcome-banner.yml'])if(fs.existsSync(path))fs.unlinkSync(path);
