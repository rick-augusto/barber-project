import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BarbeariaProvider } from "@/contexts/BarbeariaContext"; // 1. Importado

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Barber Project",
  description: "Sistema de agendamento para barbearias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* 2. O Provider agora envolve toda a aplicação */}
        <BarbeariaProvider>
          {children}
        </BarbeariaProvider>
      </body>
    </html>
  );
}