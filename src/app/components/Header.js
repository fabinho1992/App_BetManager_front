"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/header.module.css";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem("token");
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