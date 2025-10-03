import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host');
  
  const mainDomain = 'localhost:3000'; // Em produção, mude para 'seusite.com'
  
  if (!host) {
    return new Response(null, { status: 400, statusText: 'Host header não encontrado' });
  }

  const subdomain = host.replace(`.${mainDomain}`, '');

  // Se for o domínio principal ou não tiver subdomínio, não fazemos nada.
  if (subdomain === host) {
    return NextResponse.next();
  }

  // --- NOVA LÓGICA ADICIONADA ---
  // Lista de rotas que pertencem ao app principal e NÃO devem ser reescritas
  const rootPaths = ['/login', '/cadastro', '/admin', '/barbeiro', '/cliente'];

  // Se a URL começar com uma dessas rotas, o middleware não faz nada e deixa a requisição passar.
  if (rootPaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }
  // --- FIM DA NOVA LÓGICA ---

  // Se não for uma rota do app principal, aplicamos a reescrita do subdomínio
  url.pathname = `/${subdomain}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}