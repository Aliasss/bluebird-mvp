'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type CurvePoint = {
  x: number;
  y: number;
};

type UserPoint = {
  x: number;
  y: number;
  label: string;
};

interface ProspectValueChartProps {
  curveData: CurvePoint[];
  userPoint: UserPoint;
}

export default function ProspectValueChart({
  curveData,
  userPoint,
}: ProspectValueChartProps) {
  const yValues = [...curveData.map((point) => point.y), userPoint.y].filter((value) =>
    Number.isFinite(value)
  );
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yPadding = Math.max(0.3, (yMax - yMin) * 0.12);

  return (
    <div className="w-full h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={curveData} margin={{ top: 20, right: 20, left: 24, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[-1, 1]}
            ticks={[-1, -0.5, 0, 0.5, 1]}
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            label={{
              value: '객관적 사건 평가 (손실 ← 0 → 이득)',
              position: 'insideBottom',
              offset: -6,
            }}
          />
          <YAxis
            type="number"
            width={68}
            domain={[yMin - yPadding, yMax + yPadding]}
            label={{
              value: '주관적 가치',
              angle: -90,
              position: 'left',
              offset: 4,
            }}
          />
          <Tooltip
            formatter={(value: unknown) =>
              typeof value === 'number' ? value.toFixed(2) : String(value ?? '')
            }
            labelFormatter={(value) => `x=${(Number(value) * 100).toFixed(0)}%`}
          />
          <ReferenceLine x={0} stroke="#9CA3AF" />
          <ReferenceLine y={0} stroke="#9CA3AF" />
          <Line
            data={curveData}
            dataKey="y"
            type="monotone"
            stroke="#2563EB"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceDot
            x={userPoint.x}
            y={userPoint.y}
            r={6}
            fill="#E11D48"
            stroke="#FFFFFF"
            strokeWidth={2}
            ifOverflow="visible"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
