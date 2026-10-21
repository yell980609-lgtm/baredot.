export const KAKAO_MARKETING_CONSENT_TEXT='[선택] 카카오톡으로 신상품·이벤트 등 광고성 정보 수신에 동의합니다.';
export const KAKAO_MARKETING_CONSENT_VERSION='2026-10-21';

// Generate evidence on the server. Strings and missing fields never count as consent.
export function signupKakaoMarketingConsent(metadata,now=new Date()){
 const granted=metadata?.marketing_kakao===true;
 return {granted,recorded_at:now.toISOString(),consented_at:granted?now.toISOString():null,version:KAKAO_MARKETING_CONSENT_VERSION,text:KAKAO_MARKETING_CONSENT_TEXT,source:'member_signup'};
}
export const signupAgreementControlsScript=`(()=>{
 const all=form.querySelector('#agreeAll');if(!all)return;
 const checkboxes=[...form.querySelectorAll('input[name="terms"],input[name="privacy"],input[name="smsMarketing"],input[name="emailMarketing"],input[name="kakaoMarketing"]')];
 const sync=()=>{const count=checkboxes.filter(input=>input.checked).length;all.checked=count===checkboxes.length;all.indeterminate=count>0&&count<checkboxes.length};
 all.addEventListener('change',()=>{checkboxes.forEach(input=>input.checked=all.checked);all.indeterminate=false});
 checkboxes.forEach(input=>input.addEventListener('change',sync));sync();
})();`;
export const kakaoMarketingConsentMarkup=`<div class="agreement-box"><div class="agreement-title"><span>카카오톡 소식 받기</span></div><label class="check-row kakao-marketing-consent" for="kakao-marketing"><input type="checkbox" id="kakao-marketing" name="kakaoMarketing">${KAKAO_MARKETING_CONSENT_TEXT}</label><p class="kakao-marketing-note">동의하지 않아도 회원가입할 수 있습니다. 주문·배송 안내와 별개인 광고성 소식 수신 동의입니다.</p></div>`;
export const kakaoMarketingConsentStyle='<style id="bare-kakao-marketing-consent-style">.kakao-marketing-consent{align-items:flex-start;gap:8px;line-height:1.6}.kakao-marketing-consent input{flex:0 0 auto;margin-top:4px}.kakao-marketing-note{margin:8px 0 0;color:#666;font:12px/1.6 system-ui,sans-serif}</style>';
