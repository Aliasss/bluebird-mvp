# 인프라 용량·30명 동시 사용 위험 평가

**문서 버전**: 2026-05-04 v1
**대상 독자**: BlueBird CEO·senior-fullstack·운영자(현재 1인 동일)
**상태**: 베타 단계 — IM.1 모집 직전 (사용자 0명, 모집 후 ≤30명 invite-only)
**참조**: `docs/external/mvp-overview-2026-05-03.md` §6 (기술 스택), `docs/strategy/pmf-validation-plan.md` §0 (G2 게이트)

---

## 0. 한 줄 요약

| 항목 | 결과 |
|---|---|
| **30명 동시 사용 가능 여부** | ✅ 가능 (단 mitigations 2건 적용 *후*) |
| **잔여 위험** | Supabase Free shared CPU spike 시 P95 latency 변동 (감수 가능) |
| **G2 통과 후 추가 검토** | Supabase Pro($25/월) · Upstash Redis(rate limiter) |

---

## 1. 현재 인프라 구성 (2026-05-04 기준)

| 레이어 | 서비스 | Tier | 한도 |
|---|---|---|---|
| Hosting | Vercel | **Pro** | 함수 실행 60s까지 확장 가능 / 동시성 1000+ / bandwidth 1TB+/월 |
| Database·Auth | Supabase | **Free** | 500MB DB · 60 direct + 200 pool conn · 5GB bandwidth · **7일 무활동 시 pause** |
| AI | Google Gemini API | **Tier 1 (paid)** | gemini-2.5-flash 1,000 RPM / 1M TPM / 일 한도 매우 높음 |
| Frontend | Next.js 16 (App Router) + PWA | — | next-pwa Service Worker로 정적 자산 캐시 |

---

## 2. "30명 동시 사용"의 두 해석

진단 정확도를 위해 *동시*의 의미를 분리한다:

### 2.1 (a) 30명이 *같은 순간* 분석 호출 (worst case)
- 분석 시작 버튼을 30명이 동일 1초 내에 누르는 시나리오.
- 실제 베타에서 거의 발생하지 않음 (인지 디버깅은 사고 발생 시점 기록형 — 동기화 안 됨).
- 단 *일별 한도 리셋 직후*(KST 자정) 일부 사용자가 몰릴 가능성 있음.

### 2.2 (b) 30명이 *같은 날·시간대* 분포해서 사용 (실 운영)
- 1일 1~3회씩 *비동기* 사용 — 실제 동시 호출 1~5건 수준.
- 측정 결과 누적 부하: 30명 × 5 logs/day × 60일 = 9,000 row ≈ <10MB → Supabase Free 500MB 한도의 2% 미만.

본 문서의 mitigations은 **(a) worst case에서도 무너지지 않도록** 설계.

---

## 3. 식별된 위험·mitigations

### 3.1 P0 — Vercel 함수 타임아웃 (★ 적용 완료)

**위험**:
- Vercel Pro라도 함수 실행 *기본값은 ~15초*. `export const maxDuration` 명시 없으면 default 적용.
- `/api/analyze`는 (1) safety detect LLM + (2) main analyze LLM 두 번의 Gemini 호출을 **직렬**로 수행 → 5~15초 변동. 기본 한도 초과 시 504 에러.

**mitigation 적용** (commit 후속):
```ts
// app/api/analyze/route.ts
export const maxDuration = 60;

// app/api/generate-questions/route.ts
export const maxDuration = 60;
```
- 두 라우트만 적용. `/api/action`·`/api/intervention/answers`는 Supabase only이므로 기본값 유지.

**검증**: Vercel deploy 후 함수 settings에서 maxDuration=60 확인.

---

### 3.2 P1 — Supabase Free 7일 무활동 pause (★ 적용 완료)

**위험**:
- Supabase Free tier는 **7일간 어떤 요청도 없으면 프로젝트 자동 pause**.
- 다음 첫 요청 시 cold restart 수십 초~1분 지연 → 신규 사용자가 *접속 자체 실패하는 것처럼* 체감.
- IM.1 시나리오: 모집 → 1~2주 사용 → 인터뷰 코딩 페이즈에서 *공급 끊긴 며칠* 발생 가능.

**mitigation 적용**:

**(a) `/api/health` 엔드포인트 신설** (commit 후속):
- Supabase에 가벼운 SELECT(`logs.id` count head=true) 1건 → 200/503 응답.
- 인증 불필요 (익명 ping 가능). RLS 영향 없음. 민감 정보 노출 없음.
- 캐시 회피 (`export const dynamic = 'force-dynamic'`) — 매 ping이 실제 DB 도달.

**(b) UptimeRobot 5분 ping 설정 가이드**:

1. https://uptimerobot.com 무료 계정 가입 (50 모니터 무료).
2. **+ Add New Monitor** 클릭.
3. 설정값:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `BlueBird MVP Health`
   - **URL (or IP)**: `https://<your-vercel-domain>/api/health`
   - **Monitoring Interval**: **5 minutes**
   - **Monitor Timeout**: 30s
4. (선택) **Alert Contacts**: 이메일 추가 (다운 시 알림).
5. **Create Monitor** 저장.

**검증**: UptimeRobot 대시보드에서 24시간 후 uptime 99% 이상 + Supabase 프로젝트가 *Active* 상태 유지 확인.

---

### 3.3 P1 — Supabase Free shared CPU (감수)

**위험**:
- Free tier는 *shared* CPU. spike 시 P95 latency 50~500ms 변동 가능.
- 30명 동시 INSERT/SELECT는 견디지만 *outlier* 일부 발생 예상.

**조치**:
- 베타 기간 중 **측정만 수행**: Supabase Dashboard → Database → Query Performance.
- G2 통과·결제 인프라 후 Pro 전환 검토 (§5 참조).
- 사용자 영향 작은 수준 — 본질 위협 아님.

---

### 3.4 P2 — In-memory rate limiter cross-instance leak (감수)

**위험**:
- `lib/security/rate-limit.ts`는 `globalThis` Map — Vercel Lambda 인스턴스별 *상태 비공유*.
- 동시 요청이 다른 Lambda에 분산되면 분당 20회 cap이 사실상 *N×20*으로 누설.
- 영향 받는 라우트: `/api/action`(20/분), `/api/intervention/answers`(20/분).

**왜 P2인가**:
- 30명 규모에선 Lambda concurrent 수 제한적 → 누설 폭 작음.
- *보안 위반*이 아니라 *기능 한도 누설*. 사용자 abuse 시나리오 아님 (인지 디버깅은 abuse 인센티브 없음).
- `/api/analyze` 5/분·5/일 한도는 **Supabase 쿼리 기반**으로 cross-instance safe ✓.

**G2 후 검토**: Upstash Redis 전환 (§5 참조).

---

### 3.5 P3 — 기타 (현재 무이슈)

- **Vercel bandwidth**: Pro 1TB+/월. 30명 × 60일 베타 사용량 << 1GB. 무이슈.
- **PWA Service Worker**: 정적 자산 캐시 → bandwidth 절감 효과. 무이슈.
- **Cold start**: Vercel Pro에서 Lambda warm 유지 양호. 첫 hit 외 무문제.
- **Concurrent INSERT**: Supabase Free 60 direct conn으로 30명 충분.

---

## 4. 적용 액션 요약

| # | 작업 | 상태 | 검증 방법 |
|---|---|---|---|
| 1 | `/api/analyze` `/api/generate-questions`에 `maxDuration = 60` | ✅ 적용 (commit 후속) | Vercel 함수 settings 확인 |
| 2 | `/api/health` 신설 | ✅ 적용 (commit 후속) | 배포 후 `curl https://<domain>/api/health` → 200 응답 |
| 3 | UptimeRobot 5분 ping 등록 | ⏳ **CEO 직접** (§3.2 (b) 가이드) | UptimeRobot 대시보드에서 첫 ping 성공 확인 |

---

## 5. G2 통과 후 검토 항목 (사전 박지 않음)

PMF 게이트(`docs/strategy/pmf-validation-plan.md` §0) 통과 *후* 트리거되는 인프라 격상 후보:

### 5.1 Supabase Pro ($25/월)
- **트리거**: G2 통과 + 결제 인프라 활성화 + 사용자 수 ≥100 또는 DB 사용량 ≥80%.
- **이득**: idle pause 없음 / dedicated CPU / 8GB DB / 50GB bandwidth / daily backup / point-in-time recovery.
- **현 단계 비채택 사유**: 베타 0~30명에서 Free + UptimeRobot ping으로 충분. 사전 박지 않음.

### 5.2 Upstash Redis (rate limiter cross-instance shared)
- **트리거**: 사용자 수 ≥50 또는 abuse 시그널 관찰.
- **이득**: in-memory 누설 해소 / Lambda 인스턴스 간 일관된 한도.
- **비용**: 무료 tier 10K commands/day → 충분. 격상 시 $10/월 부근.
- **현 단계 비채택 사유**: 30명 규모에서 누설 폭 작음. 우선순위 낮음.

### 5.3 Sentry / 로깅 인프라
- **트리거**: G3 통과 + 기능 다변화.
- **이득**: 프로덕션 에러 추적 + 분포 분석.
- **현 단계**: `lib/logging/server-logger.ts`로 Vercel Logs surface — 기본 충분.

### 5.4 Vercel Edge Functions (선택)
- **트리거**: latency 민감 기능 surface (예: 실시간 안전 가드).
- **현 단계**: Node.js Lambda로 충분.

---

## 6. 모니터링 SOP (베타 운영 중)

**일별 점검** (CEO 1분):
- UptimeRobot 대시보드: uptime 100% 유지 확인.
- Supabase Dashboard → Reports: 일 활성 사용자·쿼리 수 추이.

**주별 점검** (CEO 5분, 일요일):
- Vercel Dashboard → Functions → Top Functions: `/api/analyze` p95 latency < 15s 유지.
- Supabase Dashboard → Database → Database Size: 80% 미만 유지.
- Gemini API 콘솔 → Usage: 일 RPM 추이 — 1,000 RPM 한도 30% 미만 유지.

**알림 트리거** (즉시 대응):
- UptimeRobot down 알림 → 5분 내 Supabase 콘솔 확인.
- Vercel 함수 504 에러 폭증 → Gemini API 콘솔에서 quota 상태 확인.

---

## 7. 문서 cross-link

- `docs/external/mvp-overview-2026-05-03.md` §6 — 기술 스택 전체.
- `docs/strategy/pmf-validation-plan.md` §0 — G2·G3 게이트 정의.
- `docs/im1/recruitment-package-2026-05-03.md` — IM.1 모집 패키지 (사용자 30명 cap).
- `CLAUDE.md` 작업 태도 §4 — 회귀 검증 표준 (tsc + vitest + lint:copy).

---

**작성**: senior-fullstack (CTO 권한 위임) · CEO 검토 2026-05-04
**개정 트리거**: (1) Supabase Pro 전환 시 §1·§5 갱신 (2) 사용자 수 30명 초과 시 본 문서 v2 신규.
