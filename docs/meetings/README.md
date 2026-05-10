# BlueBird 자동 미팅 운영 가이드

이 문서는 [`docs/superpowers/specs/2026-05-10-auto-meeting-routine-design.md`](../superpowers/specs/2026-05-10-auto-meeting-routine-design.md)의 *사용자 인터페이스 가이드*. 매일 참조용.

---

## 1. 회의 일정 (KST)

| 요일 | 시간 | 회의 | 산출물 위치 |
|---|---|---|---|
| 월~목 | 09:00 | Daily Standup | `YYYY-MM-DD-standup.md` |
| 금 | 18:00 | Weekly All-Hands | `YYYY-MM-DD-weekly-allhands.md` |
| 토 | 09:00 | Saturday Retrospect (첫 4주 한정) | `_retrospect/YYYY-MM-DD.md` |

주말(일) routine 없음. 토요일은 첫 4주 운영 후 cadence 재평가.

---

## 2. CEO 인풋 — agenda 작성법

### 2.1 어디에?

```
/Users/dongseob/Desktop/Project-BlueBird-mvp/docs/meetings/_pending/agenda.md
```

### 2.2 언제까지?

| 회의 | 마감 (commit + push 기준) |
|---|---|
| 월~목 standup | **해당일 08:30 KST까지** |
| 금 all-hands | **해당일 17:30 KST까지** |
| 토 retrospect | **해당일 08:30 KST까지** |

⚠️ **반드시 push까지 완료**. routine은 Anthropic cloud에서 repo clone하므로 로컬 저장만으론 못 봅니다.

### 2.3 어떻게? (3가지 패턴)

**한 줄 우려** (가장 자주 쓸 형태):
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
디스턴싱 가격 인상(99k → 110k) 시그널. 우리 가격 가설(월 1.9~3.9만원) 변경 트리거? CSO·CMO 의견 정렬 필요.
```

### 2.4 미래 일자 미리 예약

`agenda-YYYY-MM-DD.md` 형식으로 일자 명시:

- `_pending/agenda-2026-05-12.md` → 5/12(월) standup이 처리
- 5/9(금)에 미리 작성해도 5/12 routine까지는 무시
- 복수 미래 agenda 동시 보관 OK

```
_pending/
├── agenda-2026-05-12.md     # 월요일 standup용
├── agenda-2026-05-15.md     # 목요일 standup용
└── agenda-2026-05-16.md     # 금요일 all-hands용
```

각 routine은 *해당 일자 ≤ 오늘*인 모든 agenda 파일 처리 후 비움.

### 2.5 agenda 비우는 책임?

routine이 자동 처리 — 사용자 액션 불필요. 회의 후 `git rm`.

---

## 3. 회의록 어디서 보나?

| 산출물 | 위치 |
|---|---|
| Standup | [`docs/meetings/YYYY-MM-DD-standup.md`](.) |
| Weekly all-hands | [`docs/meetings/YYYY-MM-DD-weekly-allhands.md`](.) |
| Saturday retrospect | [`docs/meetings/_retrospect/YYYY-MM-DD.md`](_retrospect/) |
| Action tracker (live) | [`docs/meetings/_actions.md`](_actions.md) |
| Routine 작동 로그 | [`docs/meetings/_heartbeat.log`](_heartbeat.log) |

---

## 4. Action items 추적

[`_actions.md`](_actions.md) — live tracker. 3 섹션 유지:

```markdown
## Open
- [ ] [owner] [due] action 내용 (출처: YYYY-MM-DD standup/all-hands)

## Closed (this week)
- [x] [owner] action 내용 — closed by <commit-hash> (날짜)

## Closed (archive)
[3주 이상 closed 항목 자동 이동]
```

회의에서 결정된 actions 자동 누적, commit으로 해결되면 자동 close (commit message·파일 path 매칭). 매칭 정확도 미달 시 사용자가 직접 close 권장.

---

## 5. Routine 작동 확인

[`_heartbeat.log`](_heartbeat.log) — 매 routine 1줄 기록:

```
[2026-05-12 09:00:23 KST] standup OK — 5 personas spoke, 2 actions added, push OK
[2026-05-13 09:00:18 KST] standup OK — quiet day case 1, 0 actions, push OK
[2026-05-13 09:00:18 KST] PUSH BLOCKED: behind origin/main by 2 commits — manual resolve needed
[2026-05-15 18:00:42 KST] weekly-allhands OK — 14 personas, 7 actions added, 3 conflicts surfaced
```

PUSH BLOCKED 메시지 발견 시 사용자가 직접 resolve (다음 세션에서 `git pull --rebase`).

---

## 6. 빈 입력일 (Quiet day)

agenda 없음 + 24h git 변화 0 → 임원 4명만 standing items 점검 → 1~3KB minutes 생성. **정상 동작**.

| 케이스 | 처리 |
|---|---|
| 1 완전 조용 | `## 0. Quiet day` 헤더로 명시. CPO·CSO·CTO·CMO standing items만 |
| 2 부분 조용 | 매핑된 산하 + 임원 4명 |
| 3 정체 감지 (3일+ 연속 케이스 1) | Emergent agenda 자동 생성: CPO에 "3일째 git 0 + agenda 0. 무엇이 막고 있는가?" |

---

## 7. 비용 점검

매주 토요일 09:00 retrospect routine이 자동 점검 (첫 4주). [`_retrospect/`](_retrospect/)에서 확인.

수동 점검: `claude.ai/settings/usage` (Anthropic 공식 — 정확한 토큰 사용량).

비용 폭주 가드:
- `extra usage` **OFF 유지** (cap 초과 시 자동 차단)
- 비용 과다 시: weekly all-hands 격주로 / attendance 격하 (B → C)

---

## 8. 문제 해결

| 증상 | 원인·조치 |
|---|---|
| `_heartbeat.log`에 그날 기록 없음 | routine 미작동. `claude.ai/code/routines`에서 status 확인 |
| `agenda.md` 무시됨 | push 안 됐을 가능성 — `git status` → `git push` → 다음 routine 대기 |
| `PUSH BLOCKED` 메시지 | 다른 세션에서 push 진행. `git pull --rebase` 후 다음 routine이 자동 재시도 |
| 회의록에 산하 페르소나 발언이 0건 | 영역 변화 없거나 agenda 호명 없음 — 정상 (§3.4 매핑 참조) |
| 같은 action이 매주 carry-over | ≥3주 미완 시 ⚠️ 표시. 재할당·취소 결정 필요 |
| 토요일 retrospect에서 비용 과다 보고 | weekly all-hands 격주로 / attendance B→C 격하 검토 |

---

## 9. 참고 문서

- 시스템 명세: [`docs/superpowers/specs/2026-05-10-auto-meeting-routine-design.md`](../superpowers/specs/2026-05-10-auto-meeting-routine-design.md)
- 페르소나 정의: [`.claude/agents/`](../../.claude/agents/) (14명)
- CMO Stage 가이드: [`docs/strategy/cmo-stage-guide-v1.md`](../strategy/cmo-stage-guide-v1.md)
- 카테고리 정의: [`docs/strategy/positioning-and-vision-v1.md`](../strategy/positioning-and-vision-v1.md)
- PMF 게이트: [`docs/strategy/pmf-validation-plan.md`](../strategy/pmf-validation-plan.md)
