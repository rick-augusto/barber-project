'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';

type Agendamento = {
    id: number;
    data_hora: string;
    servicos: { nome: string; preco: number; } | null;
    barbeiro: { nome_completo: string | null; avatar_url: string | null; } | null;
}
type BarbeariaInfo = { id: number; nome: string; }

export default function ClienteDashboard({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [barbearia, setBarbearia] = useState<BarbeariaInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push(`/${params.slug}/login`);
                return;
            }
            setUser(session.user);

            const { data: barbeariaData } = await supabase.from('barbearias').select('id, nome').eq('slug', params.slug).single();
            if (!barbeariaData) {
                setLoading(false);
                alert("Barbearia não encontrada.");
                return;
            }
            setBarbearia(barbeariaData);

            const { data, error } = await supabase
                .from('agendamentos')
                .select(`id, data_hora, servicos ( nome, preco ), barbeiro: perfis ( nome_completo, avatar_url )`)
                .eq('cliente_id', session.user.id)
                .eq('barbearia_id', barbeariaData.id)
                .gte('data_hora', new Date().toISOString())
                .order('data_hora', { ascending: true });
            
            if (error) {
                console.error("Erro ao buscar agendamentos:", error);
            } else {
                setAgendamentos(data as unknown as Agendamento[] || []);
            }
            setLoading(false);
        };
        fetchData();
    }, [params.slug, router]);

    const handleCancelarAgendamento = async (agendamentoId: number) => {
        if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;
        const { error } = await supabase.from('agendamentos').delete().match({ id: agendamentoId });
        if (error) {
            alert("Erro ao cancelar o agendamento: " + error.message);
        } else {
            setAgendamentos(agendamentos.filter(ag => ag.id !== agendamentoId));
            alert("Agendamento cancelado com sucesso!");
        }
    };
    
    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><p>Carregando painel...</p></div>
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <header className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Meu Painel - {barbearia?.nome}</h1>
                    {user && <p className="text-gray-600">Bem-vindo de volta!</p>}
                </div>
                <button onClick={async () => { await supabase.auth.signOut(); router.push(`/${params.slug}/login`); }} className="self-start sm:self-center rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700">Sair</button>
            </header>
            <main>
                <div className="mb-8 text-center">
                    <Link href={`/agendar/servico`} className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-md hover:shadow-lg">
                        Agendar Novo Horário
                    </Link>
                </div>

                <div className="mx-auto max-w-3xl">
                    <h2 className="mb-6 text-2xl font-semibold text-gray-800 text-center sm:text-left">Meus Próximos Agendamentos</h2>
                    <div className="space-y-6">
                        {agendamentos.length > 0 ? agendamentos.map(ag => {
                            const data = new Date(ag.data_hora);
                            const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });
                            const diaMes = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                            const horario = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const servico = ag.servicos;
                            const barbeiro = ag.barbeiro;

                            return (
                                <div key={ag.id} className="flex flex-col sm:flex-row rounded-lg bg-white shadow-md overflow-hidden">
                                    <div className="w-full sm:w-1/3 bg-gray-800 p-4 text-white flex flex-col justify-center items-center text-center">
                                        <p className="text-lg capitalize">{diaSemana}</p>
                                        <p className="text-4xl font-bold">{diaMes.split(' de ')[0]}</p>
                                        <p className="text-lg capitalize">{diaMes.split(' de ')[1]}</p>
                                        <p className="mt-2 rounded-full bg-white/20 px-4 py-1 text-lg font-semibold">{horario}</p>
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="mb-4">
                                                <p className="text-2xl font-bold text-gray-900">{servico?.nome || 'Serviço não informado'}</p>
                                                <p className="text-lg font-semibold text-blue-600">R$ {servico?.preco ? Number(servico.preco).toFixed(2) : '0.00'}</p>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                {barbeiro?.avatar_url ? (
                                                    <Image src={barbeiro.avatar_url} alt={`Foto de ${barbeiro.nome_completo}`} width={40} height={40} className="h-10 w-10 rounded-full object-cover"/>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300"/>
                                                )}
                                                <p className="text-md text-gray-700">{barbeiro?.nome_completo || 'Barbeiro não informado'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleCancelarAgendamento(ag.id)}
                                            className="self-end mt-4 text-sm font-medium text-red-600 hover:text-red-800 transition"
                                        >
                                            Cancelar agendamento
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="rounded-lg bg-white p-6 shadow-md text-center">
                                <p className="text-gray-500">Você ainda não tem agendamentos nesta barbearia.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}