// src/app/cliente/dashboard/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

type Agendamento = {
    id: number;
    data_hora: string;
    servicos: { nome: string } | null;
    perfis: { nome_completo: string } | null;
}

export default function ClienteDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);

            const { data, error } = await supabase
                .from('agendamentos')
                .select(`id, data_hora, servicos ( nome ), perfis ( nome_completo )`)
                .eq('cliente_id', session.user.id)
                .gte('data_hora', new Date().toISOString())
                .order('data_hora', { ascending: true });

            if (error) {
                console.error("Erro ao buscar agendamentos:", error);
            } else {
                // O TypeScript pode reclamar aqui, mas a consulta está estruturada para funcionar
                // com a tipagem que definimos. Uma conversão de tipo resolve.
                setAgendamentos(data as any[] || []);
            }

            setLoading(false);
        };
        fetchData();
    }, [router]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><p>Carregando...</p></div>
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Meu Painel</h1>
                    {user && <p className="text-gray-600">Bem-vindo, {user.email}</p>}
                </div>
                <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700">Sair</button>
            </header>
            <main>
                <div className="mb-8 text-center">
                    <Link href="/agendar/servico" className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-blue-700">
                        Agendar Novo Horário
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">Meus Próximos Agendamentos</h2>
                    <div className="space-y-4">
                        {agendamentos.length > 0 ? agendamentos.map(ag => (
                            <div key={ag.id} className="p-4 border rounded-md bg-gray-50">
                                <p className="font-bold text-lg">{ag.servicos?.nome}</p>
                                <p>com <span className="font-medium">{ag.perfis?.nome_completo}</span></p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {new Date(ag.data_hora).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                    {' às '}
                                    {new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        )) : (
                            <p className="text-gray-500">Você ainda não tem agendamentos.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}