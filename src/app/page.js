"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import form from "@/styles/form.module.css";
import layout from "@/styles/layout.module.css";
import toast from "react-hot-toast";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState("");
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function navegarPara(pagina) {
    setLoadingPage(pagina);
    router.push(pagina);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/Auth/login", {
        email,
        password,
      });

      localStorage.setItem("email", email);
      localStorage.setItem("token", response.data.data.token);
      console.log(response.data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro completo:", error);
      console.error("Status:", error.response?.status);
      console.error("Data do erro:", error.response?.data);
      toast.error("email ou senha incorretos!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const motivo = localStorage.getItem("logoutReason");

    if (motivo === "inatividade") {
      toast.error("Sessão encerrada por inatividade");
      localStorage.removeItem("logoutReason");
    }
  }, []);

  return (
    <div className={layout.container}>
      <div className={form.loginPageContent}>
      <div className={form.loginLogoOutside}>
        <Image
          src="/BetVision-Logo.png"
          alt="BetVision"
          width={800}
          height={100}
          className={form.loginLogo}
          priority
        />
      </div>
      <div className={layout.card}>
        <h1>Login</h1>

        <form className={form.form} onSubmit={handleLogin}>
          <input
            className={form.input}
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className={layout.passwordWrapper}>
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={form.input}
            />

            <button
              type="button"
              onClick={() => setMostrarSenha((prev) => !prev)}
              className={layout.showPasswordButton}
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <button className={form.button} disabled={loading}>
            {loading ? "⏳ Entrando..." : "Entrar"}
          </button>
        </form>
        <div className={form.buttons}>
          <button
            type="button"
            className={form.buttonCriarUser}
            onClick={() => navegarPara("/register")}
            disabled={loadingPage === "/register"}
          >
            {loadingPage === "/register" ? "⏳ Abrindo..." : "Criar usuário"}
          </button>
          <button
            type="button"
            className={form.buttonRecuperarSenha}
            onClick={() => navegarPara("/resetsenha")}
            disabled={loadingPage === "/resetsenha"}
          >
            {loadingPage === "/resetsenha"
              ? "⏳ Abrindo..."
              : "Recuperar senha"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
