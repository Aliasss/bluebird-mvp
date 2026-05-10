# 자동 미팅 Routine 구현 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [`spec v1.1`](../specs/2026-05-10-auto-meeting-routine-design.md)에 따라 3개 Anthropic cloud routine(daily standup·weekly all-hands·saturday retrospect)을 실제 등록하고 첫 운영 검증까지 완료한다.

**Architecture:** Anthropic cloud routine 시스템은 cron 시점에 repo를 clone하여 prompt를 실행한다. 본 plan은 (1) 각 routine의 orchestrator prompt를 repo에 commit (2) 로컬에서 dry-run 검증 (3) `/schedule` CLI 또는 `claude.ai/code/routines` UI로 routine 등록 (4) 첫 production 실행 모니터링 순서로 진행한다.

**Tech Stack:** Claude Code subagent dispatch · git · Anthropic cloud routines · Markdown.

---

## File Structure (이 plan으로 만들/수정할 파일)

```
docs/
├── superpowers/
│   ├── specs/
│   │   └── 2026-05-10-auto-meeting-routine-design.md  (기존)
│   ├── plans/
│   │   └── 2026-05-10-auto-meeting-routine.md         (이 파일)
│   └── routines/                                      (NEW)
│       ├── daily-standup-prompt.md                    (NEW — Task 2)
│       ├── weekly-allhands-prompt.md                  (NEW — Task 3)
│       └── saturday-retrospect-prompt.md              (NEW — Task 4)
└── meetings/
    ├── README.md                                      (기존)
    ├── _actions.md                                    (NEW — Task 1)
    ├── _pending/
    │   └── .gitkeep                                   (기존)
    └── _retrospect/
        └── .gitkeep                                   (NEW — Task 1)
```

**Files 책임 분담**:
- `daily-standup-prompt.md`: 월~목 09:00 routine이 cron 시점에 실행할 *완전한 instruction text*. Phase 1~5 흐름·임원 4명 standing items·산하 영역 매핑·quiet day 처리·push 검증 모두 inline.
- `weekly-allhands-prompt.md`: 금 18:00 routine prompt. 14 persona parallel dispatch·충돌·합의 단계 포함.
- `saturday-retrospect-prompt.md`: 토 09:00 routine prompt. heartbeat·actions·비용 점검.
- `_actions.md`: live action tracker initial template.

---

## Phase 1 — 인프라·Prompt 작성

### Task 1: 인프라 파일 셋업 (_actions.md template + _retrospect/ dir)

**Files:**
- Create: `docs/meetings/_actions.md`
- Create: `docs/meetings/_retrospect/.gitkeep`

- [ ] **Step 1: `_actions.md` 초기 템플릿 작성**

```markdown
# BlueBird Action Tracker (live)

> 이 파일은 자동 미팅 routine이 갱신합니다 (spec §6.1). 사용자 직접 편집 가능 — 다음 routine이 인지 후 처리.

## Open

(아직 actions 없음. 첫 standup·all-hands에서 채워집니다.)

## Closed (this week)

(미존재)

## Closed (archive)

(미존재 — 3주 이상 closed 항목 자동 이동)
```

저장 위치: `/Users/dongseob/Desktop/Project-BlueBird-mvp/docs/meetings/_actions.md`

- [ ] **Step 2: `_retrospect/.gitkeep` 생성**

빈 파일.

- [ ] **Step 3: 두 파일 검증**

```bash
ls -la /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/meetings/_actions.md /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/meetings/_retrospect/.gitkeep
```

Expected: 두 파일 모두 존재.

- [ ] **Step 4: Commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
git fetch origin main && git log HEAD..origin/main  # 비어있어야 함
git add docs/meetings/_actions.md docs/meetings/_retrospect/.gitkeep
git commit -m "$(cat <<'EOF'
docs(meetings): _actions.md 초기 템플릿 + _retrospect/ dir

자동 미팅 routine 인프라 파일. routine이 채울 빈 placeholder.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git fetch origin main && git log HEAD..origin/main  # 비어있어야 함
git push origin main
```

---

### Task 2: Daily Standup Orchestrator Prompt 작성

**Files:**
- Create: `docs/superpowers/routines/daily-standup-prompt.md`

- [ ] **Step 1: routine prompt 본문 작성**

저장 위치: `/Users/dongseob/Desktop/Project-BlueBird-mvp/docs/superpowers/routines/daily-standup-prompt.md`

내용:
````markdown
# BlueBird Daily Standup Routine — Orchestrator Prompt

당신은 BlueBird 프로젝트의 자동 미팅 routine orchestrator입니다. 매일 한국 시간 09:00에 실행되며, repo는 이미 clone된 상태로 시작합니다. **사용자 명령 없이 spec에 따라 standup을 진행하고 회의록·action·heartbeat를 commit·push까지 완료**해야 합니다.

## 기준 문서 (시작 시 반드시 읽기)

1. `docs/superpowers/specs/2026-05-10-auto-meeting-routine-design.md` — 본 routine의 시스템 명세 (특히 §3·§6·§7)
2. `.claude/agents/{cpo,cso,cto,cmo}.md` — 임원 4명 페르소나
3. `docs/strategy/positioning-and-vision-v1.md` — 1차 타겟·비목표·본질 위협
4. `docs/strategy/pmf-validation-plan.md` — PMF 게이트
5. `docs/strategy/cmo-stage-guide-v1.md` — Stage 0/1/2

## Phase 1 — Input 흡수

다음 5개 입력을 순서대로 수집:

```bash
# 1.1 24시간 git 변화
git log --since="24 hours ago" --pretty=format:'%h %s%n%b' --name-only > /tmp/git-24h.txt

# 1.2 날짜 (KST)
date "+%Y-%m-%d" -u   # UTC 받은 후 +9시간 보정 또는 직접 KST 계산

# 1.3 agenda 흡수 (해당 일자 ≤ 오늘 인 모든 파일)
ls docs/meetings/_pending/agenda*.md 2>/dev/null
# - agenda.md: 무조건 처리
# - agenda-YYYY-MM-DD.md: 명시 일자 ≤ 오늘 KST 인 것만 처리

# 1.4 carry-over actions 로드
cat docs/meetings/_actions.md  # Open 섹션

# 1.5 산하 페르소나 매핑 (spec §3.4)
```

**산하 페르소나 매핑** (Phase 1.5):

| 변화 영역 (path glob) | 호출할 산하 페르소나 |
|---|---|
| `lib/ai/`·`lib/openai/` | senior-fullstack-engineer · senior-qa-engineer |
| `lib/intervention/`·`lib/insights/`·`lib/review/` | product-owner · data-analyst |
| `lib/notifications/`·`app/api/push/` | senior-fullstack-engineer · risk-manager |
| `lib/safety/`·`app/safety/` | risk-manager · senior-qa-engineer |
| `lib/onboarding/`·`app/onboarding/` | senior-ux-researcher · product-designer |
| `app/(public)/`·`app/our-philosophy/`·`app/manual/`·랜딩 카피 | content-marketer · product-designer · strategy-manager |
| `app/api/notifications/event/`·`lib/analytics/` | data-analyst · product-owner |
| 가격·결제 (`app/beta-incentive/`, README) | cmo · performance-marketer · cso |
| `migrations/` (Supabase) | senior-fullstack-engineer · senior-qa-engineer · risk-manager |
| `docs/strategy/` 변경 | strategy-manager + 변경 영역 임원 |
| agenda.md 명시 호명 | 호명된 페르소나 |

git log diff와 위 표 교집합으로 호출 페르소나 set 결정. 중복은 1회로.

## Phase 2 — 발언 라운드

### 2.1 임원 4명 (매일 standing items)

각 임원의 페르소나 파일 (`.claude/agents/{cpo,cso,cto,cmo}.md`)을 *완전히 채택*하여 standing items 발언.

| 임원 | standing items |
|---|---|
| CPO | PMF 게이트 진척 (자발 언급 / 30일 잔존 / 결제 의향) |
| CSO | 차별화 3축 정합성·디스턴싱·글로벌 챗봇 한국어 진입 시그널 |
| CTO | hot path 안정·회귀·migration·안전 가드 |
| CMO | Stage 0 진척 (IM.1·자산 stockpile·본질 위협 #1·#3·#5·#6 외부 채널) |

각 임원 발언은 [페르소나 응답 방식]을 따름:
- 변경 전·후 구체 인용
- 자기 §의사결정 우선순위 명시
- 본질 위협 신호 발견 시 ⚠️

변화 없으면: "no movement" / "no shift detected" / "stable, no incidents" / "Stage 0, IM.1 모집 인프라 준비 중"

### 2.2 산하 페르소나 (트리거 시만)

Phase 1.5에서 결정된 set만 발언. 각 페르소나 파일을 *완전히 채택*.
- 본인 영역 24h 변화에 대한 코멘트
- carry-over Open actions 진척 보고 (자기가 owner인 항목)
- 새 우려 사항 1~2개

### 2.3 agenda.md 호명 처리

agenda 본문에서 "## 호명" 섹션의 페르소나는 무조건 호출. 해당 페르소나 파일 채택 후 agenda 질문에 답변.

## Phase 3 — Action items 추출

### 3.1 본문에서 추출
- regex: `^\\*\\*Action\\*\\*:` 또는 `^Action:` (line start)
- 각 항목 형식: `- [ ] [owner] [due-YYYY-MM-DD] action 내용 (출처: YYYY-MM-DD standup)`

### 3.2 carry-over close 판정
`_actions.md` Open 섹션 각 항목에 대해:
- commit message에 action 내용 키워드 포함 + commit이 owner 영역 path 변경 → close
- 형식: `- [x] [owner] action 내용 — closed by <commit-hash> (날짜)` → "Closed (this week)" 섹션

### 3.3 ≥3주 carry-over
"Open" 섹션에 최초 추가 후 21일 경과 항목 → ⚠️ 마킹: `(⚠️ 3주 미완 — 재할당/취소 결정 필요)`

## Phase 4 — Quiet Day 처리 (3 케이스)

| 케이스 | 조건 | 처리 |
|---|---|---|
| 1 완전 조용 | agenda 0 + git 24h 변화 0 | `## 0. Quiet day` 헤더 명시. 임원 4명 standing items만. ~1~3KB |
| 2 부분 조용 | agenda 0 + git 일부 변화 | 정상 길이. 매핑된 산하 + 임원 4명 |
| 3 정체 감지 | 3일+ 연속 케이스 1 (최근 standup minutes의 §0 헤더 확인) | Emergent agenda 자동 추가: CPO에 "3일째 git 0 + agenda 0. 무엇이 막고 있는가? IM.1 모집·인터뷰 가이드·인프라 준비 중 어디서 정체?" |

## Phase 5 — 산출물 작성·Commit·Push

### 5.1 회의록 작성

저장 위치: `docs/meetings/{YYYY-MM-DD}-standup.md` (KST 기준 일자)

템플릿:
```markdown
# BlueBird Daily Standup — YYYY-MM-DD

**일시**: YYYY-MM-DD 09:00 KST
**참여자**: 임원 4명 + 호출 산하 N명 (총 M명)
**모드**: Orchestrator (Opus)

## 0. 현황 (24h 변화 요약 / Quiet day 시 명시)

[git 24h 통계, agenda 인용, carry-over 요약]

## 1. 임원 라운드

### 1.1 CPO
[CPO 페르소나 발언]

### 1.2 CSO
### 1.3 CTO
### 1.4 CMO

## 2. 산하 라운드 (트리거)

### 2.1 [persona-name]
[발언]

(미트리거 페르소나는 §2 자체 생략 가능 — Quiet day 1·2)

## 3. agenda 처리 (있을 시)

[CEO agenda 인용 + 페르소나 응답]

## 4. Action items
- (Phase 3에서 추출된 actions, _actions.md에도 추가됨)

## 5. carry-over close
- (Phase 3.2에서 close된 actions)
```

### 5.2 _actions.md 갱신

Phase 3에서 결정된 변동 반영.

### 5.3 처리한 agenda 파일 git rm

```bash
git rm docs/meetings/_pending/agenda.md  # 처리했다면
git rm docs/meetings/_pending/agenda-YYYY-MM-DD.md  # 처리한 일자
```

### 5.4 _heartbeat.log append

```
[YYYY-MM-DD HH:MM:SS KST] standup OK — N personas spoke, M actions added, push OK
```

실패 시:
```
[YYYY-MM-DD HH:MM:SS KST] standup FAIL — <error summary>
```

### 5.5 Commit + push (검증 적용)

```bash
git add docs/meetings/{YYYY-MM-DD}-standup.md docs/meetings/_actions.md docs/meetings/_heartbeat.log
# agenda 처리한 경우 git rm 도 add 됨

git commit -m "docs(meetings): standup YYYY-MM-DD"

# Push 검증 (사용자 git push 검증 메모리 적용)
git fetch origin main
git log HEAD..origin/main
# 비어있어야 push, 차있으면 STOP
```

**STOP 조건 (behind origin)**:
- _heartbeat.log에 추가: `[YYYY-MM-DD HH:MM:SS KST] PUSH BLOCKED: behind origin/main by N commits — manual resolve needed`
- commit은 로컬 보존, 사용자 다음 세션에서 resolve

## 출력 검증 체크리스트

종료 전 자체 점검:
- [ ] 회의록 파일 작성됨 (`docs/meetings/{YYYY-MM-DD}-standup.md`)
- [ ] _actions.md 갱신됨 (Open·Closed 섹션 정합)
- [ ] _heartbeat.log 1줄 append됨
- [ ] agenda 파일 처리 후 git rm
- [ ] commit 1개 생성
- [ ] git push 검증 통과 (또는 PUSH BLOCKED 기록)
- [ ] 임원 4명 발언 모두 존재
- [ ] 본질 위협 신호 ⚠️ 발견 시 명시

## 비고

- 이 prompt는 `docs/superpowers/specs/2026-05-10-auto-meeting-routine-design.md`에 종속. spec 변경 시 본 prompt도 동기화 필요.
- 발언자가 페르소나 정체성 무너지면(예: 임원이 산하 영역 침범) 즉시 자기 권한 경계 §로 복귀.
````

- [ ] **Step 2: 파일 길이·완성도 검증**

```bash
wc -l /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/superpowers/routines/daily-standup-prompt.md
```

Expected: 200~250줄. 100줄 미만이면 누락된 섹션 있는지 확인.

- [ ] **Step 3: Spec 정합성 자체 검증**

prompt가 spec §3 모든 Phase 1~5와 §3.4 매핑·§3.5 임원 standing items·§3.6 actions 추출·§3.7 push·§3.8 quiet day를 모두 inline 인용하는지 검토.

- [ ] **Step 4: Commit (Task 4까지 끝내고 한 번에 commit하므로 여기선 skip)**

(Tasks 2·3·4 완료 후 일괄 commit — Task 4 Step 5에서 진행)

---

### Task 3: Weekly All-Hands Orchestrator Prompt 작성

**Files:**
- Create: `docs/superpowers/routines/weekly-allhands-prompt.md`

- [ ] **Step 1: prompt 본문 작성**

저장 위치: `/Users/dongseob/Desktop/Project-BlueBird-mvp/docs/superpowers/routines/weekly-allhands-prompt.md`

내용 (Daily standup prompt와 차별점만 발췌해서 작성):

````markdown
# BlueBird Weekly All-Hands Routine — Orchestrator Prompt

당신은 BlueBird Weekly All-Hands routine orchestrator. 매주 금요일 한국 시간 18:00 실행. **14 페르소나 parallel dispatch·충돌 검출·합의 도출까지** 완료해야 합니다.

## 기준 문서 (시작 시 반드시 읽기)

1. `docs/superpowers/specs/2026-05-10-auto-meeting-routine-design.md` (특히 §4)
2. `.claude/agents/*.md` — 14명 페르소나 모두
3. `docs/strategy/positioning-and-vision-v1.md`·`pmf-validation-plan.md`·`cmo-stage-guide-v1.md`·`bluebird_competitive_strategy_v1.md`·`development-backlog.md`·`bluebird_retention_mechanisms_v1.md`
4. 지난 4 standup minutes (`docs/meetings/2026-MM-DD-standup.md`)
5. 기존 all-hands 회의록 포맷: `docs/meetings/2026-05-03-all-hands-priority-agenda.md`

## Phase 1 — 주간 input 흡수

```bash
# 7일 git log
git log --since="7 days ago" --pretty=format:'%h %s' --stat > /tmp/git-7d.txt

# 영역별 commit 빈도 (lib/ai/*, app/api/* 등)

# 주간 standup minutes
ls docs/meetings/2026-*-standup.md | tail -4

# _actions.md 변화 (open / closed_this_week / 미완 ≥3주)
cat docs/meetings/_actions.md

# 핵심 strategy docs 현재 상태
- pmf-validation-plan.md 게이트 진척 섹션
- development-backlog.md Tier 분류
- cmo-stage-guide-v1.md Stage 위치

# agenda
ls docs/meetings/_pending/agenda*.md
```

## Phase 2 — 발언 라운드 (parallel dispatch)

**14 페르소나 동시 호출** (각 페르소나 frontmatter `model: opus` 그대로):

순서:
1. CPO (4 C-Level 우선)
2. CSO
3. CTO
4. CMO
5. product-designer
6. product-owner
7. senior-ux-researcher
8. data-analyst
9. strategy-manager
10. risk-manager
11. senior-fullstack-engineer
12. senior-qa-engineer
13. content-marketer
14. performance-marketer

각 페르소나에게 전달할 prompt:
> "당신은 [persona-name] 페르소나입니다. `.claude/agents/[persona-name].md`을 채택하고 1차 참조 문서를 읽으세요. 이번 주 주간 all-hands입니다. 자기 영역의 *가장 절박한 1~2 아젠다*를 발언하고, 반론 인지(다른 페르소나의 잠재 반대 입장 사전 점검)를 함께 적으세요. carry-over Open actions 중 본인이 owner인 것의 진척도 보고. 본질 위협 신호 ⚠️ 감지 시 surface."

## Phase 3 — 충돌 검출·합의

Synthesizer 역할(orchestrator 자신)이 §2 발언들에서:
- 우선순위 충돌 (예: CPO "지금 모집" vs CTO "E2E 먼저")
- 자원 충돌 (동일 sprint에 여러 페르소나가 다른 작업 요구)
- 차별화 vs 단기 PMF 트레이드오프

각 충돌 → 표 형식:
```markdown
| 위치 A | 위치 B | 트레이드오프 | CEO 결정 필요? |
|---|---|---|---|
| CPO: 지금 IM.1 모집 시작 | CTO: prerequisite ALL pass 후 | falsifiability vs 데이터 신뢰도 | ⚠️ Yes |
```

합의 가능 항목은 §4. CEO 결정 필요는 ⚠️로.

## Phase 4 — Action items + 다음 주 우선순위

- 합의된 actions → `_actions.md`에 추가 (owner=페르소나, due=다음 주 금)
- carry-over Open ≥3주 → ⚠️ "장기 미완 — 재할당/취소" 마킹
- 중복 actions 통합 (같은 owner·내용)

## Phase 5 — 산출물 작성·Commit·Push

### 5.1 회의록 작성 (기존 2026-05-03 포맷 준용)

저장 위치: `docs/meetings/{YYYY-MM-DD}-weekly-allhands.md`

```markdown
# BlueBird 주간 All-Hands — YYYY-MM-DD

**일시**: YYYY-MM-DD 18:00 KST
**참여자**: 14 페르소나 (parallel dispatch, Opus × 14)
**기록**: senior-qa-engineer (회의록 정합성 독립 검증)
**목적**: 주 마감 deep 합의 — 향후 1~2주 절박 아젠다·미완 actions·전략 시그널

## 0. 현황 (개회 시점 기준)
[7일 git 통계·게이트 진척·_actions 요약 표]

## 1. CEO 개회
[agenda.md 인풋 인용 또는 routine standing summary]

## 2. 발언 라운드
### 2.1 CPO
### 2.2 CSO
... (14명 모두)
### 2.14 performance-marketer

## 3. 충돌 토론
[Synthesizer가 충돌 검출 → 표]

## 4. 합의
[합의된 항목]
[⚠️ CEO 결정 필요 항목]

## 5. Action items (다음 주)
[owner·due·trigger 명시]
```

### 5.2~5.5: Daily standup §5.2~5.5와 동일 (action·heartbeat·git rm·commit·push 검증)

heartbeat 형식 차이만:
```
[YYYY-MM-DD HH:MM:SS KST] weekly-allhands OK — 14 personas, M actions added, K conflicts surfaced, push OK
```

## 출력 검증 체크리스트

- [ ] 14 페르소나 모두 발언 (§2.1~2.14)
- [ ] 충돌 검출 §3 (없으면 "이번 주 명시적 충돌 없음" 명시)
- [ ] 합의 §4 (있다면)
- [ ] CEO 결정 필요 항목 ⚠️ 표시
- [ ] _actions.md 갱신
- [ ] _heartbeat.log append
- [ ] commit·push 검증 통과
````

- [ ] **Step 2: 파일 검증**

```bash
wc -l /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/superpowers/routines/weekly-allhands-prompt.md
```

Expected: 150~200줄.

---

### Task 4: Saturday Retrospect Orchestrator Prompt 작성

**Files:**
- Create: `docs/superpowers/routines/saturday-retrospect-prompt.md`

- [ ] **Step 1: prompt 본문 작성**

저장 위치: `/Users/dongseob/Desktop/Project-BlueBird-mvp/docs/superpowers/routines/saturday-retrospect-prompt.md`

````markdown
# BlueBird Saturday Retrospect Routine — Orchestrator Prompt

당신은 BlueBird Saturday Retrospect routine orchestrator. 매주 토요일 한국 시간 09:00 실행 (첫 4주 한정). **모델 = Sonnet 4.6** (간단 점검). 페르소나 dispatch 없음.

## 기준 문서

1. `docs/superpowers/specs/2026-05-10-auto-meeting-routine-design.md` §5
2. `docs/meetings/_heartbeat.log` (지난 7일)
3. `docs/meetings/_actions.md` (Open·Closed 카운트)
4. 지난 7일 standup·all-hands minutes

## Phase 1 — 점검 항목 수집

```bash
# 1.1 지난 7일 heartbeat 분석
tail -50 docs/meetings/_heartbeat.log
# - standup 4회 / weekly-allhands 1회 / retrospect 0회 (자기) 예상
# - PUSH BLOCKED 빈도

# 1.2 _actions.md 카운트
grep -c "^- \\[ \\]" docs/meetings/_actions.md  # Open
grep -c "^- \\[x\\]" docs/meetings/_actions.md  # Closed

# 1.3 ≥3주 carry-over
grep "⚠️ 3주 미완" docs/meetings/_actions.md

# 1.4 본질 위협 ⚠️ 빈도 (지난 7일 minutes에서 ⚠️ 출현 횟수)
grep -c "⚠️" docs/meetings/2026-*-standup.md docs/meetings/2026-*-weekly-allhands.md
```

## Phase 2 — 토큰 사용량 (사용자 직접 확인 안내)

routine 자신은 토큰 사용량에 직접 access 불가. 회의록에 다음 안내:

> "사용자 직접 확인 필요: `claude.ai/settings/usage`에서 지난 7일 토큰 사용량 확인 후 본 회의록에 기재."

routine은 *추정치*만 보고:
- standup × 4 ≈ 400~500k Opus tokens
- weekly-allhands × 1 ≈ 2.1M Opus tokens
- retrospect × 0 (이번 주는 자기) ≈ 30k Sonnet tokens
- 추정 합 ≈ 2.5~2.6M / 주

## Phase 3 — 권고 생성

다음 조건별 권고:

| 조건 | 권고 |
|---|---|
| PUSH BLOCKED ≥2회 | "사용자 git workflow 점검 필요 — 다른 세션 push 빈도 확인" |
| Open actions ≥20개 | "action 누적 — 다음 weekly에서 우선순위 재정렬" |
| ≥3주 carry-over ≥3개 | "장기 미완 ≥3 — 재할당·취소 결정 필요. CEO 환기" |
| ⚠️ 빈도 ≥10 in 7일 | "본질 위협 시그널 누적 — 차주 weekly all-hands에서 차별화 3축 정합 점검" |
| 토큰 추정 >3M/주 | "비용 추정 cap 근접 — attendance B→C 격하 또는 weekly 격주 검토" |

## Phase 4 — 산출물 작성

저장 위치: `docs/meetings/_retrospect/{YYYY-MM-DD}.md`

```markdown
# Saturday Retrospect — YYYY-MM-DD

**Routine 운영 1주차/2주차/3주차/4주차** (4주차 후 cadence 재평가)

## Routine 작동 통계 (지난 7일)
- Standup: N회 OK / M회 FAIL
- Weekly all-hands: 1회 OK / FAIL
- PUSH BLOCKED: N회

## Actions 통계
- Open: N개 (≥3주 carry-over: M개)
- Closed (this week): K개

## 본질 위협 시그널
- ⚠️ 발견 빈도: K회

## 토큰 사용량
- 추정: 2.5~2.6M (사용자 직접 확인: claude.ai/settings/usage)

## 권고
- [Phase 3 조건별 권고]

## Cadence 재평가 (4주차에만 작성)
- 이대로 유지 vs weekly 격주 vs attendance B→C
```

## Phase 5 — Commit·push (검증 적용)

```bash
git add docs/meetings/_retrospect/{YYYY-MM-DD}.md docs/meetings/_heartbeat.log
git commit -m "docs(meetings): retrospect YYYY-MM-DD"
git fetch origin main
git log HEAD..origin/main
# 비어있어야 push
git push origin main
```

heartbeat:
```
[YYYY-MM-DD HH:MM:SS KST] retrospect OK — week N/4, M actions open, K push blocks, push OK
```

## 출력 검증 체크리스트

- [ ] _retrospect/{YYYY-MM-DD}.md 작성됨
- [ ] 5개 통계 모두 수집 (routine·actions·위협·토큰·권고)
- [ ] Phase 3 권고 조건 적합한 것만 surface
- [ ] _heartbeat.log append
- [ ] commit·push 검증 통과
````

- [ ] **Step 2: 파일 검증**

```bash
wc -l /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/superpowers/routines/saturday-retrospect-prompt.md
```

Expected: 100~150줄.

- [ ] **Step 3: 3개 prompt 일괄 commit**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
git fetch origin main && git log HEAD..origin/main  # 비어있어야 함
git add docs/superpowers/routines/
git commit -m "$(cat <<'EOF'
docs(routines): 3개 routine orchestrator prompts 작성

- daily-standup-prompt.md: 월~목 09:00 routine. Phase 1~5 흐름·임원 4명 standing items·산하 영역 매핑·quiet day·push 검증 inline
- weekly-allhands-prompt.md: 금 18:00 routine. 14 persona parallel dispatch·충돌 검출·합의·기존 2026-05-03 포맷 준용
- saturday-retrospect-prompt.md: 토 09:00 routine (4주 한정). Sonnet 모델·heartbeat·actions·비용 추정·권고

다음 단계: 로컬 dry-run (Task 5·6) → 클라우드 routine 등록 (Task 8).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git fetch origin main && git log HEAD..origin/main  # 비어있어야 함
git push origin main
```

---

## Phase 2 — 로컬 Dry-Run

### Task 5: Daily Standup Dry-Run (general-purpose agent)

**Files:**
- 임시 산출물 → 검증만, commit 안 함 (또는 별도 dry-run dir로)

- [ ] **Step 1: 현재 상태 snapshot**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
git log --since="24 hours ago" --pretty=format:'%h %s' --name-only
ls docs/meetings/_pending/
cat docs/meetings/_actions.md
```

24h 변화 영역·agenda·carry-over 모두 기록.

- [ ] **Step 2: general-purpose subagent dispatch**

다음 prompt로 호출:

```
당신은 BlueBird daily standup routine을 dry-run 시뮬레이션하는 테스터입니다.

1. /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/superpowers/routines/daily-standup-prompt.md를 읽고 그 instruction을 따르세요.
2. /Users/dongseob/Desktop/Project-BlueBird-mvp/ 디렉토리에서 모든 명령 수행.
3. **단, commit·push는 하지 말 것**. 회의록 파일은 docs/meetings/_dryrun/standup-dryrun-2026-05-10.md로 저장.

검증 목적이므로 실제 cron 운영과 동일한 prompt를 따르되, 산출물은 _dryrun/ 격리.

마지막에 다음 체크리스트 보고:
- [ ] 임원 4명 standing items 발언 모두 존재
- [ ] 산하 페르소나 트리거 정확 (24h git 변화와 매핑 표 정합)
- [ ] agenda 처리 정확 (있을 시)
- [ ] action items 추출 형식 정합
- [ ] quiet day 케이스 분류 정확
- [ ] heartbeat 형식 정합

각 체크에 ✅/❌ + 근거.
```

- [ ] **Step 3: 산출물 검토**

```bash
cat /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/meetings/_dryrun/standup-dryrun-2026-05-10.md
```

검증:
- 임원 4명 발언 모두 존재? CPO·CSO·CTO·CMO 명시?
- 산하 트리거가 24h git 변화와 정합?
- 페르소나 voice가 각자 응답 방식 §과 정합? (CPO 우선순위 5축, CSO 차별화 3축, etc.)
- 본질 위협 ⚠️ surface 적합?
- KST 시간 표기?

- [ ] **Step 4: 결함 발견 시 prompt 수정**

발견된 패턴 결함이 있으면 `daily-standup-prompt.md` 수정 후 Step 2 재실행.
없으면 Step 5로.

- [ ] **Step 5: dryrun 산출물 정리**

```bash
rm -rf /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/meetings/_dryrun/
```

(검증만 하고 archive 불필요)

---

### Task 6: Weekly All-Hands Dry-Run (축약 — 4 페르소나만)

**Files:**
- 임시 산출물 (dryrun dir, commit 안 함)

**비고**: 14 페르소나 풀 dispatch는 토큰 부담. dry-run은 *4 임원만* parallel dispatch로 축약 검증. orchestration 로직만 검증하면 충분.

- [ ] **Step 1: 4 임원 축약 prompt 준비**

`weekly-allhands-prompt.md`의 Phase 2 발언 라운드를 *4 C-Level만 dispatch*로 임시 수정 (또는 dry-run 시 그렇게 하라고 인스트럭션 추가).

- [ ] **Step 2: general-purpose subagent dispatch**

```
BlueBird weekly all-hands routine dry-run 테스터입니다.

1. /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/superpowers/routines/weekly-allhands-prompt.md 읽고 따르세요.
2. **단 Phase 2에서 14명 대신 4 C-Level(CPO·CSO·CTO·CMO)만 parallel dispatch**. 산하 10명은 "축약 dry-run으로 인해 미발언" 명시.
3. commit·push 안 함. 산출물 docs/meetings/_dryrun/allhands-dryrun-2026-05-10.md.

orchestration·충돌 검출·합의 로직 검증이 목적. 4명만으로도 충돌 패턴 surface 가능 여부 확인.

마지막에 체크리스트 보고:
- [ ] 4 C-Level 모두 발언
- [ ] 충돌 검출 §3 적합 (또는 "충돌 없음" 명시)
- [ ] 합의·CEO 결정 필요 항목 분리 정합
- [ ] action items 형식 정합
- [ ] heartbeat 형식 정합
```

- [ ] **Step 3: 산출물 검토**

검증:
- 4 임원 voice 정합 (각자 페르소나 §의사결정 우선순위 적용?)
- 충돌 검출이 *그럴듯한지* (가짜 충돌 만들지 않았는지)
- §4 합의 vs §3 ⚠️ 분리 적합

- [ ] **Step 4: prompt 수정 (필요 시)**

- [ ] **Step 5: dryrun 산출물 정리**

```bash
rm -rf /Users/dongseob/Desktop/Project-BlueBird-mvp/docs/meetings/_dryrun/
```

---

## Phase 3 — 클라우드 Routine 등록

> **Phase 3은 사용자(CEO) 직접 수행 단계**. Claude는 절차·prompt를 제공하고, 사용자가 `/schedule` CLI 또는 `claude.ai/code/routines` UI에서 실행.

### Task 7: GitHub Auth in Anthropic Cloud (1회)

- [ ] **Step 1: 사용자 안내 — `/web-setup` 실행**

사용자가 직접:
1. `claude.ai/code` 접속
2. `/web-setup` 또는 Settings → Connected accounts → GitHub
3. `Aliasss/bluebird-mvp` repo write access 부여
4. push 권한 검증: 작은 테스트 commit 1개 cloud routine으로 push 가능한지 확인

- [ ] **Step 2: 검증**

사용자가 cloud env에서 1회 manual run으로 test push 시도:
```bash
# cloud env 안에서
echo "test" > /tmp/test.txt
cd ~/bluebird-mvp  # 또는 cloned repo 위치
git add ... # (실제로는 안 함, 권한 검증만)
```

또는 더 간단히: Task 8의 첫 routine을 manual trigger 후 push 성공 여부로 검증.

---

### Task 8: 3 Routine 등록 (`/schedule` 또는 web UI)

> 본 task는 사용자 직접 수행. Claude가 정확한 cron·prompt 텍스트 제공.

- [ ] **Step 1: Daily Standup 등록**

```
/schedule
또는 claude.ai/code/routines → New routine

이름: bluebird-daily-standup
Cron: 0 0 * * 1-4   (UTC 기준 — KST 09:00 = UTC 00:00, 월~목 = UTC 일~수, 즉 0 0 * * 0-3 정확함)
```

⚠️ **시간대 주의**: cron은 UTC. KST 09:00 월~목 → UTC 00:00 일~수 → cron `0 0 * * 0-3`.

| KST 회의 | KST cron | UTC cron |
|---|---|---|
| 월 09:00 | 0 9 * * 1 | 0 0 * * 1 (UTC 월) |
| 화 09:00 | 0 9 * * 2 | 0 0 * * 2 (UTC 화) |
| ... | ... | ... |
| 목 09:00 | 0 9 * * 4 | 0 0 * * 4 (UTC 목) |
| **합계 KST 월~목 09:00** | `0 9 * * 1-4` | `0 0 * * 1-4` |

KST 09:00은 같은 날 UTC 00:00 — 요일 안 바뀜. cron `0 0 * * 1-4` 정합.

| 회의 | UTC cron |
|---|---|
| Daily standup (월~목 09:00 KST) | `0 0 * * 1-4` |
| Weekly all-hands (금 18:00 KST) | `0 9 * * 5` (UTC 금 09:00) |
| Saturday retrospect (토 09:00 KST) | `0 0 * * 6` (UTC 토 00:00) |

```
모델: Opus
Prompt:
[docs/superpowers/routines/daily-standup-prompt.md 전체 텍스트 paste]

추가 instruction (prompt 맨 위):
"Repository: https://github.com/Aliasss/bluebird-mvp.git
Branch: main
Working directory: 클론된 repo 루트
KST 시간 보정: UTC + 9 hours"
```

- [ ] **Step 2: Weekly All-Hands 등록**

```
이름: bluebird-weekly-allhands
Cron (UTC): 0 9 * * 5
모델: Opus
Prompt: [weekly-allhands-prompt.md 전체 paste]
```

- [ ] **Step 3: Saturday Retrospect 등록**

```
이름: bluebird-saturday-retrospect
Cron (UTC): 0 0 * * 6
모델: Sonnet
Prompt: [saturday-retrospect-prompt.md 전체 paste]
종료 일자: 2026-06-13 (4주 후) — 또는 주차 카운터로 자동 종료
```

- [ ] **Step 4: 등록 검증**

```bash
/schedule list
또는 claude.ai/code/routines
```

3개 routine 모두 보이고 cron 정확한지 확인.

---

### Task 9: 첫 Production Run 검증

- [ ] **Step 1: Manual trigger — Daily standup**

다음 routine 정시 (월~목 중 가장 가까운 09:00 KST)를 기다리거나, `/schedule run bluebird-daily-standup` 즉시 trigger.

- [ ] **Step 2: 결과 검증 (10분 이내 완료 예상)**

```bash
cd /Users/dongseob/Desktop/Project-BlueBird-mvp
git pull origin main  # routine이 push했어야 함
ls docs/meetings/2026-*-standup.md | tail -1   # 최신 standup 회의록
cat docs/meetings/_heartbeat.log | tail -1     # OK 메시지
cat docs/meetings/_actions.md                  # 갱신 확인
```

검증:
- 회의록 파일 존재
- heartbeat OK
- _actions.md Open 섹션 항목 추가 (또는 Quiet day 시 변화 없음 — 정상)
- commit message 형식 정합 (`docs(meetings): standup YYYY-MM-DD`)

- [ ] **Step 3: 결함 발견 시 처리**

| 증상 | 조치 |
|---|---|
| Routine timeout | prompt 단순화, 산하 페르소나 dispatch 수 줄이기 |
| GitHub push 실패 | Task 7 GitHub auth 재검증 |
| 페르소나 voice 정체성 흐림 | prompt에 "페르소나 파일을 *완전히 채택*하기 전 다른 작업 금지" 강조 |
| KST 시간 잘못 표기 | prompt에 UTC+9 보정 규칙 명시 강화 |
| Quiet day 처리 잘못 | spec §3.8 인용 강화 |

- [ ] **Step 4: Weekly all-hands manual trigger (다음 금 18:00 또는 즉시)**

```bash
/schedule run bluebird-weekly-allhands
```

10~15분 대기 후 동일 검증.

- [ ] **Step 5: Saturday retrospect manual trigger**

```bash
/schedule run bluebird-saturday-retrospect
```

3~5분 내 완료 예상.

---

## Phase 4 — 운영 Handoff

### Task 10: Memory 갱신 + 사용자 운영 리마인드

**Files:**
- Modify: `/Users/dongseob/.claude/projects/-Users-dongseob-Desktop-claude-project/memory/MEMORY.md`
- Create: `/Users/dongseob/.claude/projects/-Users-dongseob-Desktop-claude-project/memory/project_auto_meeting_routine.md`

- [ ] **Step 1: project memory 추가**

저장 위치: `/Users/dongseob/.claude/projects/-Users-dongseob-Desktop-claude-project/memory/project_auto_meeting_routine.md`

내용:
```markdown
---
name: 자동 미팅 routine 운영 중
description: BlueBird 14 페르소나 자동 미팅 routine 3개 등록·운영 상태
type: project
---

BlueBird 자동 미팅 routine 시스템 운영 중. spec [`docs/superpowers/specs/2026-05-10-auto-meeting-routine-design.md`](Project-BlueBird-mvp/docs/superpowers/specs/2026-05-10-auto-meeting-routine-design.md), 운영 가이드 [`docs/meetings/README.md`](Project-BlueBird-mvp/docs/meetings/README.md).

**등록일**: 2026-05-10 (또는 실제 등록 일자)

**3개 routine**:
- bluebird-daily-standup: 월~목 KST 09:00 (UTC `0 0 * * 1-4`), Opus
- bluebird-weekly-allhands: 금 KST 18:00 (UTC `0 9 * * 5`), Opus × 14 parallel
- bluebird-saturday-retrospect: 토 KST 09:00 (UTC `0 0 * * 6`), Sonnet, **2026-06-13 종료** (4주 한정)

**Why:** 14 페르소나 조직이 사용자 명령 없이 자동 점검·합의·archive — PMF 게이트·본질 위협·차별화 시그널 시계열 추적.

**How to apply:**
- agenda 인풋: `docs/meetings/_pending/agenda.md` 또는 `agenda-YYYY-MM-DD.md` (push까지 마감)
- routine 결과: `docs/meetings/YYYY-MM-DD-{standup,weekly-allhands}.md`, `_actions.md`, `_heartbeat.log`
- 작동 확인: `_heartbeat.log` 또는 `claude.ai/code/routines`
- 비용 점검: 매주 토요일 retrospect (4주 후 cadence 재평가)
- prompt 수정 시: `docs/superpowers/routines/*-prompt.md` 수정 후 cloud routine *재등록 필요* (cloud는 등록 시점 prompt 보존)
```

- [ ] **Step 2: MEMORY.md index 갱신**

`/Users/dongseob/.claude/projects/-Users-dongseob-Desktop-claude-project/memory/MEMORY.md` 끝에 추가:

```markdown
- [자동 미팅 routine 운영](project_auto_meeting_routine.md) — 14 페르소나 daily/weekly/retrospect routine 3개, 2026-06-13까지 retrospect 한정 운영
```

- [ ] **Step 3: 사용자 리마인드 (대화)**

운영 시작 안내:
```
자동 미팅 routine 가동 완료. 이제 사용자(CEO)는:

1. 회의 직전 우려 있으면 docs/meetings/_pending/agenda.md (또는 agenda-YYYY-MM-DD.md) 작성 후 push (마감: standup 08:30 KST / all-hands 17:30 KST)
2. 회의록은 docs/meetings/에서 확인 — minutes·_actions.md·_heartbeat.log
3. 문제 시 docs/meetings/README.md §8 문제 해결 표 참조
4. 4주 후 (2026-06-13) saturday retrospect 종료 — 다음 cadence 결정 필요
```

---

## Self-Review Checklist (실행 전)

- [ ] **Spec coverage**: spec §1~§9 모두 task로 매핑되는가?
  - §3 Daily standup → Task 2·5·8.1·9.1
  - §4 Weekly all-hands → Task 3·6·8.2·9.4
  - §5 Saturday retrospect → Task 4·8.3·9.5
  - §6 파일 레이아웃 → Task 1·2·3·4
  - §7 Auto-push → 모든 prompt에 inline
  - §8 비용 가드 → Task 4 (retrospect Phase 3 권고) + Task 9 모니터링
  - §9 Open considerations → Task 7 (GitHub auth)·Task 5·6 (subagent dispatch 검증)·Task 8 (cron 한도)·Task 9 (filename 충돌 처리는 prompt에 inline)
- [ ] **Placeholder scan**: TBD/TODO/"implement later" 없음 — 모든 prompt 본문·cron·파일 경로 명시
- [ ] **Type consistency**:
  - cron `0 0 * * 1-4` (UTC) = KST 09:00 월~목 — Task 8·9 일관
  - 회의록 파일명 `YYYY-MM-DD-standup.md` / `YYYY-MM-DD-weekly-allhands.md` 일관
  - heartbeat 형식 KST 표기 일관 ("[YYYY-MM-DD HH:MM:SS KST]")
  - persona dispatch는 페르소나 파일 *읽기*로 채택 (별도 subagent 등록 불필요)

---

## 비고

- Phase 3·4는 사용자 직접 수행 (cloud UI). Phase 1·2는 Claude Code가 자동.
- prompt 수정 시 cloud routine 재등록 필요 (cloud는 등록 시점 snapshot 보존).
- 첫 1주 운영 후 토요일 retrospect로 cadence·비용·attendance 평가 — 격하 검토.

## Dry-run 결함 후속 (Task 5 결과 반영)

**적용 완료** (daily-standup-prompt.md 인라인 fix):
- 결함 #1: Phase 1.6 모드 결정 표 boundary 명확화 (commit 0건/1~3건/4+건 quantitative)
- 결함 #4: 회의록 §0.1 ⚠️ 본질 위협 surface 요약 섹션 추가

**미해결 (첫 production run에서 모니터링·후속 spec 보강):**
- 결함 #2: 일요일·공휴일 수동 trigger 시 §0 "비표준 실행 요일" 표기 절차 — real cron은 월~목만이라 정상 운영 시 미발생, 발생 시 prompt 자체는 정상 작동
- 결함 #3: §3.4 매핑 표의 `docs/strategy/` 변경 시 "변경 영역 임원" implicit — 파일별 매핑 또는 strategy-manager 판단 위임 필요. dry-run에서는 strategy-manager가 판단으로 잘 처리
- 결함 #5: Phase 2.2 산하 "본인 영역" 정의 — `§3.4 매핑 path` vs `페르소나 책임 영역` 양쪽 모두 cover하면 토큰 cost ↑. 1주 운영 후 retrospect에서 격하 검토
- spec v1.1 본 plan과 동기화 — spec 변경 시 본 plan도 갱신 필요.
