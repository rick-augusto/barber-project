// src/app/barbeiro/dashboard/page.tsx
'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

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
            setUser(session.user);
            setLoading(false);
        };
        checkUser();
    }, [router]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><p>Carregando...</p></div>
    }

    return (
        <div className="p-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Painel do Barbeiro</h1>
                    <p className="text-gray-600">Bem-vindo, {user?.email}</p>
                </div>
                <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700">Sair</button>
            </header>
            <main className="mt-8">
                <p>Em breve: sua agenda e gerenciamento de horários.</p>
            </main>
        </div>
    );
}