# 인프라 용량·30명 동시 사용 위험 평가

**문서 버전**: 2026-05-04 v3 (rev — Resend Path B 정정·자연 분산 정책 + 도메인 후 Resend 격상 백로그)
**대상 독자**: BlueBird CEO·senior-fullstack·운영자(현재 1인 동일)
**상태**: 베타 단계 — IM.1 모집 직전 (사용자 0명, 모집 후 ≤30명 invite-only)
**참조**: `docs/external/mvp-overview-2026-05-03.md` §6 (기술 스택), `docs/strategy/pmf-validation-plan.md` §0 (G2 게이트)

---

## 0. 한 줄 요약

| 항목 | 결과 |
|---|---|
| **30명 동시 사용 가능 여부** | ✅ 가능 (시스템 mitigations 2건 + 운영 정책 1건 적용 *후*) |
| **가장 큰 위험** (2차 검토 발견) | **Supabase Auth SMTP 시간당 30통 throttling** — IM.1 batch invite의 직접 위험. **즉시 조치는 시스템 변경 0 + CEO invite DM 자연 분산 (1~2일)**. 도메인 취득 시 Resend로 격상. |
| **잔여 위험** | Supabase Free shared CPU spike 시 P95 latency 변동 (감수 가능) |
| **G2 통과 후 추가 검토** | Supabase Pro($25/월) · Upstash Redis(rate limiter) |
| **백로그** | 도메인 취득(`.kr`/`.com`/`.app` ~₩15K) → Resend Custom SMTP 격상 (§3.0.2 SOP 보유) |

---

## 1. 현재 인프라 구성 (2026-05-04 기준)

| 레이어 | 서비스 | Tier | 한도 |
|---|---|---|---|
| Hosting | Vercel | **Pro** | 함수 실행 60s까지 확장 가능 / 동시성 1000+ / bandwidth 1TB+/월 |
| Database·Auth | Supabase | **Free** | 500MB DB · REST API ~2.5K req/sec · 5GB bandwidth · **7일 무활동 시 pause** · **내장 SMTP 30통/시간** |
| Email (송신) | **Supabase 내장 SMTP** (현재) → Resend (도메인 취득 후 격상) | 30통/시간 cap | 베타 단계는 자연 분산으로 운영 (§3.0.1). Resend 격상은 §3.0.2 백로그. |
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

> **2차 검토에서 추가** (2026-05-04 PM): §3.0 SMTP throttling이 1차 검토에서 누락된 *최대 위험*. IM.1 batch invite 시나리오에서 직접 가입 실패를 일으키므로 모집 시작 *전* 반드시 해소.
>
> 1차에서 "60 direct + 200 pool 커넥션" 우려는 *과대 평가*였음 — 본 프로젝트는 `@supabase/ssr` REST API 경유라 PostgreSQL direct connection 미사용. REST API는 ~2.5K req/sec 한도로 30명 규모 무이슈.

### 3.0 P0 — Supabase Auth SMTP throttling (★ 즉시 조치 = 운영 정책 / 시스템 변경 0)

> **v3 정정 (2026-05-04 PM late)**: 본 절의 v2는 "Resend Path B (resend.dev 임시 사용)"를 surface했으나 검증 결과 **작동 불가**. Resend의 Supabase SMTP 공식 가이드는 도메인 인증을 prerequisite로 명시. `onboarding@resend.dev` 발신은 *비공식·deliverability 매우 낮음*이라 IM.1 가입 funnel 손실 위험. v3에서 즉시 조치를 *운영 정책*으로 전환하고 Resend는 *도메인 취득 후* 백로그로 격상.

**위험** (변동 없음):
- 가입 코드(`app/auth/signup/page.tsx:63`) `supabase.auth.signUp({ emailRedirectTo: ... })`는 Supabase가 confirmation 이메일을 자동 발송.
- **Supabase Free 내장 SMTP**: 시간당 **30통 제한** (보안 SMTP는 더 보수적 — 4통/시간).
- IM.1 시나리오: CEO가 30명에게 *batch invite-only 액세스 안내* 발송 → 30명이 같은 1~2시간 내 가입 시도 → **이메일 throttle 발생 → 신규 가입 실패**.

#### 3.0.1 즉시 조치 — Supabase 내장 SMTP 유지 + invite DM 자연 분산

**시스템 변경 0건**. CEO의 합격자 안내 DM 발송 패턴만 *자연 분산*시키면 시간당 30통 cap에 거의 닿지 않음.

**근거**:
- IM.1 모집 흐름은 자연적으로 분산: 모집 공고 게시 → 응모 (1~2주에 걸쳐 누적) → 스크리닝 코딩 → CEO 합격자 선별 → 합격 DM 발송 → 합격자 가입.
- 마지막 단계(합격 DM 발송)에서 CEO가 *카톡 단톡방·일괄 BCC 메일·동시 발송 도구*를 쓰지 않으면, 합격자 30명이 같은 1시간 내 가입할 가능성 매우 낮음.
- 합격자가 DM 받는 시점·가입 페이지 접속 시점 자체가 *개인 일정에 따라* 자연 분산.

**CEO 운영 가이드**:
- 합격 DM은 *개별 메시지*로 전달 (Brunch DM·Disquiet DM·카톡 1:1).
- 30명을 *1~2일에 걸쳐* 분산 발송 — 예: 하루 10~15명, 또는 5명씩 시간대 다르게.
- *동시·일괄* 발송 도구 (메일머지·단톡방 멘션·자동화) 회피.
- 합격자에게 안내 카피 1줄 추가 권장: "*가입 후 confirmation 메일이 1~2분 안에 도착해요. 안 보이면 스팸함도 확인해주세요.*"

**모니터링**:
- Supabase Dashboard → Authentication → Logs에서 confirmation 발송 실패율 추적.
- 실패 1건 발생 시 — 사용자에게 직접 follow-up하여 *수동 confirm* 가능 (Supabase Dashboard → Users → "Confirm" 버튼).

#### 3.0.2 백로그 — 도메인 취득 후 Resend 격상

**트리거**: BlueBird 도메인(`.kr`/`.com`/`.app`) 취득 시 *즉시*.

**왜 도메인 취득이 종착점인가**:
- Resend는 Supabase SMTP 통합 시 도메인 인증 prerequisite (Resend 공식 가이드).
- 도메인 인증 시 SPF·DKIM·MX 4종 DNS 레코드로 *발신자 신뢰도* 확보 → deliverability ≥99%.
- 격상 후 Resend 무료 한도 3,000통/월 → 시간당 cap 사실상 해소.

**격상 SOP** (도메인 취득 후 실행):

##### Step 1. Resend API key 발급 (~3분)
1. https://resend.com 로그인 (계정 이미 보유 가정).
2. Dashboard → **API Keys** → **Create API Key**.
3. Name: `BlueBird Supabase Auth` / Permission: **Sending access**.
4. 생성된 API key (`re_xxx...`) 복사 → 안전한 곳에 보관 (1회만 표시).

##### Step 2. 도메인 인증 (~10분 + DNS 전파 대기)
1. Resend Dashboard → **Domains** → **Add Domain** → 본인 도메인 입력.
2. Region: **AWS US East (N. Virginia) - us-east-1** (기본값).
3. Resend 표시 4종 DNS 레코드를 도메인 등록업체(가비아·Namecheap·Cloudflare 등) DNS 관리 페이지에 추가:
   - **SPF**: TXT `send` → `v=spf1 include:amazonses.com ~all`
   - **DKIM #1**: CNAME `resend._domainkey` → `resend._domainkey.amazonses.com.`
   - **DKIM #2**: CNAME `resend2._domainkey` → `resend2._domainkey.amazonses.com.`
   - **DMARC** (권장): TXT `_dmarc` → `v=DMARC1; p=none;`
4. Resend Dashboard에서 **Verify DNS Records** 클릭 → 모두 ✓ 까지 대기 (5분~24시간).

##### Step 3. Supabase에 SMTP 등록 (~5분)
1. Supabase Dashboard → 프로젝트 → **Authentication** → **Settings** → **SMTP Settings**.
2. **Enable Custom SMTP** 토글 ON.
3. 입력값:
   - **Sender email**: `noreply@<your-domain>` (인증 완료 도메인)
   - **Sender name**: `BlueBird`
   - **Host**: `smtp.resend.com`
   - **Port number**: `465`
   - **Username**: `resend`
   - **Password**: §Step 1 API key
4. **Save**.

##### Step 4. 검증
1. 본인 *다른 이메일* 주소로 BlueBird 신규 가입 시도 (`/auth/signup`).
2. confirmation 이메일이 *본인 도메인 발신*으로 정상 도착 (스팸함 X).
3. Resend Dashboard → **Logs**에 발신 기록 1건 surface.

##### Step 5. 운영
- Resend Logs 일별 발송량 모니터링. 3,000통/월 cap의 10% 이내가 베타 정상 범위.
- 발신 실패율 ≥1% 시 도메인 인증 상태·DKIM 재확인.
- 격상 후 본 §3.0.1 *자연 분산* 운영 정책 *해소*. 메모리 시스템 자동 정리.

---

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

| # | 작업 | 우선순위 | 상태 | 검증 방법 |
|---|---|---|---|---|
| 1 | **invite DM 자연 분산 운영 정책** (1~2일에 걸쳐 합격 DM 분산 발송, 동시·일괄 도구 회피) | **P0 (모집 시작 단계 필수)** | ⏳ **CEO 운영** (§3.0.1) | Supabase Auth Logs에서 confirmation 발송 실패 0건 |
| 2 | `/api/analyze` `/api/generate-questions`에 `maxDuration = 60` | P0 | ✅ 적용 (50e53de) | Vercel 함수 settings 확인 |
| 3 | `/api/health` 신설 | P1 | ✅ 적용 (50e53de) | 배포 후 `curl https://<domain>/api/health` → 200 응답 |
| 4 | UptimeRobot 5분 ping 등록 | P1 | ⏳ **CEO 직접** (§3.2 (b) 가이드) | UptimeRobot 대시보드에서 첫 ping 성공 확인 |
| 5 (백로그) | 도메인 취득 + Resend Custom SMTP 격상 | P2 | ⏳ 도메인 취득 트리거 (§3.0.2) | 본인 다른 이메일로 가입 → 도메인 발신으로 정상 도착 |

**모집 시작 GO 조건**: #1·#2·#3·#4 ✅ 상태. #5는 도메인 취득 시점에 비동기 격상.

**자동 리마인드 메모리**: `memory/project_im1_smtp_stagger_reminder.md` — CEO가 "베타 테스터 선정 완료" 발화 시 자동 트리거. 도메인/Resend 등록 상태 확인 후 분산 가이드 surface.

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
**v2 개정 (2026-05-04 PM)**: 2차 검토에서 SMTP throttling P0 신규 발견 → §0 한 줄 요약·§1 인프라 표·§3.0 신설·§4 액션 표 갱신.
**v3 개정 (2026-05-04 PM late)**: Resend Path B(`onboarding@resend.dev` 임시 사용) 검증 결과 작동 불가 (Resend 공식 정책상 도메인 인증 prerequisite). §3.0 즉시 조치를 *시스템 변경 0 + 자연 분산 운영 정책*으로 정정. Resend는 도메인 취득 후 백로그로 격상. §4 액션 표 #1·#5 갱신.
**개정 트리거**: (1) Supabase Pro 전환 시 §1·§5 갱신 (2) 사용자 수 30명 초과 시 본 문서 v4 신규 (3) 도메인 취득 시 §3.0.2 백로그 격상 + 자연 분산 정책 해소.
