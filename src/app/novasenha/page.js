"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

import form from "@/styles/form.module.css";
import layout from "@/styles/layout.module.css";

export default function NovaSenha() {

  const [code, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function alterarSenha(e) {
    e.preventDefault();

    const email = localStorage.getItem("resetEmail");

    if (!email) {
      toast.error("Email não encontrado. Faça o processo novamente.");
      router.push("/resetsenha");
      return;
    }

    setLoading(true);

    try {

      await api.post("/Auth/resetpasswordchange", {
        email: email,
        code: code,
        password: password
      });

      toast.success("Senha alterada com sucesso!");

      localStorage.removeItem("resetEmail");

      router.push("/");

    } catch (error) {

      toast.error(
        error.response?.data?.Erros?.[0]?.Message ||
        "Erro ao alterar senha"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={layout.container}>
      <div className={layout.card}>

        <h1>Redefinir Senha</h1>

        <form className={form.form} onSubmit={alterarSenha}>

          <input
            className={form.input}
            placeholder="Código recebido no email"
            maxLength={6}
            value={code}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />

          <input
            className={form.input}
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className={form.button} disabled={loading}>
            {loading ? "⏳ Alterando..." : "Alterar senha"}
          </button>

        </form>

      </div>
    </div>
  );
}