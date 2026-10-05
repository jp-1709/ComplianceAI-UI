import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CommandCenterData } from "@/services/compliance";

const tooltipStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: "10px",
  background: "var(--color-popover)",
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

export function PostureSparkline({ data }: { data: CommandCenterData["postureTrend"] }) {
  return (
    <ResponsiveContainer width="100%" height={72}>
      <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Posture"]} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          animationDuration={700}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EntityScoreChart({ data }: { data: CommandCenterData["entityScores"] }) {
  return (
    <ResponsiveContainer width="100%" height={238}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          width={120}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [`${value}%`, "Compliance score"]}
        />
        <Bar dataKey="score" radius={[0, 5, 5, 0]} animationDuration={700}>
          {data.map((item) => (
            <Cell
              key={item.id}
              fill={
                item.score >= 85
                  ? "var(--color-compliant)"
                  : item.score >= 75
                    ? "var(--color-primary)"
                    : "var(--color-critical)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TaskAgeingChart({ data }: { data: CommandCenterData["taskAgeing"] }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -26 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Open tasks"]} />
        <Bar
          dataKey="count"
          fill="var(--color-primary)"
          radius={[5, 5, 0, 0]}
          animationDuration={750}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
