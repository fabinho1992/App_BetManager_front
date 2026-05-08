"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function GraficoPizza({ ganhas = 0, perdidas = 0, pendentes = 0 }) {
  const data = [
    { name: "Ganhas", value: ganhas },
    { name: "Perdidas", value: perdidas },
    { name: "Pendentes", value: pendentes },
  ].filter((item) => item.value > 0);

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <PieChart width={400} height={300}>
      <defs>
        <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00e676" />
          <stop offset="100%" stopColor="#00c853" />
        </linearGradient>

        <linearGradient id="redGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff5252" />
          <stop offset="100%" stopColor="#d50000" />
        </linearGradient>

        <linearGradient id="grayGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
      </defs>

      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={4}
        dataKey="value"
        label={renderLabel}
        labelLine={false}
      >
        {data.map((item) => {
          if (item.name === "Ganhas") {
            return <Cell key={item.name} fill="url(#greenGradient)" />;
          }

          if (item.name === "Perdidas") {
            return <Cell key={item.name} fill="url(#redGradient)" />;
          }

          return <Cell key={item.name} fill="url(#grayGradient)" />;
        })}
      </Pie>

      <Tooltip
        contentStyle={{
          backgroundColor: "#1f1f1f",
          borderRadius: "8px",
          color: "#fff",
          border: "none",
        }}
      />

      <Legend iconType="circle" />
    </PieChart>
  );
}