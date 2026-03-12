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
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post("/Auth/login", {
        email,
        password
      });

      localStorage.setItem("token", response.data.data.token);
      console.log(response.data);
      router.push("/dashboard");

    } catch {
      toast.error("email ou senha incorretos!");
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
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className={form.input}
            type="password"
            placeholder="Senha"
            required
            onChange={e => setPassword(e.target.value)}
          />

          <button className={form.button}>Entrar</button>
        </form>

        <p>
          Não tem conta?{" "}
          <Link href="/register" className={form.buttonCriarUser}>
            Criar usuário
          </Link>
        </p>
      </div>
    </div>
  );
}
