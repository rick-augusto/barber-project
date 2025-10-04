// src/app/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { useBarbearia } from '@/contexts/BarbeariaContext';

type Barbearia = {
  id: number;
  nome: string;
  slug: string;
};

export default function PaginaDaBarbearia() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { setBarbeariaId, setSlug } = useBarbearia();
  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDadosDaBarbearia = async () => {
      if (!slug) {
        setLoading(false);
        setError('Slug da barbearia não encontrado na URL.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('barbearias')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError || !data) {
        setError('Barbearia não encontrada.');
      } else {
        setBarbearia(data);
        if (setBarbeariaId) setBarbeariaId(data.id);
        if (setSlug) setSlug(data.slug);
      }
      setLoading(false);
    };

    fetchDadosDaBarbearia();
  }, [slug, setBarbeariaId, setSlug]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white"><p>Carregando...</p></div>;
  if (error || !barbearia) return <div className="flex h-screen items-center justify-center bg-gray-100 text-red-500"><p>{error}</p></div>;

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-white dark:bg-black">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center">
        
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">{barbearia.nome}</h1>

        <p className="text-lg text-gray-600 dark:text-gray-300">
          Bem-vindo ao nosso sistema de agendamento.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          {/* --- CORREÇÃO AQUI --- */}
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium h-12 px-6 text-base"
            href="/login" // Caminho simplificado
          >
            Fazer Login
          </Link>
          {/* --- CORREÇÃO AQUI --- */}
          <Link
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] h-12 px-6 text-base"
            href="/agendar/servico" // Caminho simplificado
          >
            Agendar Horário
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <span className="text-sm text-gray-500">Powered by</span>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logomark"
            width={90}
            height={19}
          />
        </a>
      </footer>
    </div>
  );
}