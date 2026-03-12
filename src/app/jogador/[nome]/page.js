"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import styles from "@/styles/jogador.module.css";

export default function JogadorDetalhes() {
    const { nome } = useParams();
    const router = useRouter();

    const [jogador, setJogador] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    async function buscarJogador() {
        try {
            const res = await api.get("/analytics/jogador", {
                params: { nome }
            });

            setJogador(res.data.data);
        } catch (error) {
            console.error(error);
            alert("Jogador não encontrado");
            router.push("/bilhetes");
        } finally {
            setLoading(false);
        }
    }

    if (nome) {
        buscarJogador();
    }
}, [nome]);

    if (loading) return <div className={styles.loading}>Carregando...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>{jogador.nomeCompleto}</h1>

                <div className={styles.grid}>
                    <div><strong>Posição:</strong> {jogador.posicao}</div>
                    <div><strong>Altura:</strong> {jogador.altura}</div>
                    <div><strong>Peso:</strong> {jogador.peso}</div>
                    <div><strong>Camisa:</strong> #{jogador.camisa}</div>
                    <div><strong>Draft:</strong> {jogador.draftInfo}</div>
                    <div><strong>Faculdade:</strong> {jogador.faculdade}</div>
                    <div><strong>País:</strong> {jogador.pais}</div>
                    <div><strong>Time:</strong> {jogador.timeAtual}</div>
                </div>

                <button
                    className={styles.button}
                    onClick={() => router.push("/bilhetes")}
                >
                    Voltar
                </button>
            </div>
        </div>
    );
}