// src/hooks/useProtectedRoute.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useBarbearia } from '@/contexts/BarbeariaContext';
import { User } from '@supabase/supabase-js';

export function useProtectedRoute(role: 'admin' | 'barbeiro' | 'cliente') {
  const router = useRouter();
  // Obtém o estado de carregamento do contexto
  const { barbeariaId, slug, isLoading: isContextLoading } = useBarbearia();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se o contexto ainda estiver a determinar qual é a barbearia, simplesmente espere.
    if (isContextLoading) {
      return;
    }

    // Agora que o contexto está pronto, podemos verificar se a barbearia foi encontrada.
    if (!barbeariaId || !slug) {
      alert('Barbearia não identificada. Redirecionando para a página inicial.');
      router.push('/');
      return;
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/${slug}/login`);
        return;
      }

      const { data: profile } = await supabase
        .from('perfis')
        .select('funcao, id_barbearia')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.funcao !== role || profile.id_barbearia !== barbeariaId) {
        alert('Acesso negado.');
        router.push(`/${slug}/login`);
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkUser();

  }, [isContextLoading, barbeariaId, slug, router, role]); // Depende do estado de carregamento do contexto

  // A página estará a carregar se o contexto OU a verificação do utilizador estiverem a carregar.
  return { user, loading: loading || isContextLoading };
}