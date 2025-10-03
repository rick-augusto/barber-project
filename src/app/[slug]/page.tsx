'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useBarbearia } from '@/contexts/BarbeariaContext'

export default function LoginPage({ params }: { params: { slug: string } }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setBarbearia } = useBarbearia();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setBarbearia(null);

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
      const { data: profile } = await supabase
        .from('perfis')
        .select(`funcao, id_barbearia, barbearias ( id, nome, slug )`)
        .eq('id', loginData.user.id)
        .single();

      if (profile) {
        if (profile.barbearias) {
          setBarbearia(profile.barbearias as any);
        } else if (profile.id_barbearia) {
          const { data: barbeariaData } = await supabase.from('barbearias').select('id, nome, slug').eq('id', profile.id_barbearia).single();
          if (barbeariaData) setBarbearia(barbeariaData);
        }

        const redirectTo = localStorage.getItem('redirectTo');
        if (redirectTo) {
          localStorage.removeItem('redirectTo');
          router.push(redirectTo);
          return;
        } 
        
        if (profile.funcao === 'admin') router.push(`/${params.slug}/admin/dashboard`);
        else if (profile.funcao === 'barbeiro') router.push(`/${params.slug}/barbeiro/dashboard`);
        else router.push(`/${params.slug}/cliente/dashboard`);

      } else {
        setError('Perfil de usuário não encontrado.');
        await supabase.auth.signOut();
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Acessar Painel</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800" required />
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href={`/${params.slug}/cadastro`} className="font-medium text-blue-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}