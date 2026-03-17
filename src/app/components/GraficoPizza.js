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
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60} // donut chart
        outerRadius={100}
        paddingAngle={4} // espaço entre slices
        dataKey="value"
        label={renderLabel}
        labelLine={false}
        isAnimationActive={true}
        animationDuration={1000}
      >
        {data.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index]}
            stroke="#fff" // borda branca fina
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 5px rgba(0,0,0,0.3))" }} // sombra suave
          />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: "#1f1f1f",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "14px",
          border: "none",
        }}
        itemStyle={{ color: "#fff" }}
      />
      <Legend
        verticalAlign="bottom"
        height={36}
        iconType="circle"
        wrapperStyle={{ fontSize: "14px" }}
      />
    </PieChart>
  );
}