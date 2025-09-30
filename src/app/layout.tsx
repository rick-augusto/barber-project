import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'; // 1. Importe a fonte do pacote correto
import "./globals.css";

export const metadata: Metadata = {
  title: "Barber Project", // Você pode alterar o título aqui
  description: "Sistema de agendamento para barbearias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      {/* 2. Aplique a classe da fonte ao corpo da página */}
      <body className={GeistSans.className}>
        {children}
      </body>
    </html>
  );
}