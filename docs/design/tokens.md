# Bluebird Design Tokens

> 마지막 업데이트: 2026-04-26
> 디자인 시스템은 *refined minimalism* 방향. 감각 자극 최소화, 인지 부하 낮은 정밀 미니멀.
> 사용자가 불안 상태로 진입하므로 강한 채도·과한 모션·dramatic shadow는 시스템 1을 자극해 도구 목적과 충돌.

---

## 1. Typography

### 폰트
- **Pretendard variable subset** (jsdelivr CDN, layout.tsx에 preconnect 포함)
- Tailwind `font-sans`로 자동 적용. 별도 클래스 불필요.
- Fallback: `-apple-system`, `BlinkMacSystemFont`, `system-ui`, `Segoe UI`, `Roboto`

### Letter-spacing
| 토큰 | 값 | 용도 |
|---|---|---|
| (글로벌 기본) | `-0.011em` | 본문 — globals.css body에 자동 적용 |
| `tracking-snug` | `-0.01em` | 약한 강조 본문 (자동값과 거의 동일) |
| `tracking-tight` | `-0.02em` | 부제·라벨 |
| `tracking-tighter` | `-0.03em` | 큰 헤딩 (`text-2xl`+) |

### Font weight 매핑
- `font-medium` (500) — 라벨, 강조 본문
- `font-semibold` (600) — 섹션 제목, 카드 헤딩
- `font-bold` (700) — 페이지 제목 (`h1`), 핵심 수치
- `font-extrabold` (800) — 브랜드 워드마크, 큰 수치

### Font feature
globals.css에서 `font-feature-settings: 'ss01', 'tnum'` 글로벌 적용:
- `ss01`: 한·영 혼용 문장의 자간 자연스러움
- `tnum`: 숫자 폭 균일 (테이블·통계 카드 정렬)

---

## 2. Border radius (모서리 위계)

| 토큰 | 용도 |
|---|---|
| `rounded-2xl` | **카드, 패널** (top-level container) |
| `rounded-xl` | **버튼, 입력, 작은 카드** |
| `rounded-full` | **알약 배지, 아바타, 아이콘 버튼** |

위계를 벗어난 사용(예: 본문 카드에 `rounded-lg`)은 *변경할 때 함께* 위 토큰으로 정렬.

---

## 3. Box shadow (elevation)

절제된 2단계만 사용한다. 임의 박힌 `shadow-[0_4px_16px_rgba(...)...]` 류는 *건드릴 때마다* 아래 토큰으로 교체.

| 토큰 | 용도 |
|---|---|
| `shadow-card` | 일반 카드, 정보 패널 |
| `shadow-elev2` | 떠올라야 하는 요소 — FAB, 모달, sticky bar |

그림자가 없는 평면 카드도 합법 — `border border-background-tertiary`만으로 분리해도 충분.

**금지 패턴**:
- `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` — 너무 강함, *AI 티 나는 SaaS 인상*
- 임의 그림자 (`shadow-[...]`) 새로 작성 — 토큰 사용

---

## 4. Color (이미 정의됨, 사용 가이드)

### 기본 팔레트
- `primary` `#1E40AF` (Electric Cobalt Blue) — **유일한 액센트**. 모든 강조·CTA·active state.
- `text-primary` `#0F172A` — 본문 1순위
- `text-secondary` `#475569` — 본문 2순위, 부연설명
- `text-tertiary` `#94A3B8` — 캡션, 메타 정보, 보조 텍스트
- `background` `#F8FAFC` — 페이지 배경
- `background-secondary` `#F1F5F9` — 부드러운 강조 영역 (인용, 메타 박스)
- `background-tertiary` `#E2E8F0` — 테두리, 구분선

### 알림 색 — *알림 시점에만* 노출
- `success` `#16A34A` — 완료·성공 시그널
- `warning` `#D97706` — 주의·미완료
- `danger` `#DC2626` — 에러·위기 자원

### 사용 점검 필요
- `system2` `#0891B2` (Lucid Cyan) — 사용처 확인 후 *유지/제거* 결정
- `distortion` `#E11D48` — 사용처 확인 후 *유지/제거* 결정

> 주 액센트가 분산되면 시각적 위계가 무너진다. 다음 라운드에서 사용처 점검.

---

## 5. Motion

### 허용
- `transition-colors`, `transition-transform`, `transition-all` (단, 200~300ms 내)
- `active:scale-95` 또는 `active:scale-[0.99]` — 버튼 클릭 피드백
- `animate-spin` — 로딩 인디케이터만

### 금지
- 자동 재생 애니메이션 (페이지 진입 시 fade-in 류 X)
- 진동·충격성 모션 (shake, bounce 강도)
- 그라디언트 애니메이션
- 패럴랙스, 스크롤 트리거 모션

---

## 6. 점진 마이그레이션 원칙

기존 페이지를 *일괄 변경하지 않는다*. 다음 규칙으로 점진:

1. **새 페이지 작성 시** — 본 토큰을 처음부터 사용
2. **기존 페이지 수정 시** — 그 페이지의 변경 범위 안에서만 토큰으로 정렬 (스코프 확장 금지)
3. **건드릴 일 없는 페이지** — 그대로 둠. 일괄 변경의 회귀 위험 > 일관성 이득

이 원칙은 사용자(알빈)와의 합의이며, 디자인 통일을 위해 전면 리팩터링을 시도하지 않는다.

---

## 7. 레퍼런스 페이지

새 토큰의 *살아있는 예시*는 다음 페이지에서 확인:

- `app/(public)/sample/page.tsx` — 케이스 선택 (카드 + 버튼)
- `app/(public)/sample/[caseId]/page.tsx` — 분석 결과 페이지 (위계 있는 카드 그룹)

이 둘이 다른 페이지를 정렬할 때의 *기준 reference*다.
