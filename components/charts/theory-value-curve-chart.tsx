'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateProspectValue } from '@/lib/utils';

type ChartPoint = {
  x: number;
  y: number;
  lossBand: number;
};

function buildCurveData(pointCount: number = 80): ChartPoint[] {
  const data: ChartPoint[] = [];
  for (let i = 0; i <= pointCount; i += 1) {
    const x = -1 + (2 * i) / pointCount;
    const y = calculateProspectValue(x, 0.88, 0.88, 2.25);
    data.push({
      x,
      y,
      lossBand: x < 0 ? y : 0,
    });
  }
  return data;
}

const curveData = buildCurveData();

export default function TheoryValueCurveChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[340px]" />;
  }

  return (
    <div className="w-full h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={curveData} margin={{ top: 12, right: 20, left: 8, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[-1, 1]}
            ticks={[-1, -0.5, 0, 0.5, 1]}
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
          />
          <YAxis
            type="number"
            domain={[-3, 1.2]}
            ticks={[-3, -2, -1, 0, 1]}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <Tooltip
            formatter={(value: unknown) =>
              typeof value === 'number' ? value.toFixed(2) : String(value ?? '')
            }
            labelFormatter={(value) => `준거점 대비 변화량: ${(Number(value) * 100).toFixed(0)}%`}
          />
          <ReferenceLine x={0} stroke="#9CA3AF" />
          <ReferenceLine y={0} stroke="#9CA3AF" />
          <Area type="monotone" dataKey="lossBand" stroke="none" fill="#FEE2E2" />
          <Line
            dataKey="y"
            type="monotone"
            stroke="#2563EB"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
