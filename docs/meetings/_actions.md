# BlueBird Action Tracker (live)

> 이 파일은 자동 미팅 routine이 갱신합니다 (spec §6.1). 사용자 직접 편집 가능 — 다음 routine이 인지 후 처리.

## Open

### carry-over (standup 2026-05-10 출처)
- [x] [CEO] [due-2026-05-17] Phase 3 수행: VAPID 키 생성·등록 + Vercel 환경변수 설정 + 크론 활성화 — **CTO 5/22 증거 기반 완료 판정: webpush 동작 확인 (notification_events push_sent 적재 중). closed 2026-05-22 weekly-allhands** (출처: 2026-05-10 standup)
- [ ] [CEO] [due-2026-05-17] IM.1 사용자 모집 시작: 알빈 인적 네트워크 50명 1차 초대 — **Brunch 5/21 공개 완료. 인적 네트워크 직접 초대 현황 불명. ⚠️ 5일 초과 (performance-marketer G-1 연계)** (출처: 2026-05-10 standup)
- [ ] [senior-fullstack-engineer] [due-2026-05-24] `app/privacy/page.tsx` push subscription 데이터 처리 항목 추가 (출처: 2026-05-10 standup §2.3)
- [ ] [senior-qa-engineer] [due-2026-05-24] iOS 실기기 push 수신 E2E 검증 — Phase 3 완료 후 (출처: 2026-05-10 standup §2.2)

### 신규 actions (2026-05-15 weekly-allhands)
<!-- F-1·F-2·F-3·F-4 산출 완료 (commit 9c72a7a). 2026-05-16 ad-hoc all-hands §5 #1 결의로 [x] 처리 -->
- [x] [strategy-manager] [due-2026-05-15] A-3 rubric v0.1 surface — `docs/im1/coding-rubric-v0.1-im1-quickstart.md` (출처: 2026-05-15 weekly-allhands §5 #F-1, closed 2026-05-16)
- [x] [content-marketer] [due-2026-05-15] D-1 brand-voice-lexicon-v1.md draft commit — `docs/im1/brand-voice-lexicon-v1.md` (출처: 2026-05-15 weekly-allhands §5 #F-2, closed 2026-05-16)
- [x] [performance-marketer] [due-2026-05-15] D-2+D-3 SMTP stagger + UTM + funnel events v0 draft — `docs/im1/recruitment-ops-v0-2026-05-15.md` (출처: 2026-05-15 weekly-allhands §5 #F-3, closed 2026-05-16)
- [x] [strategy-manager] [due-2026-05-15] E-1 디스턴싱·하루콩 스냅샷 v0 CSO 보고 — `docs/im1/competitor-snapshot-distancing-harukong-v0-2026-05-15.md` (출처: 2026-05-15 weekly-allhands §5 #F-4, closed 2026-05-16)
- [ ] [risk-manager] [due-2026-05-16] F-5 처리방침·약관 push+notification_events 항목 추가 PR 머지 (출처: 2026-05-15 weekly-allhands §5 #F-5)
- [ ] [product-designer] [due-2026-05-16] F-6 iPhone SE 320px 실기 테스트 보고서 (출처: 2026-05-15 weekly-allhands §5 #F-6)
- [ ] [data-analyst] [due-2026-05-16] F-7 PMF 게이트 분모·분자 1-pager draft (출처: 2026-05-15 weekly-allhands §5 #F-7)
- [ ] [CEO] [due-2026-05-17] F-8 Phase 3 VAPID 키 생성·Vercel 설정 — A-2 PR 머지 후 (출처: 2026-05-15 weekly-allhands §5 #F-8)
- [ ] [CSO+CPO] [due-2026-05-18] F-9 rubric v1.0 CSO 3축 매핑 + frozen 표기 (출처: 2026-05-15 weekly-allhands §5 #F-9)
- [ ] [senior-ux-researcher] [due-2026-05-18] F-10 인터뷰 가이드 v1 MVP (10문항 최소판) — 5/18 09:00 KST hard deadline (출처: 2026-05-15 weekly-allhands §5 #F-10)
- [x] [PO] [due-2026-05-18] F-11 응모 폼 구축 (Tally, Q1~Q5 정합 + 동의) — **AC 초과 달성: 자체 /apply 시스템으로 구현 (d02f6f0·ba46583). closed 2026-05-22 weekly-allhands §4.1 (F-19 /apply 회귀 케이스 조건부)** (출처: 2026-05-15 weekly-allhands §5 #F-11)
- [ ] [senior-fullstack-engineer] [due-2026-05-18] F-12 cron healthcheck (last_cron_invoked_at + 24h staleness 알림) (출처: 2026-05-15 weekly-allhands §5 #F-12)
- [ ] [senior-fullstack-engineer] [due-2026-05-19] F-13 B-2 v_push_funnel SECURITY INVOKER Migration 16 (출처: 2026-05-15 weekly-allhands §5 #F-13)
- [ ] [senior-fullstack-engineer] [due-2026-05-19] F-14 B-4 metadata Zod enum 화이트리스트 키 강제 (출처: 2026-05-15 weekly-allhands §5 #F-14)
- [ ] [risk-manager] [due-2026-05-18] F-15 B-5 push 카피 lint:copy 룰 ("기분·우울·불안") (출처: 2026-05-15 weekly-allhands §5 #F-15)
- [x] [CEO] [due-2026-05-18] F-16 IM.1 모집 GO/NO-GO 최종 결정 — F-5·F-9·F-10 ALL clear 확인 후 — **Brunch 5/21 09:30 공개 (c0ae21b). 사실상 GO. closed 2026-05-22 weekly-allhands** (출처: 2026-05-15 weekly-allhands §5 #F-16)
- [ ] [data-analyst] [due-2026-05-18] F-17 C-3 이벤트 스펙 (e6c0e62 delta-only 방식) → senior-fullstack 전달 (출처: 2026-05-15 weekly-allhands §5 #F-17)
- [ ] [senior-qa+senior-fullstack] [due-2026-05-19] F-18 C-4 9단계 × 18 event_type 매핑표 재작성 (출처: 2026-05-15 weekly-allhands §5 #F-18)
- [ ] [senior-qa] [due-2026-05-19] F-19 A-1 E2E 9단계 실행 보고서 + AI anomaly baseline (출처: 2026-05-15 weekly-allhands §5 #F-19)
- [ ] [PO+senior-fullstack] [due-2026-05-19] F-20 C-2 측정 SOP docs/im1/measurement-sop.md (출처: 2026-05-15 weekly-allhands §5 #F-20)
- [ ] [senior-fullstack-engineer] [due-2026-05-19] F-21 B-1 service_role 인벤토리 + rls-audit.ts 확장 (출처: 2026-05-15 weekly-allhands §5 #F-21)
- [ ] [content-marketer] [due-2026-05-17] F-22 D-4 이메일 카피 3종 (선정·미통과·follow-up) (출처: 2026-05-15 weekly-allhands §5 #F-22)
- [x] [PO] [due-2026-05-15] F-23 _actions.md 5/10 23 actions 개별화 — **superseded by F-1~F-23 재등록 (2026-05-15 weekly에서 처리). closed 2026-05-22 weekly-allhands** (출처: 2026-05-15 weekly-allhands §5 #F-23)

### 신규 actions (2026-05-22 weekly-allhands)
- [ ] [CEO] [due-2026-05-23] G-1 `/apply` PIPA 보완 PR: (1) 만 14세 연령 확인 체크박스 (2) 국외이전 동의 1줄 (3) 수집항목·목적·보유기간 고지 블록 (4) 처리방침 인라인 링크 복원 — ⚠️ 라이브 위반 중 (출처: 2026-05-22 weekly-allhands §5 #G-1)
- [ ] [senior-fullstack-engineer] [due-2026-05-23] G-2 F-13: `v_push_funnel` `security_invoker=on` 1줄 migration 20 — 30분 작업 (출처: 2026-05-22 weekly-allhands §5 #G-2)
- [ ] [CSO+CPO] [due-2026-05-22] G-3 F-9: rubric v1.0 frozen 표기 추가 — 오늘 all-hands 직후 처리 (출처: 2026-05-22 weekly-allhands §5 #G-3)
- [ ] [senior-ux-researcher] [due-2026-05-23] G-4 응모 폼 Q1~Q5 placeholder 유도어휘 audit + coding-rubric §0 블랙리스트 대조 → cohort 태깅 기준 도출 (출처: 2026-05-22 weekly-allhands §5 #G-4)
- [ ] [senior-ux-researcher] [due-2026-05-23] G-5 F-10: 인터뷰 가이드 v1 MVP 10문항 파일 생성 (`docs/im1/interview-guide-v1.md`) — 첫 인터뷰 전 필수 (출처: 2026-05-22 weekly-allhands §5 #G-5)
- [ ] [content-marketer] [due-2026-05-24] G-6 F-22: 미통과·follow-up 이메일 카피 2종 SSOT 작성 + Brunch 글 본문 `docs/im1/` 아카이빙 + 6축 점검표 (출처: 2026-05-22 weekly-allhands §5 #G-6)
- [ ] [data-analyst] [due-2026-05-23] G-7 F-17: `log_view` QA 체크리스트 + 잔여 C-3 delta 스펙 → senior-fullstack 전달 (출처: 2026-05-22 weekly-allhands §5 #G-7)
- [ ] [risk-manager] [due-2026-05-24] G-8 F-5: 처리방침 통합 PR (push subscription + notification_events + 국외이전 + 30일 보유기간 항목 추가) (출처: 2026-05-22 weekly-allhands §5 #G-8)
- [ ] [risk-manager] [due-2026-05-22] G-9 F-15: push 카피 lint:copy 차단 어휘 목록 → senior-fullstack 전달 (출처: 2026-05-22 weekly-allhands §5 #G-9)
- [ ] [data-analyst] [due-2026-05-24] G-10 F-7: PMF 게이트 분모·분자 1-pager (잔존·자발·결제 3종 + 입력 이탈률 SQL + N=30 CI 가드) [분모 정의 CPO 결정 선결] (출처: 2026-05-22 weekly-allhands §5 #G-10)
- [ ] [product-designer] [due-2026-05-23] G-11 F-6: iPhone SE 320px 실기 테스트 보고서 (신설 5화면 포함 + ApplyForm 라디오 WCAG 2.4.7 점검) (출처: 2026-05-22 weekly-allhands §5 #G-11)
- [ ] [PO+senior-fullstack-engineer] [due-2026-05-25] G-12 F-20: C-2 측정 SOP (`docs/im1/measurement-sop.md`) — 메트릭 분자/분모/코호트/인프라 + N 신뢰구간 가드 + D7/D14 점검 시점 (출처: 2026-05-22 weekly-allhands §5 #G-12)
- [ ] [senior-fullstack-engineer] [due-2026-05-24] G-13 F-21: `rls-audit.ts`에 `evangelist_applications`·`selected_emails` 커버리지 추가 (anon SELECT 0건 확인) (출처: 2026-05-22 weekly-allhands §5 #G-13)
- [ ] [senior-fullstack-engineer] [due-2026-05-24] G-14 F-14: `app/api/notifications/event/route.ts` metadata Zod enum 화이트리스트 키 강제 (출처: 2026-05-22 weekly-allhands §5 #G-14)
- [ ] [senior-fullstack-engineer] [due-2026-05-25] G-15 F-12: cron healthcheck — `last_cron_invoked_at` + 24h staleness 알림 migration (출처: 2026-05-22 weekly-allhands §5 #G-15)
- [ ] [senior-qa+senior-fullstack-engineer] [due-2026-05-25] G-16 F-18: 9단계 × event_type 매핑표 재작성 (migration 19 기준 신규 동선 반영, `log_view` 포함) (출처: 2026-05-22 weekly-allhands §5 #G-16)
- [ ] [strategy-manager+senior-ux-researcher] [due-2026-05-24] G-17 인터뷰 가이드 v1 ↔ rubric v0.1 §6 유도어휘 교차검증 30분 (출처: 2026-05-22 weekly-allhands §5 #G-17)
- [ ] [senior-fullstack-engineer] [due-2026-05-24] G-18 lint:copy tsx devDependency 복구 — `npm run lint:copy` 정상 가동 (출처: 2026-05-22 weekly-allhands §5 #G-18)
- [ ] [content-marketer] [due-2026-05-25] G-19 외부 채널 발행 funnel brand-voice 사인오프 게이트 추가 (다음 채널 글 공개 전) (출처: 2026-05-22 weekly-allhands §5 #G-19)
- [ ] [senior-fullstack-engineer] [due-2026-05-25] G-20 UTM `auth.signUp` → `raw_user_meta_data` 5종 적재 구현 [CEO D-4 결정 후 착수] (출처: 2026-05-22 weekly-allhands §5 #G-20)

## Closed (this week)

- [x] [all-hands] 2026-05-10 23 actions bulk seed — 2026-05-15 weekly-allhands에서 F-1~F-23으로 개별 재등록 처리
- [x] [strategy-manager·content-marketer·performance-marketer] F-1·F-2·F-3·F-4 4건 산출 — 2026-05-15 weekly EOD 즉시 액션, commit `9c72a7a`, closed 2026-05-16 ad-hoc all-hands

## Closed (archive)

(미존재 — 3주 이상 closed 항목 자동 이동)
