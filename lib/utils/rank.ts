export type Rank = {
  title: string;
  description: string;
  min: number;
  max: number | null; // null = 상한 없음
};

export const RANKS: Rank[] = [
  { title: '견습 항해사', description: '나침반의 바늘을 읽기 시작한 단계', min: 0,   max: 49  },
  { title: '항해사',      description: '스스로 파도를 넘는 법을 익힌 단계',   min: 50,  max: 149 },
  { title: '숙련 항해사', description: '안개 속에서도 별빛을 찾는 단계',       min: 150, max: 299 },
  { title: '선장',        description: '자신만의 항로를 확립한 단계',           min: 300, max: 499 },
  { title: '제독',        description: '마음의 바다를 완전히 통찰한 단계',     min: 500, max: null },
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
