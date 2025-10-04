// src/app/[slug]/agendar/barbeiros/[servicoId]/page.tsx
'use client';

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation'; // 1. Importe o hook

type Barbeiro = {
  id: string;
  nome_completo: string | null;
  avatar_url: string | null;
}

export default function EscolherBarbeiroPage() {
    const params = useParams(); // 2. Use o hook
    const slug = params.slug as string;
    const servicoId = params.servicoId as string; // 3. Extraia o ID

    const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBarbeiros = async () => {
            const { data: habilidades, error: errHab } = await supabase
                .from('barbeiro_habilidades')
                .select('barbeiro_id')
                .eq('servico_id', servicoId); // 4. Use a variável

            if (errHab || !habilidades || habilidades.length === 0) {
                setLoading(false);
                return;
            }

            const barbeiroIds = habilidades.map(h => h.barbeiro_id);

            const { data, error } = await supabase
                .from('perfis')
                .select('id, nome_completo, avatar_url')
                .in('id', barbeiroIds);

            if (error) alert("Erro ao carregar barbeiros.");
            else setBarbeiros(data || []);

            setLoading(false);
        };

        if (servicoId) {
            fetchBarbeiros();
        }
    }, [servicoId]); // 5. Use a variável na dependência

    return (
         <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8">
            <div className="w-full max-w-2xl">
                 <header className="mb-8 text-center">
                    <Link href={`/${slug}/agendar/servico`} className="text-blue-600 hover:underline mb-4 block">&larr; Voltar para Serviços</Link>
                    <h1 className="text-4xl font-bold text-gray-800">Agendar Horário</h1>
                    <p className="mt-2 text-lg text-gray-600">Passo 2: Escolha o profissional</p>
                </header>
                <main className="rounded-lg bg-white p-8 shadow-lg">
                    {loading ? <p>Buscando profissionais...</p> : (
                        <div className="space-y-4">
                            {barbeiros.length > 0 ? barbeiros.map(barbeiro => (
                                <Link key={barbeiro.id} href={`/${slug}/agendar/horarios/${barbeiro.id}/${servicoId}`} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50 hover:shadow-md">
                                    <Image
                                        src={barbeiro.avatar_url || '/default-avatar.png'} // Tenha uma imagem padrão em /public
                                        alt={barbeiro.nome_completo || 'Avatar'}
                                        width={60}
                                        height={60}
                                        className="rounded-full object-cover"
                                    />
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