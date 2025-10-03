// src/app/[slug]/layout.tsx

// Este layout envolve TODAS as páginas do subdomínio (pública, login, dashboards).
// Ele NÃO deve ter nenhuma lógica de autenticação.
// A verificação de login será feita individualmente em cada página de dashboard.

export default function BarbeariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este layout simplesmente renderiza as páginas filhas sem adicionar nenhuma camada de proteção.
  return <>{children}</>;
}