# 인프라 용량·30명 동시 사용 위험 평가

**문서 버전**: 2026-05-04 v2 (rev — 2차 검토에서 SMTP throttling P0 발견·Resend SOP 추가)
**대상 독자**: BlueBird CEO·senior-fullstack·운영자(현재 1인 동일)
**상태**: 베타 단계 — IM.1 모집 직전 (사용자 0명, 모집 후 ≤30명 invite-only)
**참조**: `docs/external/mvp-overview-2026-05-03.md` §6 (기술 스택), `docs/strategy/pmf-validation-plan.md` §0 (G2 게이트)

---

## 0. 한 줄 요약

| 항목 | 결과 |
|---|---|
| **30명 동시 사용 가능 여부** | ✅ 가능 (단 mitigations 3건 적용 *후*) |
| **가장 큰 위험** (2차 검토 발견) | **Supabase Auth SMTP 시간당 30통 throttling** — IM.1 batch invite의 직접 위험. Resend 무료 SMTP 등록으로 해소. |
| **잔여 위험** | Supabase Free shared CPU spike 시 P95 latency 변동 (감수 가능) |
| **G2 통과 후 추가 검토** | Supabase Pro($25/월) · Upstash Redis(rate limiter) |

---

## 1. 현재 인프라 구성 (2026-05-04 기준)

| 레이어 | 서비스 | Tier | 한도 |
|---|---|---|---|
| Hosting | Vercel | **Pro** | 함수 실행 60s까지 확장 가능 / 동시성 1000+ / bandwidth 1TB+/월 |
| Database·Auth | Supabase | **Free** | 500MB DB · REST API ~2.5K req/sec · 5GB bandwidth · **7일 무활동 시 pause** · **내장 SMTP 30통/시간** |
| Email (송신) | Supabase 내장 SMTP → **Resend (예정)** | Resend Free | 3,000통/월 무료 · 도메인 인증 시 deliverability 확보 |
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

### 3.0 P0 — Supabase Auth SMTP throttling (★ 적용 예정 — CEO 외부 작업 필요)

**위험**:
- 가입 코드(`app/auth/signup/page.tsx:63`) `supabase.auth.signUp({ emailRedirectTo: ... })`는 Supabase가 confirmation 이메일을 자동 발송.
- **Supabase Free 내장 SMTP**: 시간당 **30통 제한** (보안 SMTP는 더 보수적 — 4통/시간).
- IM.1 시나리오: CEO가 30명에게 *batch invite-only 액세스 안내* 발송 → 30명이 같은 1~2시간 내 가입 시도 → **이메일 throttle 발생 → 신규 가입 실패**.
- 사용자 입장에서는 *가입 버튼은 눌렸는데 confirmation 메일이 오지 않는* 상태 → 재시도 버튼 누름 → 더 많은 이메일이 큐에 적재 → 악순환.

**완화안 — Resend 무료 SMTP 등록** (CEO 결정: 옵션 (a)):

#### 3.0.1 사전 조건 — 도메인 보유 여부

본 SOP는 사용자(BlueBird CEO)가 *도메인을 보유하고 DNS 레코드 편집 권한이 있는지*에 따라 분기:

- **Path A — 도메인 보유 (예: `bluebird.kr`)**: Resend 풀 인증 → 프로덕션 deliverability 최상.
- **Path B — 도메인 미보유**: Resend 가입 후 *resend.dev 테스트 발신*으로 시작 → 이메일 일부 스팸 분류 가능. IM.1 단계만 임시 사용 후 G2 통과 시 도메인 취득 + Path A 격상.

**권장**: Path A. 베타 사용자가 confirmation 메일을 *스팸함*에서 찾아야 하면 가입 funnel 손실. 도메인 1년 비용 ~₩15,000 — IM.1 모집 가치 대비 무시.

#### 3.0.2 Resend 가입 (CEO 직접, ~5분)

1. https://resend.com 접속 → **Sign Up**.
2. 이메일(예: seob6615@gmail.com) + 비밀번호 가입.
3. 이메일 확인 후 로그인.
4. Dashboard → **API Keys** → **Create API Key**.
   - Name: `BlueBird Supabase Auth`
   - Permission: **Sending access** (full access 불필요)
   - **Domain**: 아래 §3.0.3 진행 후 등록한 도메인 선택. 도메인 미등록이면 일단 "All domains" 선택하고 §3.0.3 후 재발급 권장.
5. 생성된 API key (`re_xxxxxxxxxxxxxxxxxxx`) 복사 → 안전한 곳에 보관 (1Password 등).
   - **중요**: 이 key는 1회만 표시. 분실 시 재발급.

#### 3.0.3 도메인 인증 (Path A — 권장)

도메인이 있고 DNS 권한이 있는 경우:

1. Resend Dashboard → **Domains** → **Add Domain**.
2. 도메인 입력 (예: `bluebird.kr`). Region: **AWS US East (N. Virginia) - us-east-1** (Resend 기본).
3. Resend가 4종 DNS 레코드 표시 (SPF·DKIM 2개·MX·DMARC 권장):
   - **SPF**: TXT record `send` → `v=spf1 include:amazonses.com ~all`
   - **DKIM #1**: CNAME `resend._domainkey` → `resend._domainkey.amazonses.com.`
   - **DKIM #2**: CNAME `resend2._domainkey` → `resend2._domainkey.amazonses.com.`
   - **MX (피드백용)**: `feedback-smtp.us-east-1.amazonses.com` priority 10
   - **DMARC** (선택, 권장): TXT `_dmarc` → `v=DMARC1; p=none;`
4. 도메인 등록 업체(가비아·후이즈·Namecheap 등) DNS 관리 페이지에서 위 레코드 추가.
5. Resend Dashboard에서 **Verify DNS Records** 클릭 → 4종 모두 ✓ 표시까지 대기 (보통 5분~24시간).
6. 인증 완료되면 발신 가능 도메인으로 등록됨.

#### 3.0.3-Alt 도메인 미보유 (Path B — 임시)

도메인 취득 전 IM.1 시작이 시급한 경우:

- Resend 가입만 완료한 상태에서 발신 주소를 `onboarding@resend.dev`로 사용.
- **단점**: 일부 메일 서비스에서 *스팸 분류·도착률 저하* 가능. 가입 funnel 손실 위험.
- IM.1 5명 baseline 코딩 시점에 도메인 취득 + Path A 전환 강력 권장.

#### 3.0.4 Supabase에 SMTP 등록 (CEO 직접, ~5분)

1. Supabase Dashboard 접속 → 프로젝트 선택.
2. **Authentication** → **Settings** → **SMTP Settings** 섹션.
3. **Enable Custom SMTP** 토글 ON.
4. 다음 값 입력:
   - **Sender email**: `noreply@<your-domain>` (Path A) 또는 `onboarding@resend.dev` (Path B 임시)
   - **Sender name**: `BlueBird` (또는 `BlueBird (해솔)`)
   - **Host**: `smtp.resend.com`
   - **Port number**: `465` (SSL/TLS)
   - **Username**: `resend`
   - **Password**: 위 §3.0.2에서 생성한 API key (`re_xxx...`)
   - **Minimum interval between emails**: 60s (기본값 유지)
5. **Save** 클릭.

#### 3.0.5 검증

1. 본인 *다른 이메일* 주소로 BlueBird 신규 가입 시도 (`/auth/signup`).
2. confirmation 이메일이 *Resend 경유*로 도착하는지 확인:
   - 메일 헤더 → "Received: from ... amazonses ..." 또는 발신자 도메인이 Resend로 라우팅된 흔적
   - Resend Dashboard → **Logs** → 발신 기록 1건 surface.
3. confirmation 링크 클릭 → callback 페이지 정상 처리 확인.

#### 3.0.6 운영

- Resend Dashboard → **Logs**에서 일별 발신량 추적. 3,000통/월 cap의 10% 이내 유지가 베타 기준 정상.
- 발신 실패율 ≥1% 시 — 도메인 인증 상태·DKIM 레코드 재확인.
- IM.1 30명 batch invite 후 *가입 funnel*에서 confirmation 미수령 사용자 0명 확인 (CEO 직접 follow-up).

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
| 1 | **Resend SMTP 등록 + Supabase Auth SMTP 입력** | **P0 (모집 전 필수)** | ⏳ **CEO 직접** (§3.0 SOP 6단계) | 본인 다른 이메일로 가입 시도 → Resend Dashboard Logs 1건 확인 |
| 2 | `/api/analyze` `/api/generate-questions`에 `maxDuration = 60` | P0 | ✅ 적용 (50e53de) | Vercel 함수 settings 확인 |
| 3 | `/api/health` 신설 | P1 | ✅ 적용 (50e53de) | 배포 후 `curl https://<domain>/api/health` → 200 응답 |
| 4 | UptimeRobot 5분 ping 등록 | P1 | ⏳ **CEO 직접** (§3.2 (b) 가이드) | UptimeRobot 대시보드에서 첫 ping 성공 확인 |

**모집 시작 GO 조건**: 위 4건 모두 ✅ 상태일 것. #1·#4는 CEO 외부 작업이라 *모집 공고 게시 전 마감*.

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
**개정 트리거**: (1) Supabase Pro 전환 시 §1·§5 갱신 (2) 사용자 수 30명 초과 시 본 문서 v3 신규 (3) 도메인 취득 후 Resend Path B → A 전환.
