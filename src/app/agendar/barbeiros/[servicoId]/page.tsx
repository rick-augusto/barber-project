// src/app/agendar/barbeiros/[servicoId]/page.tsx
'use client'

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image"; // Importar o componente de Imagem
import { useEffect, useState } from "react";

// Atualizar o tipo para incluir a URL do avatar
type Barbeiro = { 
    id: string; 
    nome_completo: string | null;
    avatar_url: string | null; 
}

export default function EscolherBarbeiroPage({ params }: { params: { servicoId: string } }) {
    const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBarbeiros = async () => {
            const { data: habilidades, error: errHab } = await supabase
                .from('barbeiro_habilidades')
                .select('barbeiro_id')
                .eq('servico_id', params.servicoId);

            if (errHab || !habilidades || habilidades.length === 0) {
                setLoading(false);
                return;
            }

            const barbeiroIds = habilidades.map(h => h.barbeiro_id);

            // Atualizar a busca para incluir o avatar_url
            const { data, error } = await supabase
                .from('perfis')
                .select('id, nome_completo, avatar_url')
                .in('id', barbeiroIds);

            if (error) alert("Erro ao carregar barbeiros.");
            else setBarbeiros(data || []);

            setLoading(false);
        };

        if (params.servicoId) {
            fetchBarbeiros();
        }
    }, [params.servicoId]);

    return (
         <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8">
            <div className="w-full max-w-2xl">
                 <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Agendar Horário</h1>
                    <p className="mt-2 text-lg text-gray-600">Passo 2: Escolha o profissional</p>
                </header>
                <main className="rounded-lg bg-white p-8 shadow-lg">
                    {loading ? <p>Buscando profissionais...</p> : (
                        <div className="space-y-4">
                            {barbeiros.length > 0 ? barbeiros.map(barbeiro => (
                                <Link key={barbeiro.id} href={`/agendar/horarios/${barbeiro.id}/${params.servicoId}`} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 hover:shadow-md">
                                    {barbeiro.avatar_url ? (
                                        <Image src={barbeiro.avatar_url} alt={`Foto de ${barbeiro.nome_completo}`} width={56} height={56} className="h-14 w-14 rounded-full object-cover"/>
                                    ) : (
                                        <div className="h-14 w-14 rounded-full bg-gray-300"/>
                                    )}
                                    <h3 className="text-lg font-semibold text-gray-900">{barbeiro.nome_completo}</h3>
                                </Link>
                            )) : <p>Nenhum barbeiro disponível para este serviço.</p>}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}