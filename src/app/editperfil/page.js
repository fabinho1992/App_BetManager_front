"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/services/api";
import styles from "@/styles/perfil.module.css";
import { atualizarBancaHeader } from "../hooks/atualizarBancaHeader";

export default function PerfilPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [usuario, setUsuario] = useState({
    displayName: "",
    cpf: "",
    email: "",
    casaPreferida: "",
    bancaInicial: "",
    bancaAtual: "",
    metaBanca: "",
    dataCriacao: ""
  });

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        if (!token) {
          router.push("/");
          return;
        }

        const response = await api.get(`/Usuario/email`);
        const dados = response.data.data;

        setUsuario({
          displayName: dados.displayName || "",
          cpf: dados.cpf || "",
          email: dados.email || "",
          casaPreferida: dados.casaPreferida || "",
          bancaInicial: dados.bancaInicial ?? "",
          bancaAtual: dados.bancaAtual ?? "",
          metaBanca: dados.metaBanca ?? "",
          dataCriacao: dados.dataCriacao || ""
        });
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dados do perfil");
      } finally {
        setLoading(false);
      }
    }

    carregarUsuario();
  }, [router]);

  function handleChange(e) {
    const { name, value } = e.target;
    setUsuario((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);

    try {
      await api.put("/Usuario/updateUser", {
        displayName: usuario.displayName,
        email: usuario.email,
        bancaInicial: Number(usuario.bancaInicial),
        metaBanca: Number(usuario.metaBanca),
        casaPreferida: usuario.casaPreferida
      });

      localStorage.setItem("email", usuario.email);

      toast.success("Perfil atualizado com sucesso!");
      atualizarBancaHeader();
      
      router.push("/dashboard");
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Meu Perfil</h1>
          <p className={styles.loading}>Carregando dados...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
      <div className={styles.headerTop}>
          <button
            className={styles.buttonBack}
            onClick={() => router.push("/dashboard")}
          >
            ← Voltar
          </button>
        </div>
        <h1 className={styles.title}>Meu Perfil</h1>
        <p className={styles.subtitle}>
          Visualize seus dados e edite apenas as informações permitidas.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Nome</label>
              <input
                type="text"
                name="displayName"
                value={usuario.displayName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>CPF</label>
              <input type="text" value={usuario.cpf} disabled />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={usuario.email}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Banca Inicial</label>
              <input
                type="number"
                step="0.01"
                name="bancaInicial"
                value={usuario.bancaInicial}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Banca Atual</label>
              <input type="number" value={usuario.bancaAtual} disabled />
            </div>

            <div className={styles.formGroup}>
              <label>Meta de Banca</label>
              <input
                type="number"
                step="0.01"
                name="metaBanca"
                value={usuario.metaBanca}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Casa Preferida</label>
              <select
                name="casaPreferida"
                value={usuario.casaPreferida}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Selecione a casa</option>
                <option value="Betano">Betano</option>
                <option value="Bet365">Bet365</option>
                <option value="SuperBet">SuperBet</option>
                <option value="SportingBet">SportingBet</option>
              </select>
            </div>

            <div className={styles.formGroupFull}>
              <label>Data de Criação</label>
              <input type="text" value={usuario.dataCriacao} disabled />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.push("/dashboard")}
            >
              Voltar
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}