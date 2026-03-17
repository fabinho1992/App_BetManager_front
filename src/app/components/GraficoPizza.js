"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function GraficoPizza({ ganhas, perdidas }) {
  const data = [
    { name: "Ganhos", value: ganhas },
    { name: "Perdidos", value: perdidas },
  ];

  // cores verde e vermelho vibrantes
  const COLORS = ["#28a745", "#dc3545"];

  // label dentro do slice mostrando percentual
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
        <Cell fill="url(#greenGradient)" />
        <Cell fill="url(#redGradient)" />
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