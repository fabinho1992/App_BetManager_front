"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import form from "@/styles/form.module.css";
import layout from "@/styles/layout.module.css";

export default function Register() {
  const [formData, setFormData] = useState({});
  const router = useRouter();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post("/Usuario", {
        displayName: formData.displayName,
        cpf: formData.cpf,
        email: formData.email,
        bancaInicial: Number(formData.bancaInicial),
        metaBanca: Number(formData.metaBanca),
        password: formData.password
      });

      alert("Usuário criado!");
      router.push("/");
    } catch {
      alert("Erro ao cadastrar usuário");
    }
  }

  return (
    <div className={layout.container}>
      <div className={layout.card}>
        <h1>Criar Conta</h1>

        <form className={form.form} onSubmit={handleSubmit}>
          <input className={form.input} name="displayName" placeholder="Nome" onChange={handleChange} />
          <input className={form.input} name="cpf" placeholder="CPF" onChange={handleChange} />
          <input className={form.input} name="email" placeholder="Email" onChange={handleChange} />
          <input className={form.input} name="bancaInicial" placeholder="Banca Inicial" onChange={handleChange} />
          <input className={form.input} name="metaBanca" placeholder="Meta da Banca" onChange={handleChange} />
          <input className={form.input} type="password" name="password" placeholder="Senha" onChange={handleChange} />

          <button className={form.button}>Cadastrar</button>
        </form>
      </div>
    </div>
  );
}
