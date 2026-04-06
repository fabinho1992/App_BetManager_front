"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import form from "@/styles/form.module.css";
import layout from "@/styles/layout.module.css";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState("");
  const router = useRouter();

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

          <input
            className={form.input}
            type="password"
            placeholder="Senha"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

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
  );
}
