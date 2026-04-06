"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import layout from "@/styles/layout.module.css";
import dashboard from "@/styles/dashboard.module.css";
import toast from "react-hot-toast";
import GraficoPizza from "@/app/components/GraficoPizza";

export default function Dashboard() {
  const [casas, setCasas] = useState([]);
  const [dadosDashboard, setDadosDashboard] = useState(null);
  const [loadingPagina, setLoadingPagina] = useState(true);
  const [loadingAtualizacao, setLoadingAtualizacao] = useState(false);
  const [mercadoSelecionado, setMercadoSelecionado] = useState("");
  const [acaoBotao, setAcaoBotao] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  const mercado = searchParams.get("mercado") || "";

  const totalBilhetes =
    (dadosDashboard?.totalGanhas || 0) +
    (dadosDashboard?.totalPerdidas || 0) +
    (dadosDashboard?.totalCanceladas || 0) +
    (dadosDashboard?.totalPendentes || 0);

  const temBilhetes = totalBilhetes > 0;

  function isAcaoBotao(nome) {
    return acaoBotao === nome;
  }

  useEffect(() => {
    setMercadoSelecionado(mercado);
  }, [mercado]);

  function alterarMercado(novoMercado) {
    if (loadingAtualizacao || acaoBotao) return;

    setMercadoSelecionado(novoMercado);
    setLoadingAtualizacao(true);

    const params = new URLSearchParams(searchParams.toString());

    if (novoMercado) {
      params.set("mercado", novoMercado);
    } else {
      params.delete("mercado");
    }

    router.push(
      `/dashboard${params.toString() ? `?${params.toString()}` : ""}`,
    );
  }

  async function carregarResumo() {
    try {
      let url = "/Bilhete/dashboard";

      if (mercado) {
        url += `?mercado=${encodeURIComponent(mercado)}`;
      }

      const res = await api.get(url);

      if (!res.data?.data) {
        setDadosDashboard(null);
        return;
      }

      setDadosDashboard(res.data.data);
    } catch (error) {
      console.error("Erro dashboard:", error.response?.data || error);
      setDadosDashboard(null);
    }
  }

  async function carregarCasas() {
    try {
      let url = "/Bilhete/resumoCasaApostas";

      if (mercado) {
        url += `?mercado=${encodeURIComponent(mercado)}`;
      }

      const res = await api.get(url);
      setCasas(res.data?.data || []);
    } catch (error) {
      console.error("Erro casas:", error.response?.data || error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      toast.error("Erro ao carregar dashboard");
      setCasas([]);
    }
  }

  function abrirCasa(casa) {
    if (loadingAtualizacao || acaoBotao) return;

    if (casa.quantidade === 0) {
      toast("Nenhum bilhete nessa casa de aposta.");
      return;
    }

    setAcaoBotao(`abrir-${casa.casaAposta}`);

    const params = new URLSearchParams();
    params.set("casa", casa.casaAposta);

    if (mercadoSelecionado) {
      params.set("mercado", mercadoSelecionado);
    }

    router.push(`/bilhetes?${params.toString()}`);
  }

  function irParaBilhetes() {
    if (loadingAtualizacao || acaoBotao) return;

    setAcaoBotao("verBilhetes");

    router.push(
      `/bilhetes${mercadoSelecionado ? `?mercado=${encodeURIComponent(mercadoSelecionado)}` : ""}`,
    );
  }

  function irParaCriarBilhete() {
    if (loadingAtualizacao || acaoBotao) return;

    setAcaoBotao("criarBilhete");

    router.push(
      `/criar-bilhete${mercadoSelecionado ? `?mercado=${encodeURIComponent(mercadoSelecionado)}` : ""}`,
    );
  }

  useEffect(() => {
    async function carregarDados() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      const primeiraCarga = !dadosDashboard && casas.length === 0;

      if (primeiraCarga) {
        setLoadingPagina(true);
      } else {
        setLoadingAtualizacao(true);
      }

      try {
        await Promise.all([carregarCasas(), carregarResumo()]);
      } finally {
        setLoadingPagina(false);
        setLoadingAtualizacao(false);
        setAcaoBotao("");
      }
    }

    carregarDados();
  }, [router, mercado]);

  if (loadingPagina) {
    return (
      <div className={dashboard.container}>
        <h1 className={dashboard.title}>Dashboard</h1>

        <div className={dashboard.stats}>
          <div
            className={`${dashboard.card} ${dashboard.skeleton} ${dashboard.skeletonCard}`}
          ></div>
          <div
            className={`${dashboard.card} ${dashboard.skeleton} ${dashboard.skeletonCard}`}
          ></div>
          <div
            className={`${dashboard.card} ${dashboard.skeleton} ${dashboard.skeletonCard}`}
          ></div>
        </div>

        <div
          className={`${dashboard.skeleton} ${dashboard.skeletonChart}`}
        ></div>

        <div className={dashboard.casasContainer}>
          <div
            className={`${dashboard.casaCard} ${dashboard.skeleton} ${dashboard.skeletonCasa}`}
          ></div>
          <div
            className={`${dashboard.casaCard} ${dashboard.skeleton} ${dashboard.skeletonCasa}`}
          ></div>
          <div
            className={`${dashboard.casaCard} ${dashboard.skeleton} ${dashboard.skeletonCasa}`}
          ></div>
          <div
            className={`${dashboard.casaCard} ${dashboard.skeleton} ${dashboard.skeletonCasa}`}
          ></div>
        </div>

        <div className={dashboard.verTodosContainer}>
          <div
            className={`${dashboard.skeleton} ${dashboard.skeletonButton}`}
          ></div>
          <div
            className={`${dashboard.skeleton} ${dashboard.skeletonButton}`}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboard.container}>
      <h1 className={dashboard.title}>
        {mercadoSelecionado ? `Dashboard - ${mercadoSelecionado}` : "Dashboard"}
      </h1>

      {loadingAtualizacao && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "16px",
            fontWeight: "600",
            opacity: 0.85,
          }}
        >
          Carregando dashboard...
        </div>
      )}

      <div
        style={{
          opacity: loadingAtualizacao ? 0.6 : 1,
          pointerEvents: loadingAtualizacao ? "none" : "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        {!temBilhetes && (
          <>
            <div className={dashboard.stats}>
              <div className={`${dashboard.card} ${dashboard.hideOnMobile}`}>
                <h3>Ganhos</h3>
                <p>0</p>
              </div>

              <div className={`${dashboard.card} ${dashboard.hideOnMobile}`}>
                <h3>Perdidas</h3>
                <p>0</p>
              </div>

              <div className={dashboard.card}>
                <h3>Total</h3>
                <p>0</p>
              </div>
            </div>

            <div className={dashboard.emptyState}>
              <div className={dashboard.icon}>📊</div>
              <h2>Nenhum bilhete ainda</h2>
              <p>
                {mercadoSelecionado
                  ? `Nenhum bilhete encontrado para o mercado ${mercadoSelecionado}.`
                  : "Comece criando sua primeira aposta para ver seus resultados aqui."}
              </p>

              <button
                className={layout.buttonPrimaryDash}
                onClick={irParaCriarBilhete}
                disabled={loadingAtualizacao || acaoBotao !== ""}
              >
                {isAcaoBotao("criarBilhete")
                  ? "Indo..."
                  : "+ Criar sua primeira aposta"}
              </button>
            </div>

            <div className={dashboard.tips}>
              <h2>💡 Dicas para começar</h2>
              <ul>
                <li>✔ Comece com apostas pequenas</li>
                <li>✔ Controle sua banca</li>
                <li>✔ Evite apostar por emoção</li>
              </ul>
            </div>
          </>
        )}

        <div className={dashboard.filtroMercadoContainer}>
          <select
            value={mercadoSelecionado}
            onChange={(e) => alterarMercado(e.target.value)}
            className={dashboard.selectMercado}
            disabled={loadingAtualizacao || acaoBotao !== ""}
          >
            <option value="">Todos os mercados</option>
            <option value="Escanteios">Escanteios</option>
            <option value="Gols">Gols</option>
            <option value="Cartoes">Cartões</option>
            <option value="AmbasMarcam">Ambas Marcam</option>
            <option value="ResultadoFinal">Resultado Final</option>
            <option value="Basquete">Basquete</option>
          </select>
        </div>

        {temBilhetes && (
          <div className={dashboard.conteudoCentral}>
            <div className={dashboard.graficoWrapper}>
              <GraficoPizza
                ganhas={dadosDashboard.totalGanhas}
                perdidas={dadosDashboard.totalPerdidas}
                canceladas={dadosDashboard.totalCanceladas || 0}
              />
            </div>

            <div className={dashboard.casasContainer}>
              {casas.map((casa) => (
                <div
                  key={casa.casaAposta}
                  className={dashboard.casaCard}
                  onClick={() => abrirCasa(casa)}
                  style={{
                    opacity:
                      acaoBotao && !isAcaoBotao(`abrir-${casa.casaAposta}`)
                        ? 0.7
                        : 1,
                    cursor:
                      loadingAtualizacao || acaoBotao !== ""
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <div className={dashboard.casaNome}>{casa.casaAposta}</div>

                  <div className={dashboard.casaQuantidade}>
                    {isAcaoBotao(`abrir-${casa.casaAposta}`)
                      ? "Abrindo..."
                      : `${casa.quantidade} bilhetes`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={dashboard.verTodosContainer}>
          <button
            className={layout.buttonFilter}
            onClick={irParaBilhetes}
            disabled={loadingAtualizacao || acaoBotao !== ""}
          >
            {isAcaoBotao("verBilhetes") ? "Indo..." : "Ver todos os bilhetes"}
          </button>

          <button
            className={layout.buttonPrimarydashboard}
            onClick={irParaCriarBilhete}
            disabled={loadingAtualizacao || acaoBotao !== ""}
          >
            {isAcaoBotao("criarBilhete") ? "Indo..." : "+ Criar Bilhete"}
          </button>
        </div>
      </div>
    </div>
  );
}
