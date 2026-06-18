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
  const [imagemBilhete, setImagemBilhete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsuario, setLoadingUsuario] = useState(true);

  // Calculadora de odd
  const [mostrarCalculadoraOdd, setMostrarCalculadoraOdd] = useState(false);
  const [oddMultiplaInput, setOddMultiplaInput] = useState("");
  const [oddsMultipla, setOddsMultipla] = useState([]);
  const [oddCalculada, setOddCalculada] = useState(null);
  const [loadingOdd, setLoadingOdd] = useState(false);

  // Análise de imagem com IA
  const [analisando, setAnalisando] = useState(false);
  const [modoIA, setModoIA] = useState(false);

  // Etapa 2 — dados extraídos aguardando confirmação
  const [dadosExtraidos, setDadosExtraidos] = useState(null);
  const [casaApostaIA, setCasaApostaIA] = useState("");
  const [dataApostaIA, setDataApostaIA] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [confirmandoEContinuando, setConfirmandoEContinuando] = useState(false);
  const [previewImagem, setPreviewImagem] = useState(null);

  const router = useRouter();

  const oddNumber = odd ? Number(odd.replace(",", ".")) : 0;
  const oddEhSeguraAutomatica = odd !== "" && oddNumber <= 2;

  function parseOdd(value) {
    if (!value) return 0;
    return Number(value.toString().trim().replace(",", "."));
  }

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

  function validarImagem(file) {
    if (!file) return true;
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    const tamanhoMaximo = 5 * 1024 * 1024;
    if (!tiposPermitidos.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return false;
    }
    if (file.size > tamanhoMaximo) {
      toast.error("A imagem não pode ter mais que 5MB.");
      return false;
    }
    return true;
  }

  function adicionarOddMultipla() {
    const valor = Number(oddMultiplaInput.replace(",", "."));
    if (!valor || valor <= 1) {
      toast.error("Informe uma odd válida maior que 1.");
      return;
    }
    setOddsMultipla((prev) => [...prev, valor]);
    setOddMultiplaInput("");
  }

  function removerOddMultipla(index) {
    setOddsMultipla((prev) => prev.filter((_, i) => i !== index));
  }

  async function calcularOddMultipla() {
    if (oddsMultipla.length === 0) {
      toast.error("Adicione ao menos uma odd.");
      return;
    }
    try {
      setLoadingOdd(true);
      const response = await api.post("/Bilhete/calcular-odd", {
        odds: oddsMultipla,
      });
      const oddFinal = response.data.data.oddFinal;
      setOddCalculada(oddFinal);
      setOdd(String(oddFinal));
      toast.success("Odd calculada com sucesso!");
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Erro ao calcular odd.");
    } finally {
      setLoadingOdd(false);
    }
  }

  function limparOddsMultipla() {
    setOddsMultipla([]);
    setOddMultiplaInput("");
    setOddCalculada(null);
  }

  function resetarModoIA() {
    setDadosExtraidos(null);
    setCasaApostaIA("");
    setDataApostaIA("");
    setImagemBilhete(null);
    setPreviewImagem(null);
  }

  // Etapa 1 — Analisa imagem, retorna dados sem criar bilhete
  async function handleAnalisarImagem() {
    if (!imagemBilhete) {
      toast.error("Selecione uma imagem primeiro.");
      return;
    }
    if (!validarImagem(imagemBilhete)) return;

    try {
      setAnalisando(true);
      const formData = new FormData();
      formData.append("imagem", imagemBilhete);

      const response = await api.post(
        "/Bilhete/analisar-imagem-preview",
        formData,
      );
      const dados = response.data.data;

      setDadosExtraidos(dados);
      if (dados.casaAposta) setCasaApostaIA(dados.casaAposta);

      toast.success("Imagem analisada! Confirme os dados antes de salvar.");
    } catch (error) {
      console.error("Erro ao analisar imagem:", error.response?.data || error);
      toast.error("Erro ao analisar imagem. Tente novamente.");
    } finally {
      setAnalisando(false);
    }
  }

  // Monta o formData comum para os dois botões de confirmação
  function montarFormData() {
    const oddFormatada = String(dadosExtraidos.odd ?? 0).replace(",", ".");
    const formData = new FormData();
    formData.append("odd", oddFormatada);
    formData.append("valorApostado", dadosExtraidos.valorApostado ?? 0);
    formData.append("casaAposta", casaApostaIA);
    formData.append("mercado", dadosExtraidos.mercado ?? "ResultadoFinal");
    formData.append("dataAposta", new Date(dataApostaIA).toISOString());
    if (imagemBilhete) formData.append("imagem", imagemBilhete);
    return formData;
  }

  function validarCamposIA() {
    if (!casaApostaIA) { toast.error("Selecione a casa de aposta."); return false; }
    if (!dataApostaIA) { toast.error("Informe a data da aposta."); return false; }
    return true;
  }

  // Etapa 2a — Confirma e vai para a lista
  async function handleConfirmarBilhete() {
    if (!validarCamposIA()) return;
    try {
      setConfirmando(true);
      await api.post("/Bilhete/confirmar-imagem", montarFormData());
      toast.success("Bilhete criado com sucesso!");
      atualizarBancaHeader();
      router.push("/bilhetes");
    } catch (error) {
      console.error("Erro ao confirmar bilhete:", error.response?.data || error);
      toast.error("Erro ao criar bilhete. Tente novamente.");
    } finally {
      setConfirmando(false);
    }
  }

  // Etapa 2b — Confirma e fica na página para criar outro
  async function handleConfirmarEContinuar() {
    if (!validarCamposIA()) return;
    try {
      setConfirmandoEContinuando(true);
      await api.post("/Bilhete/confirmar-imagem", montarFormData());
      toast.success("Bilhete criado! Envie outro print.");
      atualizarBancaHeader();
      resetarModoIA();
    } catch (error) {
      console.error("Erro ao confirmar bilhete:", error.response?.data || error);
      toast.error("Erro ao criar bilhete. Tente novamente.");
    } finally {
      setConfirmandoEContinuando(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    async function carregarCasaPreferida() {
      try {
        const response = await api.get("/Usuario/email");
        const usuario = response.data.data;
        if (usuario?.casaPreferida) setCasaAposta(usuario.casaPreferida);
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
    if (oddEhSeguraAutomatica) setTipoAposta(1);
    else setTipoAposta(null);
  }, [oddEhSeguraAutomatica]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      if (
        !odd ||
        !valorApostado ||
        statusAposta === null ||
        !casaAposta ||
        mercadoAposta === null
      ) {
        toast.error("Preencha todos os campos");
        return;
      }
      if (!oddEhSeguraAutomatica && tipoAposta === null) {
        toast.error("Selecione o tipo de aposta");
        return;
      }
      if (!validarImagem(imagemBilhete)) return;
      const oddConvertida = parseOdd(odd);
      if (!oddConvertida || Number.isNaN(oddConvertida) || oddConvertida <= 1) {
        toast.error("Informe uma odd válida.");
        return;
      }
      const formData = new FormData();
      formData.append("odd", parseOdd(odd).toString());
      formData.append("valorApostado", parseCurrency(valorApostado));
      formData.append("tipoBanca", oddEhSeguraAutomatica ? 1 : tipoAposta);
      formData.append("statusEnum", statusAposta);
      formData.append("casaAposta", casaAposta);
      formData.append("mercado", mercadoAposta);
      if (dataAposta)
        formData.append("dataAposta", new Date(dataAposta).toISOString());
      if (imagemBilhete) formData.append("imagem", imagemBilhete);

      await api.post("/bilhete", formData);
      toast.success("Bilhete criado com sucesso!");
      atualizarBancaHeader();
      router.push("/bilhetes");
    } catch (error) {
      console.error("Erro completo:", error);
      toast.error("Erro ao criar bilhete");
    } finally {
      setLoading(false);
    }
  }

  const qualquerConfirmando = confirmando || confirmandoEContinuando;

  return (
    <div className={layout.container}>
      <div className={layout.card}>
        <div className={form.headerTop}>
          <button
            type="button"
            className={form.buttonBack}
            onClick={() => router.push("/dashboard")}
          >
            ← Volta
          </button>
        </div>

        <h1>Novo Bilhete</h1>

        {/* Toggle Manual / IA */}
        <div style={styles.toggleWrapper}>
          <button
            type="button"
            style={{
              ...styles.toggleBtn,
              ...(!modoIA ? styles.toggleBtnActive : {}),
            }}
            onClick={() => {
              setModoIA(false);
              resetarModoIA();
            }}
          >
            Manual
          </button>
          <button
            type="button"
            style={{
              ...styles.toggleBtn,
              ...(modoIA ? styles.toggleBtnActive : {}),
            }}
            onClick={() => setModoIA(true)}
          >
            🤖 Analisar com IA
          </button>
        </div>

        {/* MODO IA */}
        {modoIA &&
          (!dadosExtraidos ? (
            // ETAPA 1 — Upload
            <div style={styles.iaSection}>
              <p style={styles.iaDesc}>
                Envie o print da aposta e a IA extrai os dados automaticamente.
              </p>

              <label style={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImagemBilhete(file);
                    setPreviewImagem(file ? URL.createObjectURL(file) : null);
                  }}
                  style={{ display: "none" }}
                />
                {imagemBilhete ? (
                  <div style={styles.uploadSelected}>
                    <span style={styles.uploadIcon}>🖼️</span>
                    <span style={styles.uploadFileName}>
                      {imagemBilhete.name}
                    </span>
                    <span style={styles.uploadChange}>Trocar imagem</span>
                  </div>
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <span style={styles.uploadIcon}>📎</span>
                    <span style={styles.uploadText}>
                      Clique para selecionar a imagem
                    </span>
                    <span style={styles.uploadHint}>
                      JPG, PNG ou WEBP • Máx 5MB
                    </span>
                  </div>
                )}
              </label>

              <button
                type="button"
                className={form.button}
                onClick={handleAnalisarImagem}
                disabled={!imagemBilhete || analisando}
                style={{ opacity: !imagemBilhete || analisando ? 0.6 : 1 }}
              >
                {analisando ? "⏳ Analisando imagem..." : "🤖 Analisar imagem"}
              </button>
            </div>
          ) : (
            // ETAPA 2 — Confirmação
            <div style={styles.iaSection}>
              <p style={styles.iaDesc}>
                Confira os dados extraídos e preencha os campos obrigatórios.
              </p>

              <div style={styles.dadosExtraidosBox}>
                <p style={styles.dadosExtraidosLabel}>
                  Dados extraídos pela IA
                </p>

                {previewImagem && (
                  <img
                    src={previewImagem}
                    alt="Preview do bilhete"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      maxHeight: "220px",
                      objectFit: "contain",
                    }}
                  />
                )}

                <div style={styles.dadosGrid}>
                  <div style={styles.dadoItem}>
                    <span style={styles.dadoLabel}>Odd</span>
                    <span style={styles.dadoValor}>
                      {dadosExtraidos.odd ?? "—"}
                    </span>
                  </div>
                  <div style={styles.dadoItem}>
                    <span style={styles.dadoLabel}>Valor apostado</span>
                    <span style={styles.dadoValor}>
                      {dadosExtraidos.valorApostado
                        ? `R$ ${dadosExtraidos.valorApostado.toFixed(2).replace(".", ",")}`
                        : "—"}
                    </span>
                  </div>
                  <div style={styles.dadoItem}>
                    <span style={styles.dadoLabel}>Mercado</span>
                    <span style={styles.dadoValor}>
                      {dadosExtraidos.mercado ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Casa de aposta — usuário escolhe */}
              <select
                className={form.input}
                value={casaApostaIA}
                onChange={(e) => setCasaApostaIA(e.target.value)}
              >
                <option value="">Selecione a casa de aposta *</option>
                <option value="Betano">Betano</option>
                <option value="Bet365">Bet365</option>
                <option value="SuperBet">SuperBet</option>
                <option value="SportingBet">SportingBet</option>
                <option value="EsportivaBet">EsportivaBet</option>
              </select>

              {/* Data da aposta — usuário escolhe */}
              <input
                className={form.input}
                type="datetime-local"
                value={dataApostaIA}
                onChange={(e) => setDataApostaIA(e.target.value)}
              />

              {/* Botões de confirmação */}
              <button
                type="button"
                className={form.button}
                onClick={handleConfirmarBilhete}
                disabled={qualquerConfirmando}
                style={{ opacity: qualquerConfirmando ? 0.6 : 1 }}
              >
                {confirmando ? "⏳ Criando bilhete..." : "✅ Criar e ir para a lista"}
              </button>

              <button
                type="button"
                className={form.buttonSecondary}
                onClick={handleConfirmarEContinuar}
                disabled={qualquerConfirmando}
                style={{ opacity: qualquerConfirmando ? 0.6 : 1 }}
              >
                {confirmandoEContinuando ? "⏳ Criando bilhete..." : "➕ Criar e adicionar outro"}
              </button>

              <button
                type="button"
                className={form.buttonSecondary}
                onClick={resetarModoIA}
                disabled={qualquerConfirmando}
              >
                ← Analisar outra imagem
              </button>
            </div>
          ))}

        {/* MODO MANUAL */}
        {!modoIA && (
          <form className={form.form} onSubmit={handleSubmit}>
            <div className={form.calculatorToggleWrapper}>
              <button
                type="button"
                className={form.calculatorToggleButton}
                onClick={() => setMostrarCalculadoraOdd((prev) => !prev)}
              >
                {mostrarCalculadoraOdd
                  ? "Ocultar calculadora de odd"
                  : "Mostrar calculadora de odd"}
              </button>
            </div>

            {mostrarCalculadoraOdd && (
              <div className={form.multiOddCard}>
                <h3 className={form.multiOddTitle}>Calculadora de odd</h3>
                <div className={form.multiOddRow}>
                  <input
                    className={form.input}
                    type="text"
                    placeholder="Ex: 4.0"
                    value={oddMultiplaInput}
                    onChange={(e) => setOddMultiplaInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className={form.buttonSecondary}
                    onClick={adicionarOddMultipla}
                  >
                    + Adicionar
                  </button>
                </div>
                {oddsMultipla.length > 0 && (
                  <div className={form.oddsList}>
                    {oddsMultipla.map((item, index) => (
                      <div key={`${item}-${index}`} className={form.oddTag}>
                        <span>{item}</span>
                        <button
                          type="button"
                          className={form.removeOddButton}
                          onClick={() => removerOddMultipla(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className={form.multiOddActions}>
                  <button
                    type="button"
                    className={form.button}
                    onClick={calcularOddMultipla}
                    disabled={loadingOdd}
                  >
                    {loadingOdd ? "Calculando..." : "Calcular"}
                  </button>
                  <button
                    type="button"
                    className={form.buttonSecondary}
                    onClick={limparOddsMultipla}
                    disabled={loadingOdd}
                  >
                    Limpar
                  </button>
                </div>
                {oddCalculada !== null && (
                  <div className={form.oddResultBox}>
                    <span>Odd final</span>
                    <strong>{oddCalculada}</strong>
                  </div>
                )}
              </div>
            )}

            <input
              className={form.input}
              type="text"
              inputMode="decimal"
              placeholder="Odd. Ex: 2.5 ou 2,5"
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

            <div className={form.uploadBox}>
              <label className={form.uploadLabel}>Imagem do bilhete</label>
              <input
                className={form.input}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setImagemBilhete(e.target.files?.[0] || null)}
              />
              {imagemBilhete && (
                <p className={form.uploadInfo}>
                  Imagem selecionada: {imagemBilhete.name}
                </p>
              )}
            </div>

            <button
              className={form.button}
              disabled={loading || loadingUsuario}
            >
              {loading ? "⏳ Criando..." : "Criar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  toggleWrapper: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    background: "rgba(0,0,0,0.05)",
    padding: "4px",
    borderRadius: "10px",
  },
  toggleBtn: {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    background: "transparent",
    color: "#888",
    transition: "all 0.2s",
  },
  toggleBtnActive: {
    background: "#fff",
    color: "#111",
    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
  },
  iaSection: { display: "flex", flexDirection: "column", gap: "16px" },
  iaDesc: { fontSize: "14px", color: "#888", margin: 0 },
  uploadArea: {
    display: "block",
    border: "2px dashed #ddd",
    borderRadius: "12px",
    padding: "24px 16px",
    cursor: "pointer",
    textAlign: "center",
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  uploadSelected: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  uploadIcon: { fontSize: "28px" },
  uploadText: { fontSize: "14px", fontWeight: "500", color: "#444" },
  uploadHint: { fontSize: "12px", color: "#aaa" },
  uploadFileName: { fontSize: "13px", color: "#333", fontWeight: "500" },
  uploadChange: {
    fontSize: "12px",
    color: "#888",
    textDecoration: "underline",
  },
  dadosExtraidosBox: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "14px",
  },
  dadosExtraidosLabel: {
    fontSize: "12px",
    color: "#888",
    margin: "0 0 10px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dadosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  dadoItem: { display: "flex", flexDirection: "column", gap: "4px" },
  dadoLabel: { fontSize: "11px", color: "#666" },
  dadoValor: { fontSize: "15px", fontWeight: "600", color: "#fff" },
};
