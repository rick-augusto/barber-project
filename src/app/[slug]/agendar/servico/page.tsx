// src/app/[slug]/agendar/servico/page.tsx
'use client'

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";

type Service = { id: number; nome: string; preco: number; duracao_minutos: number; }
type BarbeariaInfo = { id: number; nome: string; }

export default function EscolherServicoPage({ params }: { params: { slug: string } }) {
    const [servicos, setServicos] = useState<Service[]>([]);
    const [barbearia, setBarbearia] = useState<BarbeariaInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDadosDaBarbearia = async () => {
            const { data: barbeariaData, error: barbeariaError } = await supabase
                .from('barbearias')
                .select('id, nome')
                .eq('slug', params.slug)
                .single();

            if (barbeariaError || !barbeariaData) {
                setError("Barbearia não encontrada.");
                setLoading(false);
                return;
            }

            setBarbearia(barbeariaData);

            const { data: servicosData, error: servicosError } = await supabase
                .from('servicos')
                .select('*')
                .eq('id_barbearia', barbeariaData.id)
                .order('nome');

            if (servicosError) {
                setError("Não foi possível carregar os serviços.");
            } else {
                setServicos(servicosData || []);
            }

            setLoading(false);
        };

        if (params.slug) {
            fetchDadosDaBarbearia();
        }
    }, [params.slug]);

    if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Carregando barbearia...</p></div>
    if (error) return <div className="flex min-h-screen items-center justify-center"><p className="text-red-500">{error}</p></div>

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8">
            <div className="w-full max-w-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">{barbearia?.nome}</h1>
                    <p className="mt-2 text-lg text-gray-600">Passo 1: Escolha o serviço</p>
                </header>

                <main className="rounded-lg bg-white p-8 shadow-lg">
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
                </main>
            </div>
        </div>
    );
}