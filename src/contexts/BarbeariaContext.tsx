'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Tipagem para os dados da barbearia que vamos guardar
type Barbearia = {
  id: number;
  nome: string;
  slug?: string; // Slug para o subdomínio
};

// Tipagem para o valor do nosso contexto
type BarbeariaContextType = {
  barbearia: Barbearia | null;
  setBarbearia: (barbearia: Barbearia | null) => void;
  isLoading: boolean;
};

// Cria o contexto
const BarbeariaContext = createContext<BarbeariaContextType | undefined>(undefined);

// Cria o "Provedor" do contexto
export function BarbeariaProvider({ children }: { children: ReactNode }) {
  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para carregar dados do localStorage, se existirem, para persistir a sessão da barbearia
  useEffect(() => {
    try {
      const storedBarbearia = localStorage.getItem('barbearia');
      if (storedBarbearia) {
        setBarbearia(JSON.parse(storedBarbearia));
      }
    } catch (error) {
      console.error("Falha ao carregar barbearia do localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetBarbearia = (novaBarbearia: Barbearia | null) => {
    setBarbearia(novaBarbearia);
    if (novaBarbearia) {
      localStorage.setItem('barbearia', JSON.stringify(novaBarbearia));
    } else {
      localStorage.removeItem('barbearia');
    }
  };

  return (
    <BarbeariaContext.Provider value={{ barbearia, setBarbearia: handleSetBarbearia, isLoading }}>
      {children}
    </BarbeariaContext.Provider>
  );
}

// Cria um "Hook" customizado para facilitar o uso do contexto
export function useBarbearia() {
  const context = useContext(BarbeariaContext);
  if (context === undefined) {
    throw new Error('useBarbearia deve ser usado dentro de um BarbeariaProvider');
  }
  return context;
}