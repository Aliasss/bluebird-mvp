export type Rank = {
  title: string;
  description: string;
  min: number;
  max: number | null; // null = 상한 없음
};

// design-realignment-v1.md §3 결정 ② — 진척 지표는 분석가 어휘로 *대체* (폐기 아님).
// 등급은 누적 자율성 점수 구간을 *기능 단위*로 라벨링한다.
export const RANKS: Rank[] = [
  { title: '관찰 단계',     description: '자동 사고를 기록하기 시작한 구간',          min: 0,   max: 49  },
  { title: '분류 단계',     description: '왜곡 패턴을 식별·분류하는 구간',            min: 50,  max: 149 },
  { title: '재구성 단계',   description: '대안 사고를 적극적으로 작성하는 구간',      min: 150, max: 299 },
  { title: '검증 단계',     description: 'Δpain·완료율 데이터로 패턴을 검증하는 구간', min: 300, max: 499 },
  { title: '운영 단계',     description: '자기 인지 시스템을 일관되게 운영하는 구간',  min: 500, max: null },
];

export type RankResult = {
  rank: Rank;
  progressPct: number;   // 현재 등급 내 진행률 (0~100)
  pointsToNext: number | null; // 다음 등급까지 남은 점수 (null = 최고 등급)
};

export function getRankResult(score: number): RankResult {
  const rank = RANKS.find((r) => score >= r.min && (r.max === null || score <= r.max))!;

  if (rank.max === null) {
    return { rank, progressPct: 100, pointsToNext: null };
  }

  const rangeSize = rank.max - rank.min + 1;
  const progressPct = Math.min(((score - rank.min) / rangeSize) * 100, 100);
  const pointsToNext = rank.max - score + 1;

  return { rank, progressPct, pointsToNext };
}
