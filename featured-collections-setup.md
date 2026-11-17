# 홈 컬렉션 연결

- 왼쪽 MEET OUR SIGNATURE → `/collections/signature`: SIGNATURE CUT-OUT HALTER TOP _ CHOCOLATE, #I'M BARED HALTER TOP.
- 오른쪽 WINE PAIRING EDITION → `/collections/wine-pairing`: SLIM RAGLAN OFF-SHOULDER T-SHIRT_BABY PURPLE, WIDE FOLDING LEGGINGS (2 COLORS), LABEL DETAIL HALTER TOP_PURPLE WINE, LABEL DETAIL HALTER TOP_BLACK.

시그니처는 기존 상품 slug 또는 상품명으로, 와인은 표기상 공백·구두점 차이를 제거한 상품명으로 선택합니다. 각 항목당 1개만 표시하며 draft/숨김 상품은 제외합니다. 상품명·slug를 크게 바꾸면 featured-collections.js의 연결 규칙도 갱신해야 합니다. 가격·사진·판매 상태는 기존 공개 상품 API의 최신 정보를 사용하며 상품 클릭 시 기존 상품 상세 화면으로 이동합니다.

별도 DB·SQL은 필요하지 않습니다. 기존 패널 설정은 다음 조회부터 새 컬렉션 링크로 연결되며 사진·제목을 유지합니다. 이후 어드민에서 다른 링크를 저장하면 해당 설정을 따릅니다. API 장애는 빈 목록으로 처리하지 않고 503과 재시도 안내를 표시합니다.

## 홈 카테고리 분리

Bras & Tanks는 `/women/bras-tanks`, Activewear는 `/women/activewear`로 연결합니다. 여성 상의 중 커버업 슬리브리스(카모 포함)와 래글런 오프숄더 제품군은 Bras & Tanks에서 제외하고 Activewear로 표시합니다. Activewear에는 기존 레깅스·세트 등 브라/탱크 이외 여성 상품도 표시합니다. 전체 WOMEN/TOPS 목록과 상품 원본 데이터는 유지합니다. 홈 Bras & Tanks 자동 썸네일에서도 커버업·래글런을 제외합니다.
