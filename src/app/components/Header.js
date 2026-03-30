"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import styles from "@/styles/header.module.css";
import toast from "react-hot-toast";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  async function buscarUsuario() {
    try {
      const email = localStorage.getItem("email");
      if (!email) return;

      const response = await api.get(`/Usuario/email?email=${email}`);
      setUsuario(response.data.data);
    } catch (error) {
      console.error(
        "Erro ao carregar dados do usuário:",
        error.response?.data || error
      );
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const email = localStorage.getItem("email");
        if (!email) return;

        const response = await api.get(`/Usuario/email?email=${email}`);

        if (ativo) {
          setUsuario(response.data.data);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar dados do usuário:",
          error.response?.data || error
        );
      }
    }

    carregar();

    function atualizarBancaNoHeader() {
      buscarUsuario();
    }

    window.addEventListener("bancaAtualizada", atualizarBancaNoHeader);

    return () => {
      ativo = false;
      window.removeEventListener("bancaAtualizada", atualizarBancaNoHeader);
    };
  }, []);

  function navegarPara(rota) {
    setMenuOpen(false);
    router.push(rota);
  }

  function logout() {
    setMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    router.push("/");
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          <h2 className={styles.logo}>App Bet</h2>
        </div>

        <div className={styles.right}>
          <div className={styles.bancaBox}>
            <span className={styles.bancaLabel}>Banca</span>
            <strong className={styles.bancaValue}>
              {usuario?.bancaAtual !== undefined && usuario?.bancaAtual !== null
                ? `R$ ${Number(usuario.bancaAtual).toFixed(2)}`
                : "Carregando..."}
            </strong>
          </div>
        </div>
      </header>

      <div className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.avatar}>👤</div>
          <div>
            <strong>{usuario?.displayName || "Usuário"}</strong>
            <p>{usuario?.email || "Sem email"}</p>
          </div>
        </div>

        <button onClick={() => navegarPara("/editperfil")}>
          👤 Editar Perfil
        </button>

        <button onClick={() => navegarPara("/redefinir-senha")}>
          🔒 Redefinir Senha
        </button>

        <button onClick={logout}>
          🚪 Sair
        </button>
      </div>

      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}