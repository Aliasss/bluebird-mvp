# 자동 미팅 Routine 설계 (v1)

**문서 버전**: v1 (2026-05-10)
**대상 독자**: Claude Code, 파운더, 14 페르소나
**목적**: 14명 페르소나 조직이 *사용자 명령 없이* 매일·매주 자동으로 모여 시스템·MVP 건강도를 점검하고 회의록·action을 archive하는 routine 시스템 설계 명세.

**상위 기준점**: [`positioning-and-vision-v1.md`](../../strategy/positioning-and-vision-v1.md)·[`pmf-validation-plan.md`](../../strategy/pmf-validation-plan.md)·[`cmo-stage-guide-v1.md`](../../strategy/cmo-stage-guide-v1.md). 본 문서는 그 *운영 cadence·자동화 인프라*.

---

## 1. 배경·목적

### 왜 필요한가

- 14 페르소나는 사용자가 명시 호출해야만 작동 → *지속 시그널*이 발생하지 않음
- PMF 게이트(60일·90일·G3)는 daily/weekly 점검이 필요하나 사용자가 매일 모든 영역을 surface 요청하기 어려움
- 본질 위협 신호(#1·#3·#5·#6) 누적 트렌드는 시계열 비교가 필요 — 일회성 대화로는 감지 어려움

### 목표

매일·매주 정해진 시간에 페르소나 조직이 자동으로 모여:
1. *현재 시스템·MVP 상태*를 점검 (git·strategy docs·CEO 사전 메모)
2. *영역별 시그널*을 surface (PMF 진척·차별화·기술 안정·CMO Stage 등)
3. *합의된 action items*를 live tracker로 누적·추적
4. *회의록 archive*로 시계열 추적 가능 상태 유지

### 비목표 (이번 spec 범위 외)

- Vercel·Supabase 외부 메트릭 자동 수집 (G2/G3 단계로 격상)
- GitHub Issues 자동 생성 (베타 0명 단계엔 노이즈 과잉)
- Slack·이메일 알림 통합 (필요 시 후속 spec)
- 페르소나 frontmatter 모델 변경 (현재 모두 `model: opus` 유지)

---

## 2. 아키텍처 개요

```
                ┌─ 월~목 09:00 KST ──┐    ┌─ 금 18:00 KST ──┐    ┌─ 토 09:00 KST ──┐
                │ Daily Standup       │    │ Weekly All-Hands │    │ Cost Retrospect  │
                │ Routine             │    │ Routine          │    │ Routine          │
                └────────┬────────────┘    └────────┬─────────┘    └────────┬─────────┘
                         │                          │                       │
                         ▼                          ▼                       ▼
                [Anthropic Cloud Routines — Max plan subscription 차감]
                         │                          │                       │
                         ▼                          ▼                       ▼
                  Orchestrator 모드           Parallel Dispatch          간단 점검
                  (Opus 1세션 채널링)          (14 페르소나 Opus 병렬)    (Sonnet 1세션)
                         │                          │                       │
                         ▼                          ▼                       ▼
                  YYYY-MM-DD-standup.md      YYYY-MM-DD-weekly-          _retrospect/
                                              allhands.md                YYYY-MM-DD.md
                         │                          │                       │
                         └────────────┬─────────────┴───────────────────────┘
                                      ▼
                              docs/meetings/_actions.md
                              (live tracker — carry-over 포함)
                                      ▼
                              git fetch → ahead/behind 확인 → push
                              (사용자 git push 검증 규칙 적용)
                                      ▼
                              docs/meetings/_heartbeat.log
                              (routine 성공·실패·skip 1줄 기록)
```

---

## 3. Daily Standup (월~목 09:00 KST)

### 3.1 Cron

```
bluebird-daily-standup: 0 9 * * 1-4  (KST)
```

### 3.2 모델·dispatch 모드

- Orchestrator: **Opus**
- Sub-persona dispatch: 페르소나 frontmatter `model: opus` 그대로 적용 (변경 없음)
- 모드: **Orchestrator 채널링** — 1 세션이 input 흡수 후 페르소나를 sequential 채널링 (parallel dispatch 아님)

### 3.3 Phase 1 — Input 흡수

| Step | Action |
|---|---|
| 1.1 | `git log --since="24 hours ago" --pretty=format:'%h %s' --name-only` — 24시간 커밋·diff 영역 |
| 1.2 | `docs/meetings/_pending/agenda.md` 또는 `agenda-YYYY-MM-DD.md` (date ≤ today) 존재 시 읽기 → 1번 의제로 흡수 (사용법 §6.3) |
| 1.3 | `docs/meetings/_actions.md` 미완 actions 로드 (carry-over) |
| 1.4 | 변화 영역 매핑 (§3.4 표 참조) → 호출할 산하 페르소나 결정 |

### 3.4 변화 영역 → 산하 페르소나 매핑

| 변화 영역 (path glob) | 호출할 산하 페르소나 |
|---|---|
| `lib/ai/`·`lib/openai/` | senior-fullstack-engineer · senior-qa-engineer |
| `lib/intervention/`·`lib/insights/`·`lib/review/` | product-owner · data-analyst |
| `lib/notifications/`·`app/api/push/` | senior-fullstack-engineer · risk-manager |
| `lib/safety/`·`app/safety/` | risk-manager · senior-qa-engineer |
| `lib/onboarding/`·`app/onboarding/` | senior-ux-researcher · product-designer |
| `app/(public)/`·`app/our-philosophy/`·`app/manual/`·랜딩 카피 | content-marketer · product-designer · strategy-manager |
| `app/api/notifications/event/`·`lib/analytics/` | data-analyst · product-owner |
| 가격·결제 관련 (`app/beta-incentive/`, README) | cmo · performance-marketer · cso |
| `migrations/` (Supabase) | senior-fullstack-engineer · senior-qa-engineer · risk-manager |
| `docs/strategy/` 변경 | strategy-manager + 변경 영역 임원 |
| `_pending/agenda.md` 명시 호명 | 호명된 페르소나 |

여러 영역 변화 시 합집합. 중복 호출은 1회로.

### 3.5 Phase 2 — 발언 라운드

**임원 4명 standing routine items (매일 발언)**:

| 임원 | 점검 항목 | 변화 없을 시 |
|---|---|---|
| CPO | PMF 게이트 진척 (자발 언급 / 30일 잔존 / 결제 의향) | "no movement, IM.1 모집 대기" |
| CSO | 차별화 3축 정합성·디스턴싱 외부 변화·글로벌 챗봇 한국어 진입 시그널 | "no shift detected" |
| CTO | hot path 안정·회귀 가드·migration·안전 가드 상태 | "stable, no incidents" |
| CMO | Stage 0 진척 (IM.1 모집·자산 stockpile·본질 위협 #1·#3·#5·#6 외부 채널 시그널) | "Stage 0, IM.1 모집 인프라 준비 중" |

**산하 페르소나 (트리거 시만 발언)**:
- §3.4 매핑에서 호출된 페르소나만
- agenda.md 명시 호명자 자동 호출
- 본인 영역 변화에 대한 코멘트 + carry-over actions 진척 보고

### 3.6 Phase 3 — Action items 추출

- 본문에서 `**Action**:` 또는 `Action:` 패턴 추출 → `_actions.md`에 추가
  - 형식: `- [ ] [owner] [due] action 내용 (출처: YYYY-MM-DD standup)`
- carry-over open actions 중 *24h 커밋이 해결한 것* 자동 close (commit hash 기재)
- `_actions.md`는 `Open` / `Closed (this week)` / `Closed (archive)` 3 섹션 유지

### 3.7 Phase 4 — Commit·push

```
1. git status (untracked/modified 확인)
2. git add docs/meetings/YYYY-MM-DD-standup.md docs/meetings/_actions.md
3. agenda.md 처리 시: git rm docs/meetings/_pending/agenda.md
4. _heartbeat.log에 [ts] standup OK / FAIL 1줄 append
5. git commit -m "docs(meetings): standup YYYY-MM-DD"
6. git fetch origin main
7. git log HEAD..origin/main 비어있을 때만 push
   - 차있을 시: heartbeat에 "PUSH BLOCKED: behind by N" 기록 + commit은 로컬 보존
```

### 3.8 Quiet day 처리 (3 케이스)

| 케이스 | 조건 | 동작 |
|---|---|---|
| 1 완전 조용 | agenda 없음 + git 24h 변화 0 | 임원 4명 standing items만 점검. `## 0. Quiet day` 헤더 명시. ~1~3KB |
| 2 부분 조용 | agenda 없음 + git 일부 변화 | 매핑된 산하 + 임원 4명. 정상 길이 |
| 3 정체 감지 | 3일+ 연속 케이스 1 | Emergent agenda 자동 생성: CPO에 "3일째 git 0 + agenda 0. 무엇이 막고 있는가?" 질문 추가 |

---

## 4. Weekly All-Hands (금 18:00 KST)

### 4.1 Cron

```
bluebird-weekly-allhands: 0 18 * * 5  (KST)
```

### 4.2 모델·dispatch 모드

- Orchestrator: **Opus**
- 14 페르소나 **parallel dispatch** (각 페르소나 frontmatter `model: opus` × 14)
- 토큰 소비의 ~80% 차지 — 본 시스템의 주된 비용 항목

### 4.3 Phase 1 — 주간 input 흡수

- 7일 git log + 주간 commit 통계 (영역별 빈도)
- 주간 standup minutes 4개 (`YYYY-MM-DD-standup.md`) 모두 로드
- 주간 `_actions.md` 변화 (open → closed 비율, 미완 carry-over 누적)
- 핵심 strategy docs 현재 상태:
  - `pmf-validation-plan.md` 게이트 진척
  - `development-backlog.md` Tier 분류·결제 가설 A
  - `cmo-stage-guide-v1.md` Stage 위치
- `docs/meetings/_pending/agenda.md` 또는 `agenda-YYYY-MM-DD.md` (date ≤ today) 흡수 (§6.3)

### 4.4 Phase 2 — 발언 라운드 (parallel dispatch)

**기존 회의록 포맷 준용** ([`2026-05-03-all-hands-priority-agenda.md`](../../meetings/2026-05-03-all-hands-priority-agenda.md) 형식):

```markdown
# BlueBird 주간 All-Hands — YYYY-MM-DD

**일시**: YYYY-MM-DD 18:00 KST
**참여자**: CEO + 14명
**주재**: CEO (자동 routine, 사용자 부재 시 명목적)
**기록**: senior-qa-engineer (회의록 정합성 독립 검증)
**목적**: 주 마감 deep 합의 — 향후 1~2주 절박 아젠다·미완 actions·전략 시그널

## 0. 현황 (개회 시점 기준)
[git 통계·게이트 진척·_actions 요약 표]

## 1. CEO 개회
[CEO agenda.md 인풋이 있으면 인용, 없으면 routine standing items]

## 2. 발언 라운드
### 2.1 CPO
### 2.2 CSO
### 2.3 CTO
### 2.4 CMO
### 2.5 product-designer
### 2.6 product-owner
### 2.7 senior-ux-researcher
### 2.8 data-analyst
### 2.9 strategy-manager
### 2.10 risk-manager
### 2.11 senior-fullstack-engineer
### 2.12 senior-qa-engineer
### 2.13 content-marketer
### 2.14 performance-marketer

## 3. 충돌 토론
[Synthesizer가 충돌 지점 검출 → 트레이드오프 표 제시]

## 4. 합의
[합의 사항·CEO 결정 필요 항목 ⚠️ 표시]

## 5. Action items (다음 주)
[owner·due·trigger 명시. _actions.md에 자동 추가]
```

각 페르소나는 자기 1차 참조 문서 읽고 1~2 아젠다 + 반론 인지 + carry-over 진척 보고.

### 4.5 Phase 3 — 충돌·합의

- Synthesizer (orchestrator)가 §2 발언들에서 *명시적 충돌* 검출
- 충돌 지점은 §3 충돌 토론 표로 정리: `위치 A vs 위치 B / 트레이드오프 / CEO 결정 필요 여부`
- 합의된 항목은 §4로
- CEO 결정 필요 항목은 ⚠️로 surface (사용자가 다음 회의 또는 직접 회의록에 결정 기입)

### 4.6 Phase 4 — Action items 정합

- 합의된 items가 `_actions.md`에 추가 (owner=페르소나, due=다음 주 금)
- Carry-over 미완 ≥3주는 ⚠️ "장기 미완 — 재할당/취소 결정 필요" 마킹
- 중복 actions 통합

### 4.7 Phase 5 — Commit·push

§3.7과 동일 흐름. 파일명 `YYYY-MM-DD-weekly-allhands.md`.

---

## 5. Saturday Retrospect (토 09:00 KST, 첫 4주)

### 5.1 Cron

```
bluebird-saturday-retrospect: 0 9 * * 6  (KST)
```

**4주 운영 후 재평가** — 안정화 시 격주·월간으로 격하 또는 삭제.

### 5.2 모델·dispatch 모드

- Orchestrator: **Sonnet 4.6** (간단 점검이라 비용 절감)
- Sub-persona dispatch 없음

### 5.3 점검 항목

- 지난 7일 routine 성공률 (heartbeat.log 기반)
- 토큰 사용량 (사용자가 `claude.ai/settings/usage`에서 직접 확인 후 회의록에 기재)
- `_actions.md` open/closed 비율·≥3주 미완 항목
- 본질 위협 시그널 누적 (지난 주 minutes에서 ⚠️ 빈도)
- 회의 cadence 격하 권고 (필요 시)

### 5.4 산출물

`docs/meetings/_retrospect/YYYY-MM-DD.md` — 1~3KB 짧은 점검 메모.

---

## 6. 파일 레이아웃

```
docs/meetings/
├── YYYY-MM-DD-standup.md              # 평일 standup (월~목, 4/주)
├── YYYY-MM-DD-weekly-allhands.md      # 주간 all-hands (금, 1/주)
├── _actions.md                        # live action tracker (single source of truth)
├── _pending/
│   ├── .gitkeep                       # 빈 dir 유지용
│   ├── agenda.md                      # 다음 routine이 처리 (default)
│   └── agenda-YYYY-MM-DD.md           # 명시 일자 ≤ 오늘인 routine이 처리 (미래 예약)
├── _heartbeat.log                     # routine 작동·실패·skip 1줄 로그
├── _retrospect/
│   └── YYYY-MM-DD.md                  # 토요일 회고 (4주 운영, 1~3KB)
├── README.md                          # 사용자 운영 가이드 (agenda 작성법·작동 확인)
└── (기존 2026-05-03·05-04 회의록은 archive 그대로)
```

### 6.1 `_actions.md` 구조

```markdown
# BlueBird Action Tracker (live)

## Open
- [ ] [cpo] 2026-05-17 IM.1 30명 모집 시작 게이트 통과 확인 (출처: 2026-05-10 weekly all-hands)
- [ ] [senior-fullstack] 2026-05-13 entry_channel 캡처 instrumentation (출처: 2026-05-12 standup)

## Closed (this week)
- [x] [data-analyst] T0 폼 cognitive_role 컬럼 매핑 — closed by abc1234 (2026-05-09)

## Closed (archive)
[3주 이상 closed 항목 자동 이동]
```

### 6.3 `_pending/agenda.md` 사용법 (CEO 인풋 인터페이스)

CEO가 회의 직전 우려 사항을 routine에 전달하는 유일한 인풋 채널.

#### 파일 명명 규칙

| 파일명 | 처리 시점 |
|---|---|
| `_pending/agenda.md` | *다음* routine이 읽음 (standup·all-hands·retrospect 무관) |
| `_pending/agenda-YYYY-MM-DD.md` | 명시 일자 ≤ 오늘 인 routine이 읽음 (미래 예약 가능) |

미래 예약 예: 5/9(금)에 `agenda-2026-05-12.md` 작성 → 5/12(월) standup이 처리.
복수 미래 agenda 동시 보관 OK (`agenda-2026-05-12.md` + `agenda-2026-05-13.md`).

#### 마감 (commit + push 기준)

| 다음 회의 | Cron 시점 | 마감 (안전 마진 30분) |
|---|---|---|
| 월~목 standup | 09:00 KST | **08:30 KST까지 commit + push** |
| 금 all-hands | 18:00 KST | **17:30 KST까지 commit + push** |
| 토 retrospect | 09:00 KST | **08:30 KST까지 commit + push** |

⚠️ routine은 Anthropic cloud에서 repo clone하므로 **로컬 저장만으론 미인식** — 반드시 push까지 완료.

#### 형식 — 자유 Markdown, 3가지 권장 패턴

**한 줄 우려** (가장 자주):
```markdown
어제 push 인프라 deploy 후 iPhone Safari에서 알림 권한 버튼 안 보임
```

**구조화 (페르소나 호명)**:
```markdown
# 2026-05-12 agenda

## 우려 사항
베타 모집 직전인데 E2E 검증이 아직 미진행.

## 호명
- senior-qa-engineer: 오늘 안에 prerequisite ALL pass 가능한가?
- product-owner: 미진행 상태에서 모집 시작 위험·대응 매트릭스
```

**결정 요청**:
```markdown
# 2026-05-15 agenda

## CEO 결정 필요
디스턴싱 가격 인상(99k → 110k) 시그널 보고. 우리 가격 가설(월 1.9~3.9만원) 변경 트리거? CSO·CMO 의견 정렬 필요.
```

#### 처리 흐름

```
사용자 agenda 작성 → commit + push
   ↓
routine 시점에 _pending/agenda*.md 읽음 (해당 일자 조건 충족 시)
   ↓
회의록 §1 CEO 개회에 인용
   ↓
1번 의제로 페르소나들이 응답
   ↓
회의 종료 시 처리 결과 기록
   ↓
git rm 처리한 agenda 파일 (자동 비움 — 사용자 액션 불필요)
```

#### 자주 묻는 케이스

| 케이스 | 동작 |
|---|---|
| agenda 없음 | Quiet day 처리 (§3.8) — routine 정상 진행, 경량 회의록 |
| 한 파일에 여러 우려 | 자유 구조로 나열. 페르소나가 분리하여 응답 |
| Standup만 / all-hands만 분리 의도 | v1은 모든 agenda를 *다음 routine*이 처리. 본문에 "이건 weekly에서 논의"라 적으면 페르소나가 의도 존중 |
| `agenda-2026-05-12.md`이 5/12 standup에서 처리되지 않음 | routine push 실패(heartbeat의 PUSH BLOCKED) 가능성 — `_heartbeat.log` 확인 |

#### v1 비포함 (개선 후보)

- `agenda-standup.md` / `agenda-weekly.md` 분리 — 첫 4주 운영 후 demand 시 격상

### 6.4 `_heartbeat.log` 형식

```
[2026-05-12 09:00:23 KST] standup OK — 5 personas spoke, 2 actions added, push OK
[2026-05-13 09:00:18 KST] standup OK — quiet day case 1, 0 actions, push OK
[2026-05-13 09:00:18 KST] PUSH BLOCKED: behind origin/main by 2 commits — manual resolve needed
```

---

## 7. Auto-push 검증 규칙

사용자 [git push 검증 메모리](../../../../../.claude/projects/-Users-dongseob-Desktop-claude-project/memory/feedback_git_push_remote_check.md) 적용:

```
1. git fetch origin main
2. git log HEAD..origin/main
3. 출력 비어있을 때만 git push
4. 차있을 시: 작업 중단 + heartbeat.log에 PUSH BLOCKED 기록
   - commit은 로컬 보존 (다음 routine·다음 사용자 세션에서 resolve)
   - 사용자가 다음 세션에 처리 (자동 rebase·merge 금지)
```

---

## 8. 비용 가드

| 가드 | 설정 |
|---|---|
| 모델 분배 | Daily standup orchestrator = Opus / Weekly all-hands = Opus(14) / Saturday retrospect = Sonnet |
| Daily cap (계정) | Anthropic 계정 단위 routine 실행 횟수 제한 (자동) |
| Extra usage | **OFF 유지** — `claude.ai/settings/usage`에서 사용자가 명시적으로 확인 |
| 1주 retrospect | 매주 토요일 자동 실행 (첫 4주) — 사용량 surface |
| 격하 가능성 | 토큰 소비 과다 시 attendance B → C(임원만) 또는 weekly 격주로 |

### 비용 추정 (주당)

| 항목 | 빈도 | 모델 | 토큰 추정 |
|---|---|---|---|
| Daily standup | 4회/주 | Opus | ~400~500k |
| Weekly all-hands | 1회/주 | Opus × 14 | ~2.1M |
| Saturday retrospect | 1회/주 | Sonnet | ~30k |
| **합계** | — | — | **~2.5~2.6M / 주** |

---

## 9. Open Implementation Considerations

(spec 시점에 미해결 — 구현 plan에서 처리)

1. **GitHub auth in cloud env** — Anthropic cloud routine이 BlueBird repo에 push할 권한. `/web-setup`으로 GitHub 계정 연결 1회 필요. *구현 plan에서 검증.*
2. **`.claude/agents/` 가용성** — repo에 commit된 페르소나 파일이 cloud routine 세션에서 subagent로 정상 호출되는지. *공식 보증 없음 — 첫 routine 1회 dry-run 검증 필수.*
3. **Routine 한도** — research preview라 max iterations·max tokens 옵션 없음. 폭주 가드는 daily cap + extra_usage OFF로만 가능. 1주 retrospect 후 재평가.
4. **Filename 충돌** — routine 동일 일자 재실행 시(실패→재시도) 파일 충돌 처리. 제안: `YYYY-MM-DD-standup.md` → `YYYY-MM-DD-standup-1.md` suffix.
5. **Synthesizer 정합성 검증** — Weekly all-hands의 충돌 검출 품질. 첫 1~2주 사용자 직접 검토 필수.
6. **Carry-over 매칭 정확도** — `_actions.md`의 open action이 commit으로 closed 됐는지 자동 판정 휴리스틱. 첫 시도는 commit message + 파일 path 매칭, 정확도 미달 시 사용자 확인 필요.

---

## 10. 변경 이력

| 버전 | 일자 | 변경 |
|---|---|---|
| v1 | 2026-05-10 | 초안 — 14 페르소나 자동 미팅 routine 3개(daily standup·weekly all-hands·saturday retrospect) 설계, 파일 레이아웃, auto-push 검증, 비용 가드 |
| v1.1 | 2026-05-10 | §6.3 `_pending/agenda.md` 사용법 명시 (파일명·마감·형식·처리 흐름·FAQ). 미래 일자 예약(`agenda-YYYY-MM-DD.md`) 지원 추가. README.md 사용자 가이드 분리. |
