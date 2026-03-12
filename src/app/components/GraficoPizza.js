import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function GraficoPizza({ ganhas, perdidas }) {

  const data = [
    { name: "Ganhas", value: ganhas },
    { name: "Perdidas", value: perdidas }
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  // 👇 função que coloca o valor dentro da fatia
  const renderLabel = ({ percent }) => {
    return `${(percent * 100).toFixed(0)}%`;
  };

  return (
    <PieChart width={400} height={300}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={100}
        dataKey="value"
        label={renderLabel}
        labelLine={false}
      >
        {data.map((entry, index) => (
          <Cell key={index} fill={COLORS[index]} />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  );
}