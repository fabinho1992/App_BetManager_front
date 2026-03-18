"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

const TEMPO_INATIVIDADE = 10 * 60 * 1000;

export default function AutoLogout() {

  useEffect(() => {

    let timeout;

    const resetTimer = () => {

      clearTimeout(timeout);

      timeout = setTimeout(() => {

        toast.error("Sessão encerrada por inatividade");

        localStorage.removeItem("token");
        localStorage.setItem("logoutReason", "inatividade");

        window.location.href = "/";

      }, TEMPO_INATIVIDADE);

    };

    const eventos = ["mousemove", "keydown", "click", "scroll"];

    eventos.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {

      eventos.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );

      clearTimeout(timeout);

    };

  }, []);

  return null;
}