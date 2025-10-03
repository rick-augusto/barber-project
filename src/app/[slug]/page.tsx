'use client'

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";

type Service = { id: number; nome: string; preco: number; duracao_minutos: number; }
type BarbeariaInfo = { id: number; nome: string; endereco: string | null; telefone: string | null; }

export default function PaginaDaBarbearia({ params }: { params: { slug: string } }) {
    const [barbearia, setBarbearia] = useState<BarbeariaInfo | null>(null);
    const [servicos, setServicos] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDadosDaBarbearia = async () => {
            const { data: barbeariaData, error: barbeariaError } = await supabase
                .from('barbearias')
                .select('id, nome, endereco, telefone')
                .eq('slug', params.slug)
                .single();

            if (barbeariaError || !barbeariaData) {
                setError("Barbearia não encontrada ou indisponível.");
                setLoading(false);
                return;
            }
            setBarbearia(barbeariaData);

            const { data: servicosData, error: servicosError } = await supabase
                .from('servicos')
                .select('*')
                .eq('id_barbearia', barbeariaData.id)
                .order('nome')
                .limit(4);

            if (servicosError) {
                console.error("Erro ao buscar serviços:", servicosError);
            } else {
                setServicos(servicosData || []);
            }
            
            setLoading(false);
        };

        if (params.slug) {
            fetchDadosDaBarbearia();
        }
    }, [params.slug]);

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white"><p>Carregando...</p></div>;
    if (error || !barbearia) return <div className="flex h-screen items-center justify-center bg-gray-100 text-red-500"><p>{error}</p></div>;

    return (
        <div className="bg-white text-gray-800">
            {/* Seção Principal (Hero) */}
            <section className="bg-gray-900 text-white text-center py-20 sm:py-32">
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">{barbearia.nome}</h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">A qualidade que você merece, a experiência que você procura. Agende seu horário com os melhores.</p>
                <div className="mt-10 flex justify-center gap-4">
                    <Link href="/agendar/servico" className="rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700">
                        Agendar Horário
                    </Link>
                    <Link href="/login" className="rounded-md bg-gray-700 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-gray-600">
                        Login
                    </Link>
                </div>
            </section>

            {/* Seção de Serviços */}
            {servicos.length > 0 && (
                <section className="py-16 sm:py-24 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Nossos Serviços</h2>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {servicos.map(servico => (
                                <div key={servico.id} className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                                    <h3 className="text-xl font-semibold text-gray-800">{servico.nome}</h3>
                                    <p className="mt-2 text-sm text-gray-500">{servico.duracao_minutos} minutos</p>
                                    <p className="mt-4 text-2xl font-bold text-gray-900">R$ {Number(servico.preco).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link href="/agendar/servico" className="text-blue-600 font-semibold hover:underline">
                                Ver todos os serviços e agendar &rarr;
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Seção de Contato e Localização */}
            <section className="bg-white py-16 sm:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">Onde nos encontrar</h2>
                    <div className="text-lg text-gray-700 space-y-2">
                        <p>📍 {barbearia.endereco || 'Endereço não informado'}</p>
                        <p>📱 {barbearia.telefone || 'WhatsApp não informado'}</p>
                    </div>
                </div>
            </section>

            {/* Rodapé */}
            <footer className="bg-gray-900 text-white p-6 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} {barbearia.nome} | Desenvolvido por BarberProject</p>
            </footer>
        </div>
    );
}