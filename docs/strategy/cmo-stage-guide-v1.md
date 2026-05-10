# CMO Stage 가이드 (v1)

**문서 버전**: v1 (2026-05-10)
**대상 독자**: Claude Code, 파운더, CMO·content-marketer·performance-marketer 페르소나
**목적**: CMO 조직(CMO + content-marketer + performance-marketer)의 *단계별 허용·비허용 작업 범위*를 명문화. CPO 명시적 비목표("외부 마케팅 — G3 통과 후")를 운영 차원에서 침범하지 않도록 한다.

**상위 기준점**: [`positioning-and-vision-v1.md`](./positioning-and-vision-v1.md)·[`bluebird_competitive_strategy_v1.md`](./bluebird_competitive_strategy_v1.md)·[`pmf-validation-plan.md`](./pmf-validation-plan.md). 본 문서는 그 *외부 표현·획득 채널 차원의 운영 가이드*.

---

## 한 줄 정의

> **"발견 가능성을 G3 전까지는 *준비*, G3 후에 *집행*"** — 차별화 3축이 외부 채널에서 무너지지 않게 가드하면서 단계별 자산만 누적.

---

## 1. Stage 정의 (PMF 게이트와 정렬)

| Stage | 시점 | PMF 게이트 정합 | 1차 미션 |
|---|---|---|---|
| **Stage 0** | 현재 ~ G2 진입 전 (베타 0명·IM.1 모집 직전) | 60일 게이트 진입 | IM.1 모집 인프라·자산 v0·전환 측정 인프라 준비 |
| **Stage 1** | G2 통과 ~ G3 진입 전 | 90일 게이트 — 자발 언급 ≥30%·잔존 ≥15% 측정 중 | 콘텐츠·랜딩·채널 prototype `launch ready` |
| **Stage 2** | G3 통과 후 | 결제 의향 ≥20% 확인됨 | 외부 마케팅 launch — 결제 가설 A 직결 |

**현재 위치**: Stage 0. IM.1 베타 테스터 30명 모집 직전.

---

## 2. Stage 0 — 허용·비허용 (현재 단계)

### 허용 작업

| 영역 | 책임 | 산출물 |
|---|---|---|
| IM.1 모집 인프라 | performance-marketer | 인터뷰 신청 페이지·DM 템플릿·SMTP stagger 가이드 |
| 모집 카피 | content-marketer | 분석가 톤 모집 메시지·랜딩 v0 |
| 전환 측정 인프라 | performance-marketer + data-analyst | UTM 스키마·이벤트 정의 (instrumentation 명세) |
| SMTP deliverability 가드 | performance-marketer | 30명 invite 분산(stagger) — 도메인 미취득 상태에서 유효 |
| 콘텐츠 자산 *작성* | content-marketer | 블로그·SNS·랜딩 카피 stockpile (발행 X) |
| 브랜드 voice 가드 | content-marketer + CMO | 분석가 톤 어휘 사전·회피 어휘 사전 |

### 비허용 (Stage 0 위반 시 즉시 ⚠️)

- 외부 유료 광고 (Naver/Google/Kakao SA·DA 등)
- 블로그·SNS *발행* (작성은 OK, 발행은 Stage 1+)
- SEO 키워드 캠페인 (매핑은 OK, 노출 캠페인은 Stage 1+)
- 인플루언서 협업
- 결제 캠페인·할인 코드
- "스트레스 관리"·"위로"·"치유" 어휘 (영구 가드 — 본질 위협 #1·#3)

### Stage 0 → Stage 1 이행 트리거

다음 모두 충족 시 CMO·CPO 합의 후 Stage 1 진입:
- IM.1 베타 테스터 30명 확정 (모집 인프라 검증)
- 첫 인터뷰 batch 완료 (자발 언급 코딩 baseline 확보 — strategy-manager)
- 60일 게이트(자발 언급 ≥30% 시그널) 통과

---

## 3. Stage 1 — 허용·비허용 (G2 ~ G3)

### 허용 작업

| 영역 | 책임 | 산출물 |
|---|---|---|
| Attribution·CAC/LTV 인프라 ready | performance-marketer + data-analyst | UTM·multi-touch attribution·LTV 시뮬레이션 |
| 채널 prototype 테스트 | performance-marketer | 소규모 budget(<5만원/주·코호트당 N≥30) — baseline 수립용 |
| 콘텐츠 launch | content-marketer | 블로그·SNS organic 발행 — risk-manager 사전 검토 |
| SEO 키워드 매핑·메타데이터 | content-marketer | 분석가 어휘 internal-link 강화 |
| 랜딩 v1 | content-marketer + product-designer | 외부 vs 내부 카피 영역 분리 |

### 비허용 (Stage 1 위반 시 즉시 ⚠️)

- 본격 유료 광고 (>5만원/주 budget)
- 결제 캠페인·할인 코드
- 인플루언서 paid 협업
- 가격 가설 변경 (월 1.9~3.9만원 가설 보호 — 본질 위협 #5)
- LTV/CAC <3:1 채널 budget 확대

### Stage 1 → Stage 2 이행 트리거

다음 모두 충족 시 CMO·CPO·CSO 합의 후 Stage 2 진입:
- 90일 게이트 통과 (자발 언급 ≥30% + 잔존 ≥15% + 결제 의향 ≥20%)
- LTV/CAC baseline 수립 (data-analyst 검증)
- risk-manager 표시광고법 사전 검토 완료
- 차별화 3축 외부 표현 정합 검증 (CSO 승인)

---

## 4. Stage 2 — 외부 마케팅 launch

### 허용 작업

| 영역 | 책임 | 가드 |
|---|---|---|
| 유료 광고 launch | performance-marketer | LTV/CAC ≥3:1 가드·1차 타겟 3축 정합 targeting |
| 결제 캠페인 | performance-marketer + CMO | 가격 가설(월 1.9~3.9만원) 정합 |
| 본격 SEO·콘텐츠 캠페인 | content-marketer | 분석가 톤 일관성·"스트레스 관리" 입구화 X |
| 인플루언서 협업 | performance-marketer + content-marketer | 분석가형 인플루언서(데이터 분석가·BA·연구자)·직무 narrowing X |

### 영구 가드 (모든 Stage 공통)

| 가드 | 트리거 |
|---|---|
| 챗봇 카테고리 어휘 ("AI 친구"·"대화 상대") | **영구 비목표** — 거부 |
| "스트레스 관리"·"위로"·"치유" 입구화 | **본질 위협 #1·#3** — 즉시 ⚠️ |
| 가격 디스턴싱 수렴 (>월 5만원) | **본질 위협 #5** — 즉시 ⚠️ |
| "외롭지 않게" 류 기획 동기 | **본질 위협 #6** — 즉시 ⚠️ |
| 직무 narrowing targeting (BA·PM·엔지니어 enumerate 단독) | 1차 타겟 3축 위배 — 거부 |
| 의료 효능 표현 | 의료기기법·표시광고법 위반 — risk-manager 거부 |

---

## 5. 차별화 3축 외부 표현 가드 (전 Stage 공통)

매 외부 메시지·콘텐츠·채널 카피·광고 크리에이티브 점검:

| 축 | BlueBird (보호) | 디스턴싱 (회피) |
|---|---|---|
| 톤 | 분석적·구조적 ("분석", "디버깅", "패턴", "구조") | 정서적·치유적 ("따뜻한", "함께", "위로") |
| 자기상 | 운영자·항해사·디버거 | 회복 필요자 |
| 개입 | 자동화·반증 질문·재평가 회로 | 인간 코치·활동지 |
| 시간 | 90일 검증 (falsifiability) | 3개월 체화 |
| 가격 | 월 1.9~3.9만원 (자동화 가설) | 월 8~10만원 (코치 인건비) |
| 메타포 | 디버깅·OS·항해 | 치유·동반·거리두기 |

축 중 하나라도 디스턴싱 쪽으로 0.5칸 움직이면 즉시 ⚠️ → CSO 환기.

---

## 6. 본질 위협 채널별 1차 책임 분담

| 본질 위협 | 1차 책임 (외부) | 협업 |
|---|---|---|
| #1 카피 정서화 | content-marketer (외부 채널 카피) | product-designer (앱 내), strategy-manager (전사) |
| #2 디자인 감성화 | content-marketer (랜딩·SNS 비주얼) | product-designer (앱 내) |
| **#3 "스트레스 관리" 입구화** | **content-marketer (SEO·메뉴·랜딩) + CMO (외부 메시지 톤 일관)** | strategy-manager (전사) |
| #4 정기 자기 라벨링 | (CMO 영역 외 — CPO·designer 책임) | — |
| **#5 가격 디스턴싱 수렴** | **performance-marketer (가격 가설 변경 시점 1차 검토) + CMO** | CSO (가격 정의) |
| **#6 기획 동기 "외롭지 않게" 흐름** | **CMO (외부 캠페인 기획 의도서 1차 점검)** | strategy-manager (전사) |

---

## 7. 권한·책임 매트릭스 (CMO 조직 ↔ 기존 조직)

| 결정 영역 | CMO 조직 | 외부 조직 |
|---|---|---|
| 카테고리 정의·차별화 3축 *근본 정의* | 정합 점검·환기 | **CSO** (정의 책임) |
| 제품 비목표·PMF 게이트·1차 타겟 정의 | Stage 가드·환기 | **CPO** (정의 책임) |
| 표시광고법·PIPA·개인정보 트래킹 | 사전 검토 받기 | **risk-manager** (검토 책임) |
| 앱 내 마이크로카피·시각·UX | (영역 외) | **product-designer** |
| 외부 채널·랜딩·블로그·SNS·광고 | **CMO 조직 책임** | — |
| 콘텐츠·SEO·브랜드 voice | **content-marketer** | — |
| 채널 운영·CAC/LTV·attribution·IM 모집 | **performance-marketer** | data-analyst (통계 분석) |
| 측정 인프라·실험 통계 | 채널 분석 의뢰 | **data-analyst** (분석 책임) |
| 자발 언급 코딩·정성 해석 | 어휘 오염 방지 | **strategy-manager** |

CMO·CPO·CSO 충돌 시: 사용자(CEO)에게 명시적 보고 + 결정 요청.

---

## 8. 변경 이력

| 버전 | 일자 | 변경 |
|---|---|---|
| v1 | 2026-05-10 | 초안 — CMO 조직 신설(cmo·content-marketer·performance-marketer)에 따른 Stage 0/1/2 가이드·본질 위협 채널 분담·권한 매트릭스 명문화 |
