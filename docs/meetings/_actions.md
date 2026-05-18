# BlueBird Action Tracker (live)

> 이 파일은 자동 미팅 routine이 갱신합니다 (spec §6.1). 사용자 직접 편집 가능 — 다음 routine이 인지 후 처리.

## Open

### carry-over (standup 2026-05-10 출처)
- [ ] [CEO] [due-2026-05-17] Phase 3 수행: VAPID 키 생성·등록 + Vercel 환경변수 설정 + 크론 활성화 — **A-2 처리방침 PR 머지 후 활성화 (F-8과 정합)** (출처: 2026-05-10 standup)
- [ ] [CEO] [due-2026-05-17] IM.1 사용자 모집 시작: 알빈 인적 네트워크 50명 1차 초대 — **5/19 조건부 GO로 재조정 예정 (F-16과 정합)** (출처: 2026-05-10 standup)
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
- [x] [PO] F-11 응모 폼 구축 (Q1~Q5 정합 + 동의) — closed by `fa7b355` + `d02f6f0` (2026-05-17). ⚠️ Tally → BlueBird 내부 폼으로 메커니즘 변경, pmf-validation-plan.md §3 M30.1 서면 갱신 필요 (출처: 2026-05-15 weekly-allhands §5 #F-11)
- [ ] [senior-fullstack-engineer] [due-2026-05-18] F-12 cron healthcheck (last_cron_invoked_at + 24h staleness 알림) (출처: 2026-05-15 weekly-allhands §5 #F-12)
- [ ] [senior-fullstack-engineer] [due-2026-05-19] F-13 B-2 v_push_funnel SECURITY INVOKER Migration 16 (출처: 2026-05-15 weekly-allhands §5 #F-13)
- [ ] [senior-fullstack-engineer] [due-2026-05-19] F-14 B-4 metadata Zod enum 화이트리스트 키 강제 (출처: 2026-05-15 weekly-allhands §5 #F-14)
- [ ] [risk-manager] [due-2026-05-18] F-15 B-5 push 카피 lint:copy 룰 ("기분·우울·불안") (출처: 2026-05-15 weekly-allhands §5 #F-15)
- [ ] [CEO] [due-2026-05-18] F-16 IM.1 모집 GO/NO-GO 최종 결정 — F-5·F-9·F-10 ALL clear 확인 후 (출처: 2026-05-15 weekly-allhands §5 #F-16)
- [ ] [data-analyst] [due-2026-05-18] F-17 C-3 이벤트 스펙 (e6c0e62 delta-only 방식) → senior-fullstack 전달 (출처: 2026-05-15 weekly-allhands §5 #F-17)
- [ ] [senior-qa+senior-fullstack] [due-2026-05-19] F-18 C-4 9단계 × 18 event_type 매핑표 재작성 (출처: 2026-05-15 weekly-allhands §5 #F-18)
- [ ] [senior-qa] [due-2026-05-19] F-19 A-1 E2E 9단계 실행 보고서 + AI anomaly baseline (출처: 2026-05-15 weekly-allhands §5 #F-19)
- [ ] [PO+senior-fullstack] [due-2026-05-19] F-20 C-2 측정 SOP docs/im1/measurement-sop.md (출처: 2026-05-15 weekly-allhands §5 #F-20)
- [ ] [senior-fullstack-engineer] [due-2026-05-19] F-21 B-1 service_role 인벤토리 + rls-audit.ts 확장 (출처: 2026-05-15 weekly-allhands §5 #F-21)
- [ ] [content-marketer] [due-2026-05-17] F-22 D-4 이메일 카피 3종 (선정·미통과·follow-up) (출처: 2026-05-15 weekly-allhands §5 #F-22)
- [x] [PO] F-23 _actions.md 5/10 23 actions 개별화 — retrospective close: 2026-05-15 weekly-allhands에서 F-1~F-23으로 개별 등록 완료 (출처: 2026-05-15 weekly-allhands §5 #F-23)

### 신규 actions (2026-05-18 standup)
- [ ] [CEO] [due-2026-05-19] F-10 대응: 인터뷰 가이드 v1 MVP 신규 deadline 설정 + senior-ux-researcher 재지시 — F-16 GO/NO-GO 언블락 선행 조건 (출처: 2026-05-18 standup)
- [ ] [senior-qa-engineer] [due-2026-05-20] Migration 18 RLS 독립 검증: selected_emails 테이블 anon 접근 0건 + auth BEFORE INSERT 트리거 E2E 검증 (가입 블락 정상 + 에러 복구) (출처: 2026-05-18 standup)
- [ ] [risk-manager] [due-2026-05-21] selected_emails 이메일 수집 → 개인정보처리방침 항목 추가 검토 (F-5 연계) + closedBetaBlocked error handling PIPA 정합 확인 (출처: 2026-05-18 standup)

## Closed (this week)

- [x] [PO] F-11 응모 폼 구축 — closed by `fa7b355`+`d02f6f0` (2026-05-17). Tally→내부 폼 메커니즘 변경
- [x] [PO] F-23 _actions.md 개별화 — retrospective close (2026-05-15 weekly-allhands 완료)
- [x] [all-hands] 2026-05-10 23 actions bulk seed — 2026-05-15 weekly-allhands에서 F-1~F-23으로 개별 재등록 처리
- [x] [strategy-manager·content-marketer·performance-marketer] F-1·F-2·F-3·F-4 4건 산출 — 2026-05-15 weekly EOD 즉시 액션, commit `9c72a7a`, closed 2026-05-16 ad-hoc all-hands

## Closed (archive)

(미존재 — 3주 이상 closed 항목 자동 이동)
