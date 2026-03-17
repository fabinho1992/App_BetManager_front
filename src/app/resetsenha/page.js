"use client";

import { useState } from "react";
import api from "@/services/api";
import form from "@/styles/form.module.css";
import layout from "@/styles/layout.module.css";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RecuperarSenha() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigo, setCodigo] = useState("");

  const router = useRouter();

  async function enviarCodigo(e) {
    e.preventDefault();

    setLoading(true);

    try {

      await api.post("/Auth/resetpassword", {
        email: email
      });

      toast.success("Código enviado para seu email!");

      localStorage.setItem("resetEmail", email);
      router.push("/novasenha");

    } catch (error) {

      console.log(error);
      toast.error(
        error.response?.data?.Erros?.[0]?.Message ||
        "Erro ao enviar código"
      );

    } finally {
      setLoading(false);
    }
  }
  
  

  return (
    <div className={layout.container}>
      <div className={layout.card}>

        <h1>Recuperar Senha</h1>

        {!codigoEnviado ? (

          <form className={form.form} onSubmit={enviarCodigo}>

            <input
              className={form.input}
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className={form.button} disabled={loading}>
              {loading ? "⏳ Enviando..." : "Enviar código"}
            </button>

          </form>

        ) : (

          <form className={form.form} onSubmit={validarCodigo}>

            <input
              className={form.input}
              placeholder="Digite o código recebido"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />

            <button className={form.button} disabled={loading}>
              {loading ? "⏳ Validando..." : "Validar código"}
            </button>

          </form>

        )}

      </div>
    </div>
  );
}