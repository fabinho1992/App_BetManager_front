"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import form from "@/styles/form.module.css";
import layout from "@/styles/layout.module.css";
import toast from "react-hot-toast";


export default function Register() {
  const [formData, setFormData] = useState({
    displayName: "",
    cpf: "",
    email: "",
    casaPreferida: "",
    bancaInicial: "",
    metaBanca: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const passwordChecks = getPasswordStrength(formData.password);

  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.number &&
    passwordChecks.symbol;
  const [errors, setErrors] = useState({
    cpf: "",
    email: ""
  });


  const passwordStrength = calculateStrength(formData.password);
  const cpfNumbers = formData.cpf.replace(/\D/g, "");

  const isFormInvalid =
    loading ||
    !formData.displayName.trim() ||
    !formData.email.trim() ||
    !isValidEmail(formData.email) ||
    cpfNumbers.length !== 11 ||
    !isValidCPF(cpfNumbers) ||
    !isPasswordValid ||
    parseCurrency(formData.bancaInicial) <= 0 ||
    parseCurrency(formData.metaBanca) <= 0;

  function handleChange(e) {

    let { name, value } = e.target;

    if (name === "cpf") {
      value = formatCPF(value);
    }

    if (name === "bancaInicial" || name === "metaBanca") {
      value = formatCurrency(value);
    }

    setFormData({ ...formData, [name]: value });

  }

  //Validação em tempo real cpf
  function handleCPFChange(e) {
    const value = e.target.value;
    const formatted = formatCPF(value);

    setFormData((prev) => ({
      ...prev,
      cpf: formatted
    }));

    const numbers = formatted.replace(/\D/g, "");

    if (numbers.length === 11) {
      if (!isValidCPF(numbers)) {
        setErrors((prev) => ({ ...prev, cpf: "CPF inválido" }));
      } else {
        setErrors((prev) => ({ ...prev, cpf: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, cpf: "CPF incompleto" })); // ✅ AQUI
    }
  }

  //Validação em tempo real Email
  function handleEmailChange(e) {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      email: value
    }));

    if (!value) {
      setErrors((prev) => ({ ...prev, email: "Email obrigatório" }));
    } else if (!isValidEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Email inválido" }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }


    console.log({
      errors,
      cpfLength: formData.cpf.replace(/\D/g, "").length,
      isFormInvalid
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("CLICOU");

    if (loading) return;

    const cpfNumbers = formData.cpf.replace(/\D/g, "");

    if (
      cpfNumbers.length !== 11 ||
      !isValidCPF(cpfNumbers) ||
      !isValidEmail(formData.email)
    ) {
      toast.error("Corrija os erros antes de continuar");
      return;
    }

    setLoading(true);

    try {

      if (errors.cpf || errors.email) {
        toast.error("Corrija os erros antes de continuar");
        return;
      }

      setLoading(true);

      await api.post("/Usuario", {
        displayName: formData.displayName,
        cpf: formData.cpf.replace(/\D/g, ""), // envia só números
        email: formData.email,
        casaPreferida: formData.casaPreferida,
        bancaInicial: parseCurrency(formData.bancaInicial),
        metaBanca: parseCurrency(formData.metaBanca),
        password: formData.password
      });

      toast.success("Usuário criado!");
      router.push("/");
    } catch (error) {
      console.log("Erro completo:", error);
      console.log("Response:", error.response?.data);
      console.log("Mensagem:", error.response?.data?.Erros?.[0]?.Message);
      alert(error.response?.data?.Erros?.[0]?.Message || "Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  }

  function getPasswordStrength(password) {
    return {
      length: password.length >= 9,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };
  }

  function calculateStrength(password) {
    const checks = getPasswordStrength(password);
    const passed = Object.values(checks).filter(Boolean).length;

    return (passed / 4) * 100; // 0 a 100
  }

  //Validação Email real
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  //Validação CPF Real
  function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11) return false;

    // bloqueia CPFs iguais (11111111111, etc)
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    let rest;

    // 1º dígito
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf[i - 1]) * (11 - i);
    }

    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf[9])) return false;

    // 2º dígito
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf[i - 1]) * (12 - i);
    }

    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;

    return rest === parseInt(cpf[10]);
  }

  function formatCPF(value) {
    value = value.replace(/\D/g, "").slice(0, 11);

    if (value.length <= 3) return value;
    if (value.length <= 6) return value.replace(/(\d{3})(\d+)/, "$1.$2");
    if (value.length <= 9) return value.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");

    return value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
  }

  function handleCPFKeyDown(e) {
    if (
      !/[0-9]/.test(e.key) &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
    ) {
      e.preventDefault();
    }
  }

  function handleCPFPaste(e) {
    const paste = e.clipboardData.getData("text");

    if (!/^\d+$/.test(paste)) {
      e.preventDefault();
    }
  }

  function formatCurrency(value) {
    value = value.replace(/\D/g, "");

    const number = Number(value) / 100;

    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function parseCurrency(value) {
    if (!value) return 0;

    return Number(
      value
        .replace(/\D/g, "") // remove tudo
    ) / 100;
  }



  return (
    <div className={layout.container}>
      <div className={layout.card}>
        <h1>Criar Conta</h1>

        <form className={form.form} onSubmit={handleSubmit}>
          <input
            className={form.input}
            name="displayName"
            placeholder="Nome completo"
            value={formData.displayName}
            onChange={handleChange}
          />
          <input
            className={`${form.input} ${errors.cpf ? form.inputError : ""}`}
            name="cpf"
            placeholder="CPF (000.000.000-00)"
            value={formData.cpf}
            //onChange={handleChange}
            onChange={handleCPFChange}
            onKeyDown={handleCPFKeyDown}
            onPaste={handleCPFPaste}
            maxLength={14}
          />
          {errors.cpf && <span className={form.errorText}>{errors.cpf}</span>}
          <input
            className={`${form.input} ${errors.email ? form.inputError : ""}`}
            name="email"
            placeholder="Email"
            value={formData.email}
            //onChange={handleChange}
            onChange={handleEmailChange}
          />

          {errors.email && <span className={form.errorText}>{errors.email}</span>}
          <input
            className={form.input}
            name="bancaInicial"
            placeholder="Banca inicial"
            value={formData.bancaInicial || ""}
            onChange={handleChange}
          />
          
          <input
            className={form.input}
            name="metaBanca"
            placeholder="Meta de banca"
            value={formData.metaBanca || ""}
            onChange={handleChange}
          />
          <select
                name="casaPreferida"
                value={formData.casaPreferida}
                onChange={handleChange}
                className={form.select}
              >
            <option value="">Selecione a casa</option>
                <option value="Betano">Betano</option>
                <option value="Bet365">Bet365</option>
                <option value="SuperBet">SuperBet</option>
                <option value="SportingBet">SportingBet</option>
          </select>
          <input
            className={form.input}
            type="password"
            placeholder="Senha"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Barra de força */}
          <div className={form.passwordStrength}>
            <div
              className={form.passwordBar}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>

          {/* Regras */}
          <div className={form.passwordRules}>
            <span className={passwordChecks.length ? form.valid : form.invalid}>
              • Mínimo 9 caracteres
            </span>
            <span className={passwordChecks.upper ? form.valid : form.invalid}>
              • Letra maiúscula
            </span>
            <span className={passwordChecks.number ? form.valid : form.invalid}>
              • Número
            </span>
            <span className={passwordChecks.symbol ? form.valid : form.invalid}>
              • Símbolo
            </span>
          </div>

          <button
            className={form.button}
            disabled={isFormInvalid}
          >
            {loading ? "⏳ Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </div >
  );
}
