"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import layout from "@/styles/layout.module.css";
import dashboard from "@/styles/dashboard.module.css";
import toast from "react-hot-toast";
import GraficoPizza from "@/app/components/GraficoPizza";

export default function Dashboard() {
    
    const [casas, setCasas] = useState([]);
    const [dadosDashboard, setDadosDashboard] = useState(null);
    const router = useRouter();
    const temBilhetes =
        dadosDashboard &&
        (dadosDashboard.totalGanhas + dadosDashboard.totalPerdidas > 0);

    async function carregarResumo() {
        try {

            const res = await api.get("/Bilhete/dashboard");

            if (!res.data?.data || res.data.data.length === 0) {
                toast.info("Faça seu primeiro bilhete!");
                return;
            }


            setDadosDashboard(res.data.data);

        } catch (error) {
            console.error(error);
        }
    }

    async function carregarCasas() {
        try {

            const res = await api.get("/Bilhete/resumoCasaApostas");

            console.log(res.data);

            setCasas(res.data.data);

        } catch (error) {

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                router.push("/");
            }

            console.error(error);
            toast.error("Erro ao carregar dashboard");

        }
    }

    function abrirCasa(casa) {

        if (casa.quantidade === 0) {
            toast("Nenhum bilhete nessa casa de aposta.");
            return;
        }

        router.push(`/bilhetes?casa=${casa.casaAposta}`);
    }

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        carregarCasas();
        carregarResumo();

    }, [router]);

    return (
        <div className={dashboard.container}>
            <h1 className={dashboard.title}>Dashboard</h1>

            {/* 🔴 SEM DADOS */}
            {!temBilhetes && (
                <>
                    {/* CARDS */}
                    <div className={dashboard.stats}>
                        <div className={dashboard.card}>
                            <h3>Ganhos</h3>
                            <p>0</p>
                        </div>

                        <div className={dashboard.card}>
                            <h3>Perdidas</h3>
                            <p>0</p>
                        </div>

                        <div className={dashboard.card}>
                            <h3>Total</h3>
                            <p>0</p>
                        </div>
                    </div>

                    {/* EMPTY STATE */}
                    <div className={dashboard.emptyState}>
                        <div className={dashboard.icon}>📊</div>
                        <h2>Nenhum bilhete ainda</h2>
                        <p>Comece criando sua primeira aposta para ver seus resultados aqui.</p>

                        <button
                            className={layout.buttonPrimaryDash}
                            onClick={() => router.push("/criar-bilhete")}
                        >
                            + Criar sua primeira aposta
                        </button>
                    </div>

                    {/* DICAS */}
                    <div className={dashboard.tips}>
                        <h2>💡 Dicas para começar</h2>
                        <ul>
                            <li>✔ Comece com apostas pequenas</li>
                            <li>✔ Controle sua banca</li>
                            <li>✔ Evite apostar por emoção</li>
                        </ul>
                    </div>
                </>
            )}

            {/* 🟢 COM DADOS (SEU DASHBOARD ORIGINAL) */}
            {temBilhetes && (
                <>
                    <GraficoPizza
                        ganhas={dadosDashboard.totalGanhas}
                        perdidas={dadosDashboard.totalPerdidas}
                    />

                    <div className={dashboard.casasContainer}>
                        {casas.map((casa) => (
                            <div
                                key={casa.casaAposta}
                                className={dashboard.casaCard}
                                onClick={() => abrirCasa(casa)}
                            >
                                <div className={dashboard.casaNome}>
                                    {casa.casaAposta}
                                </div>

                                <div className={dashboard.casaQuantidade}>
                                    {casa.quantidade} bilhetes
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* 🔵 BOTÕES (sempre visível) */}
            <div className={dashboard.verTodosContainer}>
                <button
                    className={layout.buttonFilter}
                    onClick={() => router.push("/bilhetes")}
                >
                    Ver todos os bilhetes
                </button>

                {temBilhetes && (
                    <button
                        className={layout.buttonPrimarydashboard}
                        onClick={() => router.push("/criar-bilhete")}
                    >
                        + Criar Bilhete
                    </button>
                )}
            </div>
        </div>
    );
}