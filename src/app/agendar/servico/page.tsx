// src/app/agendar/servico/page.tsx
'use client'

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";

type Service = { id: number; nome: string; preco: number; duracao_minutos: number; }

export default function EscolherServicoPage() {
    const [servicos, setServicos] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServicos = async () => {
            const { data, error } = await supabase.from('servicos').select('*').order('nome');
            if (error) alert("Não foi possível carregar os serviços.");
            else setServicos(data || []);
            setLoading(false);
        };
        fetchServicos();
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8">
            <div className="w-full max-w-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Agendar Horário</h1>
                    <p className="mt-2 text-lg text-gray-600">Passo 1: Escolha o serviço</p>
                </header>

                <main className="rounded-lg bg-white p-8 shadow-lg">
                    {loading ? <p>Carregando serviços...</p> : (
                        <div className="space-y-4">
                            {servicos.map(servico => (
                                <Link key={servico.id} href={`/agendar/barbeiros/${servico.id}`} className="block rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 hover:shadow-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{servico.nome}</h3>
                                            <p className="text-sm text-gray-500">{servico.duracao_minutos} minutos</p>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">R$ {Number(servico.preco).toFixed(2)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}