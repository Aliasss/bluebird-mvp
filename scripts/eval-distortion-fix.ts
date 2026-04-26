// 라이브 Gemini API 호출로 Fix A+B 검증.
//   - 알빈 false negative 케이스: 1+개 보고되어야 함 (특히 임의적 추론)
//   - 회귀 케이스 3개: 빈 배열로 유지되어야 함 (오탐 X)
//
// 실행: GEMINI_API_KEY=$(grep GEMINI_API_KEY .env.local | cut -d= -f2) tsx scripts/eval-distortion-fix.ts
// (또는 .env.local이 자동 로드되는 환경)

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { analyzeDistortionsWithGemini } from '@/lib/openai/gemini';
import { DistortionTypeKorean } from '@/types';

// .env.local 수동 로드 (Next.js 외부 실행 환경)
function loadEnvLocal() {
  try {
    const text = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local 없으면 환경변수에 의존
  }
}

loadEnvLocal();

interface Case {
  name: string;
  trigger: string;
  thought: string;
  expectAtLeastOne: boolean;
}

const CASES: Case[] = [
  {
    name: 'alvin-false-negative',
    trigger: '빠르게 해야 하는 일이 있는데 생각보다 복잡도가 높고 어렵다.',
    thought: '잘 해낼 수 있을지 모르겠고 이로 인해 조직장이 실망할까 두렵다.',
    expectAtLeastOne: true,
  },
  // 회귀 — eval-cases.ts에서 expectedDistortions: [] 케이스
  {
    name: 'low-distortion-neutral',
    trigger: '회의 중 예상 밖 질문이 나왔다.',
    thought: '당황했지만 다음 회의 전엔 예상 질문 5개를 미리 준비하자.',
    expectAtLeastOne: false,
  },
  {
    name: 'boundary-low-distortion-1',
    trigger: '운동을 3일 연속 빠졌다.',
    thought: '3일 쉬었으니 다시 시작해야 한다. 다음 주부터 다시 루틴을 잡아보자.',
    expectAtLeastOne: false,
  },
  {
    name: 'boundary-low-distortion-2',
    trigger: '협상에서 원하는 조건을 50%만 얻었다.',
    thought: '절반은 얻었지만 나머지도 다음 라운드에서 시도해볼 수 있다.',
    expectAtLeastOne: false,
  },
];

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY 환경변수가 없습니다.');
    process.exit(1);
  }

  let passCount = 0;
  let failCount = 0;

  for (const c of CASES) {
    const t0 = Date.now();
    const result = await analyzeDistortionsWithGemini({
      trigger: c.trigger,
      thought: c.thought,
    });
    const ms = Date.now() - t0;

    const distortions = result.distortions;
    const passed = c.expectAtLeastOne ? distortions.length >= 1 : distortions.length === 0;

    const verdict = passed ? '✅ PASS' : '❌ FAIL';
    if (passed) passCount++;
    else failCount++;

    console.log('\n────────────────────────────────────────');
    console.log(`${verdict}  ${c.name}  (${ms}ms)`);
    console.log(`기대: distortions ${c.expectAtLeastOne ? '≥1개' : '=0개'}`);
    console.log(`결과: distortions ${distortions.length}개`);
    if (distortions.length > 0) {
      for (const d of distortions) {
        console.log(
          `  - ${DistortionTypeKorean[d.type]} (${(d.intensity * 100).toFixed(0)}%) — "${d.segment}"`
        );
        if (d.rationale) console.log(`    근거: ${d.rationale}`);
      }
    }
    console.log(`frame: ${result.frame_type} · category: ${result.trigger_category ?? '?'}`);
  }

  console.log('\n════════════════════════════════════════');
  console.log(`총 ${CASES.length}개 케이스 — PASS ${passCount} · FAIL ${failCount}`);
  process.exit(failCount === 0 ? 0 : 1);
}

run().catch((err) => {
  console.error('실행 중 오류:', err);
  process.exit(1);
});
