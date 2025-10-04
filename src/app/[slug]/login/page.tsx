// src/app/[slug]/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useBarbearia } from '@/contexts/BarbeariaContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { setBarbeariaId, setSlug } = useBarbearia();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    if (setBarbeariaId) setBarbeariaId(null);

    // 1. Autenticar o utilizador
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (loginData.user) {
      // 2. Buscar perfil para redirecionamento
      const { data: profile } = await supabase
        .from('perfis')
        .select('funcao, id_barbearia')
        .eq('id', loginData.user.id)
        .single();

      if (profile) {
        const { data: barbearia } = await supabase
          .from('barbearias')
          .select('id, slug')
          .eq('id', profile.id_barbearia)
          .single();

        if (barbearia) {
          setBarbeariaId(barbearia.id);
          setSlug(barbearia.slug);

          // Redirecionamento baseado na função
          // <-- CORREÇÃO AQUI: Removido o `/${barbearia.slug}` do início
          if (profile.funcao === 'admin') router.push(`/admin/dashboard`);
          else if (profile.funcao === 'barbeiro') router.push(`/barbeiro/dashboard`);
          else router.push(`/cliente/dashboard`);
        } else {
          setError('Barbearia não encontrada para este perfil.');
          await supabase.auth.signOut();
        }
      } else {
        setError('Perfil não encontrado.');
        await supabase.auth.signOut();
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Aceder ao Painel</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href="cadastro" className="font-medium text-blue-600 hover:underline">
              Registe-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}