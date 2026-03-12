"use client";

export default function ResumoVisual({ ganhas, perdidas, canceladas }) {
  const total = ganhas + perdidas + canceladas;

  const calcPercent = (value) =>
    total === 0 ? 0 : ((value / total) * 100).toFixed(1);

  return (
    <div style={{ marginBottom: "20px" }}>
      <Bar label="Ganhas" value={ganhas} percent={calcPercent(ganhas)} color="#22c55e" />
      <Bar label="Perdidas" value={perdidas} percent={calcPercent(perdidas)} color="#ef4444" />
      <Bar label="Canceladas" value={canceladas} percent={calcPercent(canceladas)} color="#64748b" />
    </div>
  );
}

function Bar({ label, percent, color }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        style={{
          background: "#1e293b",
          borderRadius: "6px",
          height: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            background: color,
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}