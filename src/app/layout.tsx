// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BarbeariaProvider } from "@/contexts/BarbeariaContext"; // Importe o provedor

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
        {/* O Provedor agora envolve toda a aplicação */}
        <BarbeariaProvider>
          {children}
        </BarbeariaProvider>
      </body>
    </html>
  );
}