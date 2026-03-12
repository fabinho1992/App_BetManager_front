"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import layout from "@/styles/layout.module.css";
import table from "@/styles/table.module.css";
import ResumoVisual from "@/app/components/ResultadoGrafico";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function Bilhetes() {
  const [bilhetes, setBilhetes] = useState([]);
  const [nomeJogador, setNomeJogador] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [bilheteSelecionado, setBilheteSelecionado] = useState(null);
  const [statusFiltro, setStatusFiltro] = useState("");
  const searchParams = useSearchParams();
  const casa = searchParams.get("casa");
  const router = useRouter();


  async function excluirBilhete() {
    if (!bilheteSelecionado) {
      toast.error("Selecione um bilhete primeiro ao excluir bilhete");
      return;
    }

    try {
      await api.delete("/Bilhete", {
        data: { id: bilheteSelecionado }
      });
      console.log(bilheteSelecionado);

      toast.success("Bilhete excluído!");

      setBilheteSelecionado(null);

      carregarBilhetes(paginaAtual, dataFiltro);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir bilhete");
      console.log(bilheteSelecionado);
    }
  }

  async function carregarBilhetes(pagina = 1, data = "", status = "") {
    try {

      let url;

      if (casa && casa !== "todas") {
        url = `/Bilhete/casaAposta?casaAposta=${casa}&pageNumber=${pagina}&pageSize=5`;
      } else if (data) {
        url = `/Bilhete/usuario/bilhetesPorData?data=${data}&pageNumber=${pagina}&pageSize=5`;
      } else if (status) {
        url = `/Bilhete/status?status=${status}&pageNumber=${pagina}&pageSize=5`;
      } else {
        url = `/Bilhete/usuario/bilhetes?pageNumber=${pagina}&pageSize=5`;
      }

      const res = await api.get(url);


      setBilhetes(res.data.data);
      setTotalPaginas(res.data.totalPage);
      setPaginaAtual(pagina);

      const dashboardRes = await api.get("/Bilhete/dashboard");
      setDashboard(dashboardRes.data.data);

    } catch (error) {
      if (error.response?.status === 400) {

        if (data) {
          toast.error("Nenhum bilhete encontrado para esta data!");
          setDataFiltro("");        // limpa o filtro de data
          carregarBilhetes(1);      // recarrega lista normal
          return;
        }
        else if (casa && casa !== "todas") {
          toast.error("Nenhum bilhete encontrado para esta casa!");
          carregarBilhetes(1);
          return;
        } else if (status) {
          toast.error("Nenhum bilhete encontrado para este status!");
          setStatusFiltro("");      // se você tiver esse state
          carregarBilhetes(1);
          return;
        }

        setBilhetes([]);
        return;
      }

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    }
  }

  async function atualizarStatus(id, novoStatus) {
    try {
      await api.put("/bilhete/status", {
        id: id,
        statusEnum: novoStatus
      });

      toast.success("Status atualizado com sucesso!");

      // recarrega lista
      carregarBilhetes();
    } catch (error) {
      console.error(error.response?.data);
      alert("Erro ao atualizar status");
    }
  }

  async function resetarBilhetes() {

    try {

      await api.delete("/Bilhete/reset", {
        data: {}
      });

      toast.success("Histórico resetado!");

      carregarBilhetes(1);

    } catch {

      toast.error("Erro ao resetar bilhetes");

    }

  }

  function confirmarReset() {

    toast((t) => (
      <span>
        Apagar todos os bilhetes?
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>

          <button
            onClick={() => {
              toast.dismiss(t.id);
              resetarBilhetes();
            }}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "6px"
            }}
          >
            Sim
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: "#1e293b",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "6px"
            }}
          >
            Cancelar
          </button>

        </div>
      </span>
    ), { duration: 5000 });

  }



  // ✅ useEffect agora só chama a função
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    carregarBilhetes(1);

  }, [router, casa]);


  return (
    <div className={layout.container}>
      <div className={layout.card_table}>
        <div className={table.headerTop}>
          <button
            className={table.buttonBack}
            onClick={() => router.push("/dashboard")}
          >
            ← Dashboard
          </button>
        </div>
        <h1 className={table.title}>Meus Bilhetes</h1>

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
              <p className={`${table.dashboardValue} ${dashboard.lucro >= 0 ? table.positive : table.negative}`}>
                R$ {dashboard.lucro.toFixed(2)}
              </p>
            </div>

            <div className={table.dashboardCard}>
              <p className={table.dashboardTitle}>Resultado</p>
              <p className={`${table.dashboardValue} ${dashboard.resultadoFinal >= 0 ? table.positive : table.negative}`}>
                R$ {dashboard.resultadoFinal.toFixed(2)}
              </p>
            </div>

            <div className={table.dashboardCard}>
              <p className={table.dashboardTitle}>ROI</p>
              <p className={`${table.dashboardValue} ${dashboard.resultadoFinal >= 0 ? table.positive : table.negative}`}>
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

        <div style={{ display: "flex", gap: "10px" }}>

          <button
            className={layout.buttonPrimary}
            onClick={() => router.push("/criar-bilhete")}
          >
            + Criar Bilhete
          </button>

          <button
            className={table.buttonDanger}
            onClick={excluirBilhete}
          >
            🗑 Excluir Bilhete
          </button>

        </div>

        <div className={table.resetContainer}>
          <button
            className={table.buttonReset}
            onClick={confirmarReset}
          >
            ⚠ Resetar Histórico
          </button>
        </div>

        {/* <div className={table.filtrosContainer}>

          <input
            type="text"
            placeholder="Buscar jogador"
            value={nomeJogador}
            onChange={(e) => setNomeJogador(e.target.value)}
            className={table.input}
          />

          <button
            className={layout.buttonPrimary}
            onClick={() => {
              if (!nomeJogador.trim()) return;
              router.push(`/jogador/${encodeURIComponent(nomeJogador)}`);
            }}
          >
            Buscar Jogador
          </button>
        </div> */}
        <div className={table.filtrosContainer}>
          <input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className={table.input}
          />

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className={table.input}
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
          >
            Filtrar
          </button>

          <button
            className={layout.buttonClear}
            onClick={() => {
              setDataFiltro("");
              setStatusFiltro("");
              carregarBilhetes(1);
            }}
          >
            Limpar
          </button>

        </div>
        <div className={table.desktopOnly}>
          <div className={table.tableWrapper}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Tipo</th>
                  <th>Casa Aposta</th>
                  <th>Odd</th>
                  <th>Valor</th>
                  <th>Retorno</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {bilhetes.map(b => (
                  <tr
                    key={b.id}
                    onClick={() => setBilheteSelecionado(b.id)}
                    className={bilheteSelecionado === b.id ? table.selectedRow : ""}
                  >
                    <td>{b.usuarioNome}</td>
                    <td>{b.tipoBanca}</td>
                    <td>{b.casaAposta}</td>
                    <td>{b.odd}</td>
                    <td>R$ {b.valorApostado}</td>
                    <td>R$ {b.valorRetornado}</td>
                    <td>{b.dataAposta}</td>
                    <td>{b.status}</td>

                    <td>
                      {b.status === "Pendente" ? (
                        <div className={table.actionsContainer}>
                          <button
                            className={table.buttonSuccess}
                            onClick={() => atualizarStatus(b.id, 1)}
                          >
                            ✓
                          </button>

                          <button
                            className={table.buttonDanger}
                            onClick={() => atualizarStatus(b.id, 2)}
                          >
                            ✕
                          </button>

                          <button
                            className={table.buttonCancel}
                            onClick={() => atualizarStatus(b.id, 3)}
                          >
                            🚫
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
              <p><strong>Usuário:</strong> {b.usuario}</p>
              <p><strong>Odd:</strong> {b.odd}</p>
              <p><strong>Valor:</strong> R$ {b.valorApostado}</p>
              <p><strong>Retorno:</strong> R$ {b.retorno}</p>
              <p><strong>Data:</strong> {b.dataAposta}</p>
              <p><strong>Status:</strong> {b.status}</p>

              <div className={table.actionsContainer}>
                {b.status === "Pendente" ? (
                  <>
                    <button
                      className={table.buttonSuccess}
                      onClick={() => atualizarStatus(b.id, 1)}
                    >
                      ✓
                    </button>

                    <button
                      className={table.buttonDanger}
                      onClick={() => atualizarStatus(b.id, 2)}
                    >
                      ✕
                    </button>

                    <button
                      className={table.buttonCancel}
                      onClick={() => atualizarStatus(b.id, 3)}
                    >
                      🚫
                    </button>
                  </>
                ) : (
                  <span className={table.badgeFinalizado}>
                    ✓ Finalizado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* 📄 Paginação */}
        <div className={table.pagination}>
          <button
            disabled={paginaAtual === 1}
            onClick={() => carregarBilhetes(paginaAtual - 1, dataFiltro)}
          >
            Anterior
          </button>

          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>

          <button
            disabled={paginaAtual === totalPaginas}
            onClick={() => carregarBilhetes(paginaAtual + 1, dataFiltro)}
          >
            Próxima
          </button>
        </div>

      </div>
    </div>
  );
}
