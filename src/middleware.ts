// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host');
  
  // Assumindo que seu domínio principal será algo como 'meuapp.com'
  // Em desenvolvimento, será 'localhost:3000'
  const mainDomain = 'localhost:3000'; 
  
  // Extrai o subdomínio
  const subdomain = host?.replace(`.${mainDomain}`, '');

  // Se for o domínio principal ou não tiver subdomínio, não faz nada
  if (!subdomain || subdomain === host) {
    return NextResponse.next();
  }

  // Reescreve a URL para que a página possa identificar a barbearia
  // Ex: ze-barbearia.localhost:3000/agendar -> localhost:3000/ze-barbearia/agendar
  url.pathname = `/${subdomain}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}

export const config = {
  // Define quais rotas devem passar pelo middleware
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}