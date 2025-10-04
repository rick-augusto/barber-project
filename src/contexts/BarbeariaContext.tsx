// src/contexts/BarbeariaContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface BarbeariaContextType {
  barbeariaId: number | null;
  setBarbeariaId: Dispatch<SetStateAction<number | null>>;
  slug: string | null;
  setSlug: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean; // Adicionamos um estado de carregamento
}

const BarbeariaContext = createContext<BarbeariaContextType | undefined>(undefined);

export function BarbeariaProvider({ children }: { children: ReactNode }) {
  const [barbeariaId, setBarbeariaId] = useState<number | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Este efeito é acionado sempre que a URL muda ou a página é carregada
    const currentSlug = pathname.split('/')[1];

    // Se o slug da URL for válido e diferente do que já temos, busca os dados
    if (currentSlug && currentSlug !== slug) {
      setIsLoading(true);
      const fetchBarbearia = async () => {
        const { data, error } = await supabase
          .from('barbearias')
          .select('id, slug')
          .eq('slug', currentSlug)
          .single();

        if (data) {
          setBarbeariaId(data.id);
          setSlug(data.slug);
        } else {
          console.error("Barbearia não encontrada para o slug:", currentSlug);
          setBarbeariaId(null);
          setSlug(null);
        }
        setIsLoading(false); // Carregamento concluído
      };
      fetchBarbearia();
    } else if (!currentSlug || currentSlug === slug) {
        // Se não há slug ou ele já é o mesmo, não estamos a carregar
        setIsLoading(false);
    }
  }, [pathname, slug]);

  return (
    <BarbeariaContext.Provider value={{ barbeariaId, setBarbeariaId, slug, setSlug, isLoading }}>
      {children}
    </BarbeariaContext.Provider>
  );
}

export function useBarbearia() {
  const context = useContext(BarbeariaContext);
  if (context === undefined) {
    throw new Error('useBarbearia deve ser usado dentro de um BarbeariaProvider');
  }
  return context;
}