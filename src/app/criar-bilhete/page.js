"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import form from "@/styles/form.module.css";
import layout from "@/styles/layout.module.css";
import toast from "react-hot-toast";
import { atualizarBancaHeader } from "../hooks/atualizarBancaHeader";

export default function CriarBilhete() {
  const [odd, setOdd] = useState("");
  const [valorApostado, setValorApostado] = useState("");
  const [tipoAposta, setTipoAposta] = useState(null);
  const [statusAposta, setStatusAposta] = useState(null);
  const [mercadoAposta, setMercadoAposta] = useState(null);
  const [casaAposta, setCasaAposta] = useState("");
  const [dataAposta, setDataAposta] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsuario, setLoadingUsuario] = useState(true);

  const router = useRouter();

  const oddNumber = Number(odd);
  const oddEhSeguraAutomatica = odd !== "" && oddNumber <= 2;

  function formatCurrency(value) {
    value = value.replace(/\D/g, "");
    const number = Number(value) / 100;

    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function parseCurrency(value) {
    if (!value) return 0;
    return Number(value.replace(/\D/g, "")) / 100;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    async function carregarCasaPreferida() {
      try {
        const email = localStorage.getItem("email");
        if (!email) return;

        const response = await api.get(`/Usuario/email`);
        const usuario = response.data.data;

        const casaPreferidaNome = usuario?.casaPreferida;
        console.log(usuario);
        if (casaPreferidaNome) {
          setCasaAposta(casaPreferidaNome);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar usuário:",
          error.response?.data || error,
        );
      } finally {
        setLoadingUsuario(false);
      }
    }

    carregarCasaPreferida();
  }, [router]);

  useEffect(() => {
    if (oddEhSeguraAutomatica) {
      setTipoAposta(1);
    } else {
      setTipoAposta(null);
    }
  }, [oddEhSeguraAutomatica]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      if (!odd || !valorApostado || statusAposta === null || !casaAposta) {
        toast.error("Preencha todos os campos");
        return;
      }

      if (!oddEhSeguraAutomatica && tipoAposta === null) {
        toast.error("Selecione o tipo de aposta");
        return;
      }

      const payload = {
  odd: Number(odd),
  valorApostado: parseCurrency(valorApostado),
  tipoBanca: oddEhSeguraAutomatica ? 1 : tipoAposta,
  statusEnum: statusAposta,
  casaAposta: casaAposta,
  mercado: mercadoAposta,
  dataAposta: dataAposta ? new Date(dataAposta).toISOString() : null,
};

console.log("dataAposta state:", dataAposta);
console.log("payload enviado:", payload);

await api.post("/bilhete", payload);

      
      toast.success("Bilhete criado com sucesso!");
      atualizarBancaHeader();
      router.push("/bilhetes");
    } catch (error) {
      console.error("Erro completo:", error);
      console.error("Response:", error.response?.data);
      toast.error("Erro ao criar bilhete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={layout.container}>
      <div className={layout.card}>
        <div className={form.headerTop}>
          <button
            className={form.buttonBack}
            onClick={() => router.push("/dashboard")}
          >
            ← Voltar
          </button>
        </div>
        <h1>Novo Bilhete</h1>

        <form className={form.form} onSubmit={handleSubmit}>
          <input
            className={form.input}
            type="number"
            placeholder="Odd"
            value={odd}
            onChange={(e) => setOdd(e.target.value)}
          />

          <input
            className={form.input}
            type="text"
            placeholder="R$ 0,00"
            value={valorApostado}
            onChange={(e) => setValorApostado(formatCurrency(e.target.value))}
          />

          <select
            className={form.input}
            value={casaAposta}
            onChange={(e) => setCasaAposta(e.target.value)}
            disabled={loadingUsuario}
          >
            <option value="">
              {loadingUsuario
                ? "Carregando casa preferida..."
                : "Selecione a casa"}
            </option>
            <option value="Betano">Betano</option>
            <option value="Bet365">Bet365</option>
            <option value="SuperBet">SuperBet</option>
            <option value="SportingBet">SportingBet</option>
            <option value="EsportivaBet">EsportivaBet</option>
          </select>

          <select
            className={form.input}
            value={mercadoAposta ?? ""}
            onChange={(e) => setMercadoAposta(Number(e.target.value))}
          >
            <option value="">Selecione o Mercado</option>
            <option value="0">Escanteios</option>
            <option value="1">Gols</option>
            <option value="2">Cartões</option>
            <option value="3">Ambas Marcam</option>
            <option value="4">Resultado Final</option>
            <option value="5">Basquete</option>
          </select>

          {!oddEhSeguraAutomatica && (
            <select
              className={form.input}
              value={tipoAposta ?? ""}
              onChange={(e) => setTipoAposta(Number(e.target.value))}
            >
              <option value="">Selecione o tipo</option>
              <option value="0">Bingo</option>
              <option value="2">Alavancagem</option>
            </select>
          )}

          {oddEhSeguraAutomatica && (
            <input
              className={form.input}
              type="text"
              value="Tipo de aposta: Segura"
              disabled
            />
          )}

          <select
            className={form.input}
            value={statusAposta ?? ""}
            onChange={(e) => setStatusAposta(Number(e.target.value))}
          >
            <option value="">Selecione o status</option>
            <option value="0">Pendente</option>
            <option value="1">Ganha</option>
            <option value="2">Perdida</option>
            <option value="3">Cancelada</option>
          </select>

          <input
            className={form.input}
            type="datetime-local"
            value={dataAposta}
            onChange={(e) => setDataAposta(e.target.value)}
          />

          <button className={form.button} disabled={loading || loadingUsuario}>
            {loading ? "⏳ Criando..." : "Criar"}
          </button>
        </form>
      </div>
    </div>
  );
}
