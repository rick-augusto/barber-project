'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useBarbearia } from '@/contexts/BarbeariaContext' // Importado

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setBarbearia } = useBarbearia(); // Pegamos a função do contexto

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setBarbearia(null); // Limpa a barbearia anterior

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
      // Busca o perfil e os dados da barbearia associada
      const { data: profile } = await supabase
        .from('perfis')
        .select(`
          funcao,
          barbearias ( id, nome, slug )
        `)
        .eq('id', loginData.user.id)
        .single();

      if (profile) {
        // Salva os dados da barbearia no contexto global
        if (profile.barbearias) {
          setBarbearia(profile.barbearias as any);
        }

        // Redireciona com base na função
        if (profile.funcao === 'admin') router.push('/admin/dashboard');
        else if (profile.funcao === 'barbeiro') router.push('/barbeiro/dashboard');
        else router.push('/cliente/dashboard');
      } else {
        setError('Perfil de usuário não encontrado.');
        await supabase.auth.signOut();
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Acessar Painel</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm" required />
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="font-medium text-blue-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}