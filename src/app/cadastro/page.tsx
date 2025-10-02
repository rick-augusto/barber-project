// src/app/cadastro/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCadastro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Não foi possível criar o usuário.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('perfis').insert({
      id: authData.user.id,
      nome_completo: nome,
      funcao: 'cliente',
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    alert('Cadastro realizado com sucesso! Faça o login para continuar.');
    router.push('/login');
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Criar Conta</h1>
        <form onSubmit={handleCadastro} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}