// src/app/barbeiro/dashboard/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import GerenciarHorarios from '@/components/barbeiro/GerenciarHorarios';
import GerenciarHabilidades from '@/components/barbeiro/GerenciarHabilidades';
import GerenciarAvatar from '@/components/barbeiro/GerenciarAvatar';

export default function BarbeiroDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            // Validação extra para garantir que é um barbeiro
            const { data: profile } = await supabase.from('perfis').select('funcao').eq('id', session.user.id).single();
            if (!profile || profile.funcao !== 'barbeiro') {
                alert('Acesso negado.');
                router.push('/login');
                return;
            }

            setUser(session.user);
            setLoading(false);
        };
        checkUser();
    }, [router]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><p>Carregando...</p></div>
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <header className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Painel do Barbeiro</h1>
                    {user && <p className="text-gray-600">Bem-vindo, {user.email}</p>}
                </div>
                <button 
                    onClick={async () => { 
                        await supabase.auth.signOut(); 
                        router.push('/login'); 
                    }} 
                    className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
                >
                    Sair
                </button>
            </header>
            <main className="space-y-8">
    {user && (
        <>
            <GerenciarAvatar userId={user.id} />
            <GerenciarHorarios userId={user.id} />
            <GerenciarHabilidades userId={user.id} />
        </>
    )}
            </main>
        </div>
    );
}