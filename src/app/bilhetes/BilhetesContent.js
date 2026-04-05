"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import layout from "@/styles/layout.module.css";
import table from "@/styles/table.module.css";
import ResumoVisual from "@/app/components/ResultadoGrafico";
import toast from "react-hot-toast";
import { atualizarBancaHeader } from "../hooks/atualizarBancaHeader";

export default function BilhetesContent({ casa }) {
  const [bilhetes, setBilhetes] = useState([]);
  const [dataFiltro, setDataFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [bilheteSelecionado, setBilheteSelecionado] = useState(null);
  const [statusFiltro, setStatusFiltro] = useState("");
  const [usuarioDados, setUsuarioDados] = useState(null);
  const [loadingPdfPagina, setLoadingPdfPagina] = useState(false);
  const [loadingPdfTodos, setLoadingPdfTodos] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingTabela, setLoadingTabela] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const mercadoSelecionado = searchParams.get("mercado") || "";

  function isActionLoading(actionName) {
    return actionLoading === actionName;
  }

  // Função para PDF
  async function baixarRelatorioPdf(somentePaginaAtual = true) {
    try {
      if (somentePaginaAtual) {
        setLoadingPdfPagina(true);
      } else {
        setLoadingPdfTodos(true);
      }

      const mercado = searchParams.get("mercado");
      const params = new URLSearchParams();

      if (casa && casa !== "todas") {
        params.set("casaAposta", casa);
      }

      if (mercado) {
        params.set("mercado", mercado);
      }

      if (statusFiltro) {
        params.set("status", statusFiltro);
      }

      if (dataFiltro) {
        params.set("data", dataFiltro);
      }

      params.set("pageNumber", paginaAtual.toString());
      params.set("pageSize", "5");
      params.set("somentePaginaAtual", somentePaginaAtual.toString());

      const response = await api.get(
        `/Bilhete/usuario/bilhetes-relatorio-pdf?${params.toString()}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const nomeArquivo = somentePaginaAtual
        ? `relatorio-bilhetes-pagina-${paginaAtual}.pdf`
        : "relatorio-bilhetes-filtrados.pdf";

      link.setAttribute("download", nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(
        somentePaginaAtual
          ? "PDF da página atual gerado com sucesso!"
          : "PDF de todos os bilhetes filtrados gerado com sucesso!",
      );
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar relatório em PDF.");
    } finally {
      setLoadingPdfPagina(false);
      setLoadingPdfTodos(false);
    }
  }

  function formatarDataHora(data) {
    if (!data) return "";

    return new Date(data).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function carregarBilhetes(
    pagina = 1,
    data = "",
    status = "",
    mostrarLoadingPagina = false,
  ) {
    try {
      if (mostrarLoadingPagina) {
        setLoadingPage(true);
      } else {
        setLoadingTabela(true);
      }

      const mercado = searchParams.get("mercado");

      let url = `/Bilhete/usuario/bilhetes-filtrados?pageNumber=${pagina}&pageSize=10`;

      if (casa && casa !== "todas") {
        url += `&casaAposta=${encodeURIComponent(casa)}`;
      }

      if (mercado) {
        url += `&mercado=${encodeURIComponent(mercado)}`;
      }

      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }

      if (data) {
        url += `&data=${encodeURIComponent(data)}`;
      }

      const [res, usuarioEmail, dashboardRes] = await Promise.all([
        api.get(url),
        api.get("/usuario/email"),
        api.get(
          `/Bilhete/dashboard${
            mercado ? `?mercado=${encodeURIComponent(mercado)}` : ""
          }`,
        ),
      ]);

      setUsuarioDados(usuarioEmail.data.data);
      setBilhetes(res.data.data);
      setTotalPaginas(res.data.totalPage);
      setPaginaAtual(pagina);
      setDashboard(dashboardRes.data.data);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("Nenhum bilhete encontrado para os filtros informados.");
        setBilhetes([]);
        setTotalPaginas(0);
        setPaginaAtual(1);
        setDashboard(null);
        return;
      }

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      console.error(error);
      toast.error("Erro ao carregar bilhetes.");
    } finally {
      setLoadingPage(false);
      setLoadingTabela(false);
    }
  }

  async function excluirBilhete() {
    if (!bilheteSelecionado) {
      toast.error("Selecione um bilhete primeiro ao excluir bilhete");
      return;
    }

    try {
      setActionLoading("excluirSelecionado");

      await api.delete("/Bilhete", {
        data: { id: bilheteSelecionado },
      });

      toast.success("Bilhete excluído!");
      setBilheteSelecionado(null);
      atualizarBancaHeader();

      await carregarBilhetes(paginaAtual, dataFiltro, statusFiltro);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir bilhete");
    } finally {
      setActionLoading("");
    }
  }

  async function excluirBilheteMobile(id) {
    try {
      setActionLoading(`excluir-${id}`);

      await api.delete("/Bilhete", {
        data: { id },
      });

      toast.success("Bilhete excluído!");
      atualizarBancaHeader();

      await carregarBilhetes(paginaAtual, dataFiltro, statusFiltro);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir bilhete");
    } finally {
      setActionLoading("");
    }
  }

  async function atualizarStatus(id, novoStatus) {
    try {
      setActionLoading(`status-${id}-${novoStatus}`);

      await api.put("/bilhete/status", {
        id: id,
        statusEnum: novoStatus,
      });

      atualizarBancaHeader();
      toast.success("Status atualizado com sucesso!");

      await carregarBilhetes(paginaAtual, dataFiltro, statusFiltro);
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Erro ao atualizar status");
    } finally {
      setActionLoading("");
    }
  }

  async function resetarBilhetes() {
    try {
      setActionLoading("resetar");

      await api.delete("/Bilhete/reset", {
        data: {},
      });

      toast.success("Histórico resetado!");
      atualizarBancaHeader();

      await carregarBilhetes(1, "", "");
    } catch {
      toast.error("Erro ao resetar bilhetes");
    } finally {
      setActionLoading("");
    }
  }

  function confirmarReset() {
    toast(
      (t) => (
        <span>
          Apagar todos os bilhetes?
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              disabled={isActionLoading("resetar")}
              onClick={() => {
                toast.dismiss(t.id);
                resetarBilhetes();
              }}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: "6px",
                opacity: isActionLoading("resetar") ? 0.7 : 1,
                cursor: isActionLoading("resetar") ? "not-allowed" : "pointer",
              }}
            >
              {isActionLoading("resetar") ? "Apagando..." : "Sim"}
            </button>

            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "#1e293b",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: "6px",
              }}
            >
              Cancelar
            </button>
          </div>
        </span>
      ),
      { duration: 5000 },
    );
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    carregarBilhetes(1, dataFiltro, statusFiltro, true);
  }, [router, casa, searchParams]);

  if (loadingPage) {
    return (
      <div className={layout.container}>
        <div className={layout.card_table}>
          <h1 className={table.title}>Carregando bilhetes...</h1>
          <p style={{ textAlign: "center", marginTop: "20px", opacity: 0.8 }}>
            Aguarde, estamos buscando seus dados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={layout.container}>
      <div className={layout.card_table}>
        <div className={table.headerTop}>
          <button
            className={table.buttonBack}
            disabled={loadingTabela || actionLoading !== ""}
            onClick={() =>
              router.push(
                `/dashboard${
                  mercadoSelecionado
                    ? `?mercado=${encodeURIComponent(mercadoSelecionado)}`
                    : ""
                }`,
              )
            }
          >
            {loadingTabela ? "Carregando..." : "← Dashboard"}
          </button>
        </div>

        <h1 className={table.title}>
          {mercadoSelecionado
            ? `Meus Bilhetes - ${mercadoSelecionado}`
            : "Meus Bilhetes"}
        </h1>

        {dashboard && (
          <div className={table.dashboardContainer}>
            <div className={table.dashboardCard}>
              <p className={table.dashboardTitle}>Ganhas</p>
              <p className={table.dashboardValue}>{dashboard.totalGanhas}</p>
            </div>

            <div className={table.dashboardCard}>
              <p className={table.dashboardTitle}>Perdidas</p>
              <p className={table.dashboardValue}>{dashboard.totalPerdidas}</p>
            </div>

            <div className={table.dashboardCard}>
              <p className={table.dashboardTitle}>Investido</p>
              <p className={table.dashboardValue}>
                R$ {dashboard.totalInvestido.toFixed(2)}
              </p>
            </div>

            <div className={table.dashboardCard}>
              <p className={table.dashboardTitle}>Lucro</p>
              <p
                className={`${table.dashboardValue} ${
                  dashboard.lucro >= 0 ? table.positive : table.negative
                }`}
              >
                R$ {dashboard.lucro.toFixed(2)}
              </p>
            </div>

            <div className={table.dashboardCard}>
              <p className={table.dashboardTitle}>ROI</p>
              <p
                className={`${table.dashboardValue} ${
                  dashboard.resultadoFinal >= 0
                    ? table.positive
                    : table.negative
                }`}
              >
                {dashboard.roi}
              </p>
            </div>
          </div>
        )}

        {dashboard && (
          <ResumoVisual
            ganhas={dashboard.totalGanhas}
            perdidas={dashboard.totalPerdidas}
            canceladas={dashboard.totalCanceladas || 0}
          />
        )}

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className={layout.buttonPrimary}
            onClick={() =>
              router.push(
                `/criar-bilhete${
                  mercadoSelecionado
                    ? `?mercado=${encodeURIComponent(mercadoSelecionado)}`
                    : ""
                }`,
              )
            }
            disabled={loadingTabela || actionLoading !== ""}
          >
            + Criar Bilhete
          </button>

          <button
            className={table.buttonDanger}
            onClick={excluirBilhete}
            disabled={
              loadingTabela ||
              actionLoading !== "" ||
              isActionLoading("excluirSelecionado")
            }
          >
            {isActionLoading("excluirSelecionado")
              ? "Excluindo..."
              : "🗑 Excluir Bilhete"}
          </button>

          <button
            className={layout.buttonFilter}
            onClick={() => baixarRelatorioPdf(true)}
            disabled={
              loadingTabela ||
              actionLoading !== "" ||
              loadingPdfPagina ||
              bilhetes.length === 0
            }
          >
            {loadingPdfPagina ? "Gerando PDF..." : "📄 PDF da página"}
          </button>

          <button
            className={layout.buttonPrimary}
            onClick={() => baixarRelatorioPdf(false)}
            disabled={
              loadingTabela ||
              actionLoading !== "" ||
              loadingPdfTodos ||
              bilhetes.length === 0
            }
          >
            {loadingPdfTodos ? "Gerando PDF..." : "📑 PDF de todos filtrados"}
          </button>
        </div>

        <div className={table.resetContainer}>
          <button
            className={table.buttonReset}
            onClick={confirmarReset}
            disabled={loadingTabela || actionLoading !== ""}
          >
            {isActionLoading("resetar")
              ? "Resetando..."
              : "⚠ Resetar Histórico"}
          </button>
        </div>

        <div className={table.filtrosContainer}>
          <input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className={table.input}
            disabled={loadingTabela || actionLoading !== ""}
          />

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className={table.input}
            disabled={loadingTabela || actionLoading !== ""}
          >
            <option value="">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Ganha">Ganha</option>
            <option value="Perdida">Perdida</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <button
            className={layout.buttonFilter}
            onClick={() => carregarBilhetes(1, dataFiltro, statusFiltro)}
            disabled={loadingTabela || actionLoading !== ""}
          >
            {loadingTabela ? "Filtrando..." : "Filtrar"}
          </button>

          <button
            className={layout.buttonClear}
            disabled={loadingTabela || actionLoading !== ""}
            onClick={() => {
              setDataFiltro("");
              setStatusFiltro("");

              const params = new URLSearchParams(searchParams.toString());

              router.push(
                `/bilhetes${params.toString() ? `?${params.toString()}` : ""}`,
              );
            }}
          >
            Limpar
          </button>
        </div>

        {loadingTabela && (
          <div
            style={{
              textAlign: "center",
              margin: "16px 0",
              fontWeight: "600",
              opacity: 0.85,
            }}
          >
            Carregando dados...
          </div>
        )}

        <div
          style={{
            opacity: loadingTabela ? 0.6 : 1,
            pointerEvents: loadingTabela ? "none" : "auto",
            transition: "opacity 0.2s ease",
          }}
        >
          <div className={table.desktopOnly}>
            <div className={table.tableWrapper}>
              <table className={table.table}>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Mercado</th>
                    <th>Tipo</th>
                    <th>Casa Aposta</th>
                    <th>Odd</th>
                    <th>Valor</th>
                    <th>Retorno</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {bilhetes.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() =>
                        setBilheteSelecionado(
                          bilheteSelecionado === b.id ? null : b.id,
                        )
                      }
                      onTouchStart={() =>
                        setBilheteSelecionado(
                          bilheteSelecionado === b.id ? null : b.id,
                        )
                      }
                      className={
                        bilheteSelecionado === b.id ? table.selectedRow : ""
                      }
                    >
                      <td>{b.usuarioNome}</td>
                      <td>{b.mercado}</td>
                      <td>{b.tipoBanca}</td>
                      <td>{b.casaAposta}</td>
                      <td>{b.odd}</td>
                      <td>R$ {b.valorApostado}</td>
                      <td>R$ {b.valorRetornado}</td>
                      <td>{formatarDataHora(b.dataAposta)}</td>
                      <td>{b.status}</td>

                      <td>
                        {b.status === "Pendente" ? (
                          <div className={table.actionsContainer}>
                            <button
                              className={table.buttonSuccess}
                              disabled={actionLoading !== ""}
                              onClick={(e) => {
                                e.stopPropagation();
                                atualizarStatus(b.id, 1);
                              }}
                            >
                              {isActionLoading(`status-${b.id}-1`)
                                ? "..."
                                : "✓"}
                            </button>

                            <button
                              className={table.buttonDanger}
                              disabled={actionLoading !== ""}
                              onClick={(e) => {
                                e.stopPropagation();
                                atualizarStatus(b.id, 2);
                              }}
                            >
                              {isActionLoading(`status-${b.id}-2`)
                                ? "..."
                                : "✕"}
                            </button>

                            <button
                              className={table.buttonCancel}
                              disabled={actionLoading !== ""}
                              onClick={(e) => {
                                e.stopPropagation();
                                atualizarStatus(b.id, 3);
                              }}
                            >
                              {isActionLoading(`status-${b.id}-3`)
                                ? "..."
                                : "🚫"}
                            </button>
                          </div>
                        ) : (
                          <span className={table.badgeFinalizado}>
                            ✓ Finalizado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={table.mobileOnly}>
            {bilhetes.map((b) => (
              <div key={b.id} className={table.card}>
                <p>
                  <strong>Usuário:</strong> {b.usuarioNome}
                </p>
                <p>
                  <strong>Mercado:</strong> {b.mercado}
                </p>
                <p>
                  <strong>Odd:</strong> {b.odd}
                </p>
                <p>
                  <strong>Valor:</strong> R$ {b.valorApostado}
                </p>
                <p>
                  <strong>Retorno:</strong> R$ {b.valorRetornado}
                </p>
                <p>
                  <strong>Data:</strong> {formatarDataHora(b.dataAposta)}
                </p>
                <p>
                  <strong>Status:</strong> {b.status}
                </p>

                <div className={table.actionsContainer}>
                  {b.status === "Pendente" ? (
                    <>
                      <button
                        className={table.buttonSuccess}
                        disabled={actionLoading !== ""}
                        onClick={() => atualizarStatus(b.id, 1)}
                      >
                        {isActionLoading(`status-${b.id}-1`) ? "..." : "✓"}
                      </button>

                      <button
                        className={table.buttonDanger}
                        disabled={actionLoading !== ""}
                        onClick={() => atualizarStatus(b.id, 2)}
                      >
                        {isActionLoading(`status-${b.id}-2`) ? "..." : "✕"}
                      </button>

                      <button
                        className={table.buttonCancel}
                        disabled={actionLoading !== ""}
                        onClick={() => atualizarStatus(b.id, 3)}
                      >
                        {isActionLoading(`status-${b.id}-3`) ? "..." : "🚫"}
                      </button>
                    </>
                  ) : (
                    <span className={table.badgeFinalizado}>✓ Finalizado</span>
                  )}
                </div>

                <div style={{ marginTop: "12px" }}>
                  <button
                    className={table.buttonDanger}
                    disabled={actionLoading !== ""}
                    onClick={() => excluirBilheteMobile(b.id)}
                  >
                    {isActionLoading(`excluir-${b.id}`)
                      ? "Excluindo..."
                      : "🗑 Excluir"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={table.pagination}>
            <button
              disabled={
                paginaAtual === 1 || loadingTabela || actionLoading !== ""
              }
              onClick={() =>
                carregarBilhetes(paginaAtual - 1, dataFiltro, statusFiltro)
              }
            >
              {loadingTabela ? "Carregando..." : "Anterior"}
            </button>

            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button
              disabled={
                paginaAtual === totalPaginas ||
                loadingTabela ||
                actionLoading !== ""
              }
              onClick={() =>
                carregarBilhetes(paginaAtual + 1, dataFiltro, statusFiltro)
              }
            >
              {loadingTabela ? "Carregando..." : "Próxima"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
