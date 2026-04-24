# RLS Audit Report — Project BlueBird MVP

**작성일:** 2026-04-25
**감사자:** Claude (Static analysis) + 사용자 (Runtime verification 필요)
**범위:** `supabase/migrations/` + 저장소 전체 코드의 `supabase.from(...)` 호출 경로
**방법:** 정적 분석 (파일 읽기 + grep). 실제 Supabase 인스턴스 접속 없이 저장소 상태만 기준.

---

## Executive Summary

- **Critical 이슈 4건** — 즉시 조치 필요
- **Important 이슈 2건** — v1 이전 조치 권장
- **OK 항목 다수** — `logs`, `safety_events`는 정책 체계 양호

가장 우려되는 문제는 **저장소의 마이그레이션 파일과 실제 Supabase DB 상태가 동기화되지 않았다는 점**입니다. 코드는 존재하지만 마이그레이션에 정의되지 않은 테이블/컬럼을 사용하고 있어, 저장소만으로는 실제 DB의 RLS 상태를 확정할 수 없습니다.

---

## 코드에서 사용 중인 테이블 (전수조사)

| 테이블 | 마이그레이션 정의 | 코드 사용처 |
|--------|------------------|------------|
| `logs` | ✅ `01_initial_schema.sql` | 다수 |
| `analysis` | ✅ `01_initial_schema.sql` + `02_protocol_fields.sql` | 다수 |
| `intervention` | ✅ `01_initial_schema.sql` + `02_protocol_fields.sql` | 다수 |
| `checkins` | ❌ **없음** | `app/api/checkin/route.ts` |
| `safety_events` | ✅ `03_safety_events.sql` | `app/api/analyze/route.ts`, `app/api/safety/override/route.ts` |

---

## Critical 이슈

### C1. `checkins` 테이블 마이그레이션 파일 누락

**문제:** `app/api/checkin/route.ts`가 `supabase.from('checkins')`를 호출하여 `{ user_id, type, mood_word, system2_moment, created_at }` 형태의 row를 insert/select 한다. 그러나 `supabase/migrations/` 어디에도 `CREATE TABLE checkins` 문장이 없다.

**의미:**
- Production Supabase DB에는 이 테이블이 **존재한다**(체크인 기능이 사용자에게 작동 중이므로). 누군가 대시보드 SQL Editor에서 수동 생성했거나, 제거된 마이그레이션이 있었다는 뜻.
- 저장소만 보고 migration을 재적용하면 **`checkins` 테이블이 누락된 채 배포**된다. 체크인 기능 즉시 고장.
- 이 테이블의 RLS 상태(활성화 여부, 정책 존재 여부)가 저장소 감사로는 **확정 불가능**.

**재현:**
1. 새 Supabase 프로젝트 생성
2. `01_initial_schema.sql` ~ `03_safety_events.sql` 순서대로 적용
3. 앱에서 `/checkin` 접속 → insert 시 `relation "checkins" does not exist` 에러

**권장 조치:**
- [ ] 현재 production DB에서 `checkins` 테이블 DDL 추출 (대시보드 Table Editor → Definition)
- [ ] `supabase/migrations/00_checkins.sql` 또는 적절한 순번으로 저장소에 커밋
- [ ] RLS 상태 확인. 활성화되어 있지 않다면 즉시 `ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;` + 4개 정책 추가
- [ ] 향후 마이그레이션 변경은 **반드시 저장소 PR로 관리**하는 프로세스 수립

---

### C2. `logs.log_type`, `logs.pain_score` 컬럼 마이그레이션 누락

**문제:**
- `app/api/success-log/route.ts:38`에서 `.insert({ ..., log_type: 'success' })`
- `app/log/page.tsx`에서 `pain_score: 1~5` 저장
- 그러나 `01_initial_schema.sql`의 `logs` 테이블 정의에 이 두 컬럼 없음
- `02_protocol_fields.sql`은 `analysis`·`intervention` 확장만, `logs` 미확장

**의미:**
- Production DB에는 이 컬럼들이 존재 (코드가 작동 중). 역시 수동 `ALTER TABLE` 흔적.
- 저장소 재적용 시 `column "pain_score" does not exist` 에러 → 로그 저장 완전 실패

**권장 조치:**
- [ ] 현재 production `logs` 테이블의 실제 컬럼 리스트 확인
- [ ] 누락된 `ALTER TABLE logs ADD COLUMN ...` 문을 저장소에 추가 마이그레이션으로 커밋

---

### C3. `analysis.distortion_type` NOT NULL 제약 드리프트

**문제:** `01_initial_schema.sql:18`에 `distortion_type TEXT NOT NULL CHECK (...)` 정의. 그러나 `app/api/analyze/route.ts:201`에서 `distortion_type: null`로 insert (스트릭 플레이스홀더 목적). 이 코드가 작동 중이라면 production에서 `ALTER COLUMN distortion_type DROP NOT NULL`이 실행된 상태.

**의미:**
- DB 제약과 코드 의도의 시맨틱 차이 — 원래 스키마는 null 허용 안 하려 했는데 코드는 의존. 의도적이든 아니든 **저장소 재현 불가**.

**권장 조치:**
- [ ] 제약 유지 여부 결정 (null 허용이 의도적이라면 `DROP NOT NULL` 마이그레이션 커밋)
- [ ] 코드 주석에 null insert의 의도(스트릭 플레이스홀더) 명시

---

### C4. `analysis` 테이블 DELETE 정책 누락

**문제:** `app/api/analyze/route.ts:238`:
```ts
const { error: deleteError } = await supabase.from('analysis').delete().eq('log_id', logId);
```
그러나 `01_initial_schema.sql`의 `analysis` RLS 정책은 **SELECT + INSERT**만 있음. DELETE 정책 없음.

PostgreSQL RLS 기본: 정책 없는 operation은 **deny**. 즉 RLS가 제대로 활성화돼 있다면 이 `.delete()` 호출은 **항상 실패**해야 한다.

**가능한 상황 중 하나:**
1. 실제로는 `analysis` RLS가 제대로 활성화되지 않았다 (Security disaster)
2. Service role key로 호출되고 있다 (코드가 server component/route handler이고 server-side supabase 클라이언트가 service role 사용 중인지 확인 필요)
3. DELETE가 늘 실패하는데 deleteError → 500 반환되는 게 사용자에게 보인다 (고장 상태)

**재현:**
1. 같은 log를 2번 분석 시도 → 2번째 시도에서 캐시 무효화를 위해 analysis.delete() → deleteError 발생 → 사용자에게 "기존 분석 데이터 삭제에 실패했습니다" 메시지

**권장 조치:**
- [ ] 즉시 런타임 감사 — 실제 production DB의 `analysis` RLS 상태 확인
- [ ] 누락된 DELETE 정책 마이그레이션 추가:
```sql
CREATE POLICY "Users can delete own analysis" ON analysis
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM logs
      WHERE logs.id = analysis.log_id
      AND logs.user_id = auth.uid()
    )
  );
```
- [ ] Supabase 클라이언트가 use anon key vs service role key 전수조사. 서버 라우트에서 service role 쓰면 RLS 우회됨 — 의도적인지 확인

---

## Important 이슈

### I1. `analysis` UPDATE 정책 누락

**문제:** RLS 정책은 SELECT + INSERT만. UPDATE 정책 없음.

**현재 영향:** 코드 전수조사 결과 `analysis.update()` 호출 **없음**. 즉 지금은 문제 안 됨.

**미래 영향:** 재분석·점수 보정 등 UPDATE가 필요해지는 시점에 명시적으로 추가 필요.

**권장:** v1 기능 추가 시 같이 처리.

---

### I2. `intervention`, `safety_events` DELETE 정책 누락

**문제:** 두 테이블 모두 DELETE 정책 없음.

**현재 영향:** 코드에서 이들 테이블 `.delete()` 호출 없음 → v0 범위에선 문제 없음.

**미래 영향:** 사용자 "내 데이터 삭제" 기능 구현 시 필요. GDPR·개인정보보호법 관점에서는 언젠가는 필요.

**권장:** 데이터 삭제 기능 구현 시 함께 추가.

---

## OK 항목 (정적 감사에서 문제 없음)

### `logs` 테이블
- RLS 활성화 ✓
- 정책 4개(SELECT, INSERT, UPDATE, DELETE) 모두 존재 ✓
- 모든 정책이 `auth.uid() = user_id` 사용 ✓
- INSERT는 `WITH CHECK`, SELECT/UPDATE/DELETE는 `USING` — 정확한 사용 ✓

### `safety_events` 테이블 (`03_safety_events.sql`)
- RLS 활성화 ✓
- 정책 3개(SELECT, INSERT, UPDATE) 존재 ✓
- `auth.uid() = user_id` 일관 ✓
- `level`, `detected_by` CHECK 제약 명시 ✓
- `log_id` FK ON DELETE SET NULL — logs 삭제 시 safety_events는 보존되고 link만 제거 (의도 OK)

### `intervention` 테이블
- RLS 활성화 ✓
- SELECT, INSERT, UPDATE via EXISTS join to logs — `logs.user_id = auth.uid()` 패턴 올바름 ✓
- Cascade: `logs` 삭제 시 자동 삭제

### `analysis` 테이블 (부분 OK)
- RLS 활성화 ✓
- SELECT, INSERT via EXISTS join — 올바름 ✓
- **그러나 DELETE 정책 누락 (C4 참조)**

---

## 정적 감사로 **확정할 수 없는** 것 (런타임 확인 필요)

정적 감사의 근본적 한계 — 저장소는 "의도"를 보여주고 실제 DB는 "현실"을 반영한다. 둘이 다를 때 안전을 판단하려면 실제 DB를 봐야 한다.

1. **실제 production DB의 RLS 활성화 상태**
   - 위 정책들이 DB에 실제로 존재하고 활성화되어 있는지는 저장소로 알 수 없음

2. **두 유저 간 데이터 격리가 실제로 작동하는지**
   - 정책 SQL은 읽어서 맞지만, 실 세션으로 시도하면 정책이 의도대로 trigger되는지 확인 필요

3. **Service role key 사용처**
   - `lib/supabase/server.ts`가 anon key를 쓰는지 service role key를 쓰는지, service role이면 어떤 api에서 쓰는지 파악 필요
   - Service role은 RLS 우회하므로 사용 범위가 명확해야 함

4. **스키마 drift의 세부 범위 (C1~C3)**
   - production 실제 스키마 전수조사 필요

→ 이 항목들은 **사용자 수동 확인 체크리스트**(이 문서 아래)와 **런타임 감사 스크립트**(`scripts/rls-audit.ts`, 별도)에서 다룸.

---

## 사용자 수동 확인 체크리스트

정적 감사로는 못 잡는 항목들. Supabase 대시보드 접근이 필요합니다.

### 필수 (이번 주 내 권장)

**1. `checkins` 테이블 존재·RLS 확인**
- [ ] Supabase 대시보드 → Table Editor → `checkins` 테이블 열기
- [ ] 우측 상단 `Definition` 탭에서 DDL 확인 → 저장소에 `04_checkins.sql`로 커밋
- [ ] 좌측 방패 아이콘이 초록(RLS enabled) 확인
- [ ] Policies 탭에서 SELECT/INSERT 정책이 `auth.uid() = user_id`로 걸려있는지 확인

**2. `analysis` DELETE 정책 확인**
- [ ] Supabase 대시보드 → Authentication → Policies → `analysis` 테이블
- [ ] DELETE 정책 존재 여부 확인
- [ ] 없다면 즉시 아래 SQL 실행:
```sql
CREATE POLICY "Users can delete own analysis" ON analysis
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM logs
      WHERE logs.id = analysis.log_id
      AND logs.user_id = auth.uid()
    )
  );
```
- [ ] 저장소에 `04_analysis_delete_policy.sql`로 커밋

**3. `logs`, `analysis`, `intervention`, `checkins`, `safety_events` 모든 테이블 RLS 활성화 확인**
- [ ] 대시보드 → Table Editor → 각 테이블 좌측 방패 아이콘 초록 확인
- [ ] 하나라도 회색이면 즉시 ENABLE

**4. 스키마 drift 해소**
- [ ] 각 테이블 Definition 확인 → 저장소 마이그레이션과 대조 → 차이점을 새 마이그레이션 파일로 커밋
- [ ] 특히 `logs.log_type`, `logs.pain_score`, `analysis.distortion_type NULL 허용` 확인

### 권장 (v1 진입 전)

**5. Service role key 사용 전수조사**
- [ ] `grep -rE "SERVICE_ROLE" app/ lib/ .env.local` → 어디서 쓰는지 확인
- [ ] Server component나 Route Handler에서 anon key를 쓰고 있는지, service role을 쓰는지 확인
- [ ] service role 사용 시 그 근거(RLS로 해결 불가한 작업인지) 주석 명시

**6. 런타임 2-유저 감사 실행**
- [ ] 별도 제공된 `scripts/rls-audit.ts` 스크립트 실행
- [ ] 모든 테이블에 대해 "유저 A → 유저 B 데이터 접근 불가"가 실제로 작동하는지 검증

---

## 다음 단계

1. **지금 이 문서 PR/메모로 공유** — 팀·본인이 C1~C4 우선순위 인지
2. **런타임 감사 스크립트 실행** — 사용자가 직접 (`scripts/rls-audit.ts` 안내 참조)
3. **스키마 동기화 PR** — C1~C3 해소용 마이그레이션 추가
4. **C4 즉시 hotfix** — `analysis` DELETE 정책 추가 (프로덕션에 빈 테이블이 아니므로 즉시 적용 안전)

---

## 감사 방법론 기록

- **도구:** `grep`, `cat` (저장소 내 파일만)
- **범위:** `supabase/migrations/*.sql` + `grep -r "supabase.from(" app/ lib/`
- **시간:** ~20분
- **재현:** 이 문서의 각 Critical 이슈 "재현" 섹션 참조

*본 감사는 저장소 스냅샷(commit `40e4ac3`) 기준이며, 이후 커밋으로 상황이 바뀔 수 있음. 주요 스키마 변경 시 재감사 권장.*
