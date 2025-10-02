// src/app/page.tsx
'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente da página inicial para a página de login
    router.push('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecionando para a página de login...</p>
    </div>
  );
}