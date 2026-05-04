# 백데이터 RAG 도입 검토 (2026-05-04)

**상태**: 보류 (G1 통과 + 추가 트리거 4건 충족 시 (a)만 재검토)
**검토자**: CTO, CSO
**검토 트리거**: 파운더 질문 — "백데이터를 RAG 형태로 활용하는 건 어떨까?"
**결론 한 줄**: **(a) 개인 패턴 RAG만 G1 이후 조건부 가능. (b)~(e) 모두 거부.** 이번 sprint 보류.

---

## 0. 컨텍스트

### 현재 AI 파이프라인 (RAG 검토 대상)
- 모델: `gemini-2.5-flash`, temperature 0.2, maxOutputTokens 4096
- 프롬프트 단일 진실원: `lib/ai/bluebird-protocol.ts` (Operating Principles 4 + Theory Summary 4 + Distortion Taxonomy 5 + Few-shot 7 + Korean Hedge Expressions + Trigger Category 8)
- 회귀 보호: `scripts/eval-distortion-fix.ts` (결정성 전제), 한국어 우회 어미 4겹 방어 (`8880f18`)
- 백데이터 활용 현 구현: SQL 기반 트리거 카테고리 매칭(`a4f7d26` `findTriggerRevisit`), 패턴 리포트(`7fd0c57`) — *모두 AI 분석 input 외부에서 별도 surface*

### 결제 가설 (의사결정 기준)
- A: "내가 변하고 있다는 증거" (BlueBird 핵심)
- B: "이걸 멈추면 후퇴한다" (락인)
- C: "한 번의 결정적 통찰" (자발 결제)

### 차별화 3축 (절대 무너뜨리지 말 것)
- 톤: 분석적·구조적 vs 정서·치유
- 자기상: 운영자 vs 회복 필요자
- 개입: 자동화·반증 vs 인간 코치·활동지

---

## 1. RAG 시나리오 5종

| # | 시나리오 | 설명 |
|---|---|---|
| (a) | **개인 패턴 RAG** | 사용자 *본인의* 과거 logs/analysis를 vector 검색해 새 분석에 context 주입 |
| (b) | 익명 풀 RAG | 다른 사용자(익명) 비슷한 케이스를 retrieval |
| (c) | 이론 문서 RAG | CBT 학술 chunk retrieval |
| (d) | 효과적 질문 retrieval | Δpain 양수 케이스의 소크라테스 질문 retrieval |
| (e) | 임베딩 재발 감지 | 현재 SQL 매칭(`a4f7d26`)을 임베딩 의미 유사도로 대체 |

---

## 2. 시나리오별 통합 판정

| # | CTO 판정 | CSO 판정 | 통합 | 핵심 근거 |
|---|---|---|---|---|
| **(a)** | G1 후 조건부 | 조건부 + 가드 4 | **G1 후 + 트리거 4 모두 충족 시** | 결제 가설 A 한계효용·SQL 매칭이 80% 가치 이미 제공 |
| **(b)** | 즉시 거부 | 영구 거부 | **영구 거부** | PIPA 회색지대 + 정서 동반 톤 미끄러짐 + 락인 #1·#2 자산 위협 |
| **(c)** | 거부 | 거부 (중복) | **거부** | `bluebird-protocol.ts`가 이미 *정적 RAG* 역할. 동적 retrieval로 바꾸면 단일 진실원 깨짐 + 회귀 fix(`8880f18`) 희석 |
| **(d)** | 거부 | 거부 | **거부** | Δpain confound 미통제(개입·시간경과·평균회귀) + 다른 사용자 텍스트 누출 위험 + 처방 톤 미끄러짐 |
| **(e)** | 거부 | 거부 | **거부** | `lib/insights/trigger-revisit.ts` SQL 매칭이 결정적·zero-cost·testable. 임베딩 교체는 결정성·비용·검증 모두 손해 |

---

## 3. (a) 개인 패턴 RAG 깊이 분석

### 3.1 정의
사용자가 새 trigger·thought 입력 시, 그 사용자의 과거 30~60일 logs/analysis 중 *의미적으로 비슷한 케이스*를 vector 검색해 AI 프롬프트의 context로 주입.

### 3.2 결제 가설 강화 평가
- **A 강화 후보**: "내 사고 지문 정밀화" — 분석가형이 *"이 시스템이 정말 나를 알고 있다"* 인상
- **한계효용**: 현재 SQL 매칭(category × dominant 왜곡 × 60일)이 80%+ 가치 제공 중. RAG는 *카테고리는 다르나 의미 유사한* 케이스만 추가 잡음
- **결제 의향까지 가는 falsifiable 경로 부재** — 측정 인프라(A/B) 미구축 상태

### 3.3 차별화 6축 영향
| 축 | 영향 |
|---|---|
| 톤 (분석적 vs 정서) | **양가** — *분석가 톤 강화*(사고 지문)와 *정서 챗봇 미끄러짐*(AI가 기억) 동시 가능 |
| 자기상 (운영자 vs 회복자) | **위험** — "운영자"에서 "관찰 대상"으로 미끄러질 수 있음 |
| 개입 (자동화 vs 인간 코치) | 자동화 강화 ✓ |
| 시간 (90일 검증 vs 영구 동반) | 90일 검증 → *영구 동반* 톤으로 미끄러질 위험 ⚠️ |
| 가격 | 압박 (§3.5) |
| 메타포 (디버깅 vs 거리두기) | 카피 가드 통과 시 디버깅 강화 가능 |

### 3.4 락인 메커니즘 영향
- **#1 한국어 fine-tuning** — 무관 (RAG는 한국어 자산 강화 X)
- **#2 직장·체면 맥락** — 강화 후보, *단 SQL 매칭으로 이미 80%+ 충족*
- **#3 패턴 누적 자기 지도** — **(a)의 유일한 진짜 락인 가치**. 의미 유사도가 SQL을 능가할 때만 marginal +
- **#4 분석가형 정체성** — *정적 코퍼스* 자산이라 RAG가 강화하지 않음. 오히려 *시각적으로 다른 챗봇과 동일* 위험

### 3.5 가격 가설 압박
- 임베딩(text-embedding) + 벡터 DB(pgvector·Supabase) + 추가 LLM context 토큰 → 사용자당 월 운영비 ↑
- 차별화 가격 가설(월 1.9~3.9만원, 디스턴싱 1/3~1/2)에 직접 압박
- 자동화 기반 저가 차별화는 *기능을 더 박는 것*이 아니라 *기능을 적게 박는 것*에서 옴

### 3.6 본질 위협 6 시그널
| # | 위협 | (a) 도입 시 |
|---|---|---|
| #1 카피 정서화 | RAG 결과 사용자 노출 시 "당신은 자주…" 톤 미끄러짐 ⚠️ |
| #3 "스트레스 관리" 입구화 | RAG inferred 라벨이 입구 카피화 위험 |
| **#4 정기 자기 라벨링** | **최대 위험.** "당신은 반복적으로 X 패턴" 자동 surface = AI 부여 정체성 수용 → 자율성 회복(장기 비전) 정면 충돌 |
| #6 "외롭지 않게" 동기 | *AI가 나를 기억한다*가 정서 동반 톤으로 흐를 위험 |

### 3.7 카테고리 정의 영향 (CSO 강조)
- RAG 도입은 우리를 **챗봇 카테고리에 기술적으로 가깝게** 만든다
- Wysa/Woebot/ChatGPT/Claude는 이미 메모리·RAG 보유. 사용자·언론·투자자 narrative에서 "AI 멘탈헬스 챗봇" 분류 압박
- 카테고리 락인(*우리만의 것*)이 약화
- "한국어 인지 디버깅 도구" 카테고리는 RAG 유무가 아니라 *개입 회로*(왜곡 분류 → 반증 → 행동 → 재평가)로 정의되어야 함

### 3.8 글로벌 챗봇 대비 비대칭 자산
ChatGPT 메모리·Claude Projects는 우월한 RAG 인프라 보유.
- (a) 도입 = 챗봇이 잘하는 트랙에서 약자 진입
- 우리 비대칭 자산: (i) 한국어 우회 어미 fine-tuning, (ii) 5대 왜곡 *구조화 출력*, (iii) 행동→재평가 *제품 형식*(대화 X, 단계 UI)
- RAG는 이 자산을 강화하지 않고 *분산*

---

## 4. (a) 박을 시점의 트리거 게이트

CTO 4 게이트 + CSO 4 트리거 = **8 항목 모두 충족 시에만 진행**.

### CTO 게이트 (순차)
- **G0**: 60일 G1 게이트 통과 (잔존 ≥15% / 자발 언급 ≥30% / 결제 의향 ≥20% / 임상 자문 ≥1)
- **G1**: 인터뷰에서 "내 과거 패턴 더 정밀히" 자발 언급 ≥3건
- **G2**: A/B 인프라 구축 (현재 *없음*) — control(SQL) vs treatment(개인 RAG) Δpain·자율성 비교 가능
- **G3**: `eval-distortion-fix.ts`에 RAG-on/off 결정성 회귀 케이스 추가, false negative 회귀 0건

### CSO 추가 트리거
- **T1**: G1 자발 언급의 *성격*이 분석가 톤 — "내 X 패턴이 Y 상황과 상관 있는지 보고 싶다" (진행 신호) vs "AI가 나를 기억해줬으면" (정서 동반 톤 = 거부 신호)
- **T2**: SQL 매칭 ceiling 도달 증거 — 현 매칭이 의미 유사도로 풀어야 하는 케이스를 놓치는 회귀 케이스 ≥5건
- **T3**: 카피 가드 사전 PR — RAG 결과의 사용자 노출 카피에서 "당신은 반복적으로", "AI가 기억한", "비슷한 사람들" 금지 grep 0건 (`scripts/lint-copy.ts` 확장)
- **T4**: 가격 영향 평가 — 사용자당 월 운영비 +α가 1.9~3.9만원 가설 깨지 않는 단위경제 사전 검증

### 기술 스택 (박을 시 정합)
- 임베딩: Gemini text-embedding-004 (모델 일관성)
- 벡터 DB: **Supabase pgvector** (인프라 정합)
- 인덱싱: 배치 (실시간 X — 비용·지연)
- retrieval 결과는 **기존 4계층 sanitize 통과 필수** (`lib/security/ai-guard.ts`)

---

## 5. 거부 시나리오 사유

### (b) 익명 풀 RAG — 영구 거부
- PIPA 회색지대 (다른 사용자 텍스트가 새 분석 input으로 들어감)
- 익명화·hash 분리해도 사고 1회에 신뢰 영구 손상
- 차별화 자산(한국어·체면) 신뢰 기반 위에 박을 자산을 *가설*로 위협
- "비슷한 사람들…" → 정서 동반 톤 ⚠️⚠️
- CSO 락인 #1·#2와 직접 충돌

### (c) 이론 문서 RAG — 거부
- 현재 `lib/ai/bluebird-protocol.ts` 347줄이 Operating Principles 4 + Theory Summary 4 + Taxonomy 5 + Few-shot 7로 *이미 정적 RAG 역할*
- 동적 retrieval로 바꾸면 단일 진실원 깨짐 + 회귀 fix(`8880f18` 한국어 우회 어미 4겹 방어)가 retrieval 결과로 희석
- 비용 > 효과

### (d) 효과적 질문 retrieval — 거부
- Δpain 라벨이 confound 미통제(개입·시간경과·평균회귀) → 노이즈 학습
- 다른 사용자 질문 텍스트 누출 위험((b)와 동일)
- "검증된 질문" → 처방 톤 미끄러짐

### (e) 임베딩 재발 감지 — 거부
- `lib/insights/trigger-revisit.ts`의 SQL 매칭(category × dominant × 60일)이 *결정적·testable·zero-cost*
- 임베딩 교체는 결정성·비용·검증 모두 손해
- 비용↑ 가격 가설 압박

---

## 6. 핵심 결론 (한 문장)

> 백데이터 RAG 중 (a) 개인 패턴 RAG만 G1 통과 + 8 트리거 모두 충족 시 박을 가치. 그 전엔 SQL 매칭 + 정적 RAG(`bluebird-protocol.ts`)로 *카테고리·락인·가격* 모두에 더 정합. (b)는 영구 거부.

---

## 7. 관련 파일

- `/home/user/bluebird-mvp/lib/ai/bluebird-protocol.ts` (정적 RAG 단일 진실원)
- `/home/user/bluebird-mvp/lib/openai/gemini.ts` (분석 파이프라인)
- `/home/user/bluebird-mvp/lib/insights/trigger-revisit.ts` (현 SQL RAG 역할)
- `/home/user/bluebird-mvp/scripts/eval-distortion-fix.ts` (결정성 전제 회귀 보호)
- `/home/user/bluebird-mvp/supabase/migrations/09_user_patterns_aggregates.sql` (RLS·anon_user_hash)
- `/home/user/bluebird-mvp/lib/content/archetypes.ts` (셀프 라벨링 baseline 위험)
- `/home/user/bluebird-mvp/scripts/lint-copy.ts` (카피 가드 — T3 확장 대상)
- `/home/user/bluebird-mvp/docs/strategy/positioning-and-vision-v1.md` (본질 위협 6)
- `/home/user/bluebird-mvp/docs/strategy/bluebird_competitive_strategy_v1.md` (차별화 3축)
- `/home/user/bluebird-mvp/docs/strategy/pmf-validation-plan.md` (G1 게이트)

---

*이 문서는 commit `004d882` (main) 기준 검토. 트리거 충족 시 본 문서 갱신 후 (a) 도입 검토 재개.*
