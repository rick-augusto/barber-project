// src/app/admin/dashboard/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AdminCard = ({ href, title, description }: { href: string, title: string, description: string }) => (
    <Link href={href} className="block rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105 hover:shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
    </Link>
);

export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            const { data: profile } = await supabase.from('perfis').select('funcao').eq('id', session.user.id).single();
            if (!profile || profile.funcao !== 'admin') {
                alert('Acesso negado.');
                router.push('/login');
                return;
            }
            setLoading(false);
        };
        checkAdmin();
    }, [router]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><p>Verificando permissões...</p></div>
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Painel do Administrador</h1>
                <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700">Sair</button>
            </header>
            <main className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AdminCard 
                    href="/admin/servicos"
                    title="Gerenciar Serviços"
                    description="Adicione, edite e remova os serviços oferecidos."
                />
                <AdminCard 
                    href="/admin/funcionarios"
                    title="Gerenciar Funcionários"
                    description="Cadastre e gerencie os barbeiros da sua equipe."
                />
            </main>
        </div>
    )
}