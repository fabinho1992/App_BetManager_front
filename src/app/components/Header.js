"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/header.module.css";

export default function Header() {

  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  return (
    <header className={styles.header}>
      <button className={styles.logoutButton} onClick={logout}>
        Logout
      </button>
    </header>
  );
}