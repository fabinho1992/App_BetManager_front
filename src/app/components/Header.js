"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/header.module.css";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailUser, setEmailUser] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setEmailUser(email);
    }
  }, []); 

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email"); // opcional: remover o email também
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
      </header>

      {/* MENU LATERAL */}
      <div className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.avatar}>👤</div>
          <div>
            <strong>Usuário</strong>
            <p>{emailUser || "Sem email"}</p> {/* Mostra o email aqui */}
          </div>
        </div>
        <button onClick={() => router.push("/perfil")}>
          👤 Editar Perfil
        </button>

        <button onClick={() => router.push("/redefinir-senha")}>
          🔒 Redefinir Senha
        </button>

        <button onClick={logout}>
          🚪 Sair
        </button>
      </div>

      {/* OVERLAY (escurece fundo) */}
      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}