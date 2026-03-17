"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import form from "@/styles/form.module.css";
import layout from "@/styles/layout.module.css";
import toast from "react-hot-toast";


export default function CriarBilhete() {
  const [odd, setOdd] = useState("");
  const [valorApostado, setValorApostado] = useState("");
  const [tipoAposta, setTipoAposta] = useState(null);
  const [statusAposta, setStatusAposta] = useState(null);
  const [casaAposta, setCasaAposta] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/");
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      await api.post("/bilhete", {
        odd: Number(odd),
        valorApostado: Number(valorApostado),
        tipoBanca: tipoAposta,
        statusEnum: statusAposta,
        casaAposta: casaAposta

      });

      toast.success("Bilhete criado com sucesso!");
      router.push("/bilhetes");

    } catch (error) {
      console.error("Erro completo:", error);
      console.error("Response:", error.response?.data);
      toast.error("Erro ao criar bilhete");
    }
    finally {
      setLoading(false);
    }
  }
  return (
    <div className={layout.container}>
      <div className={layout.card}>
        <h1>Novo Bilhete</h1>

        <form className={form.form} onSubmit={handleSubmit}>
          <input
            className={form.input}
            type="number"
            placeholder="Odd"
            value={odd}
            onChange={e => setOdd(e.target.value)}
          />

          <input
            className={form.input}
            type="number"
            placeholder="Valor Apostado"
            value={valorApostado}
            onChange={e => setValorApostado(e.target.value)}
          />

          <select
            className={form.input}
            value={casaAposta ?? ""}
            onChange={e => setCasaAposta(Number(e.target.value))}
          >
            <option value="">Selecione o tipo</option>
            <option value="1">Betano</option>
            <option value="2">Bet365</option>
            <option value="3">SuperBet</option>
            <option value="4">SportingBet</option>
          </select>

          <select
            className={form.input}
            value={tipoAposta ?? ""}
            onChange={e => setTipoAposta(Number(e.target.value))}
          >
            <option value="">Selecione o tipo</option>
            <option value="0">Bingo</option>
            <option value="1">Segura</option>
            <option value="2">Alavancagem</option>
          </select>

          <select
            className={form.input}
            value={statusAposta ?? ""}
            onChange={e => setStatusAposta(Number(e.target.value))}
          >
            <option value="">Selecione o tipo</option>
            <option value="0">Pendente</option>
            <option value="1">Ganha</option>
            <option value="2">Perdida</option>
            <option value="3">Cancelada</option>
          </select>

          <button className={form.button} disabled={loading}>
            {loading ? "⏳ Criando..." : "Criar"}
          </button>
        </form>
      </div>
    </div>
  );
}
