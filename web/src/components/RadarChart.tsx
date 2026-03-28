import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { Score } from "../types.js";

interface RadarChartProps {
  score: Score;
}

const DIMENSIONS = [
  { key: "novelty" as const, label: "Novelty" },
  { key: "usefulness" as const, label: "Usefulness" },
  { key: "feasibility" as const, label: "Feasibility" },
  { key: "testability" as const, label: "Testability" },
  { key: "speedToMvp" as const, label: "Speed to MVP" },
  { key: "defensibility" as const, label: "Defensibility" },
  { key: "clarity" as const, label: "Clarity" },
];

function compositeColor(score: number): string {
  if (score >= 7) return "#10b981";
  if (score >= 4) return "#f59e0b";
  return "#ef4444";
}

export function RadarChart({ score }: RadarChartProps) {
  const data = DIMENSIONS.map((d) => ({
    dimension: d.label,
    value: score[d.key],
    fullMark: 10,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <RechartsRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
      <div
        style={{
          textAlign: "center",
          fontSize: 28,
          fontWeight: 700,
          color: compositeColor(score.composite),
          marginTop: 4,
        }}
      >
        {score.composite.toFixed(1)}{" "}
        <span style={{ fontSize: 16, color: "#6b7280" }}>/ 10</span>
      </div>
    </div>
  );
}
