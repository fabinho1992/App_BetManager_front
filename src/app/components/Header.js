"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import styles from "@/styles/header.module.css";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailUser, setEmailUser] = useState("");
  const [bancaAtual, setBancaAtual] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const carregarUsuario = useCallback(async () => {
    try {
      const email = localStorage.getItem("email");
      if (!email) return;

      setEmailUser(email);

      const response = await api.get(`/Usuario/email?email=${email}`);
      setBancaAtual(response.data.data.bancaAtual);
      setUsuario(response.data.data);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error.response?.data || error);
    }
  }, []);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  useEffect(() => {
    function atualizarBancaNoHeader() {
      carregarUsuario();
    }

    window.addEventListener("bancaAtualizada", atualizarBancaNoHeader);

    return () => {
      window.removeEventListener("bancaAtualizada", atualizarBancaNoHeader);
    };
  }, [carregarUsuario]);

  function logout() {
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
              {bancaAtual !== null
                ? `R$ ${Number(bancaAtual).toFixed(2)}`
                : "Carregando..."}
            </strong>
          </div>
        </div>
      </header>

      <div className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.avatar}>👤</div>
          <div>
            <strong>{usuario?.displayName}</strong>
            <p>{emailUser || "Sem email"}</p>
          </div>
        </div>

        <button onClick={() => router.push("/editperfil")}>
          👤 Editar Perfil
        </button>

        <button onClick={() => router.push("/redefinir-senha")}>
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