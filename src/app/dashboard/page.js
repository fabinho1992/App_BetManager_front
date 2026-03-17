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

    async function carregarResumo() {
        try {

            const res = await api.get("/Bilhete/dashboard");

            if (!res.data?.data || res.data.data.length === 0) {
                toast.info("Faça seu primeiro bilhete!");
                router.push("/criar-bilhete");
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

              {dadosDashboard && (dadosDashboard.totalGanhas + dadosDashboard.totalPerdidas > 0) ? (
                <GraficoPizza
                    ganhas={dadosDashboard.totalGanhas}
                    perdidas={dadosDashboard.totalPerdidas}
                />
            ) : (
                <div className={dashboard.semBilhetes}>
                    <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>💰</div>
                    <p>Você ainda não fez nenhuma aposta.</p>
                    <button
                        className={layout.buttonPrimary}
                        onClick={() => router.push("/criar-bilhete")}
                    >
                        + Criar sua primeira aposta
                    </button>
                </div>
            )}

            <div className={dashboard.casasContainer}>

                {casas.map((casa) => (

                    <div
                        key={casa.casaAposta}
                        className={dashboard.casaCard}
                        onClick={() => abrirCasa(casa)}
                    >

                        <div className={dashboard.casaNome}>
                            ({casa.casaAposta})
                        </div>

                        <div className={dashboard.casaQuantidade}>
                            ({casa.quantidade} bilhetes)
                        </div>

                    </div>

                ))}

            </div>

            <div className={dashboard.verTodosContainer}>

                <button
                    className={layout.buttonFilter}
                    onClick={() => router.push("/bilhetes")}
                >
                    Ver todos os bilhetes
                </button>

                <button
                    className={layout.buttonPrimary}
                    onClick={() => router.push("/criar-bilhete")}
                >
                    + Criar Bilhete
                </button>

            </div>

        </div>
    );
}