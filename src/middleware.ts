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

  // Se for o domínio principal ou um asset (ex: .css, .png), não faz nada.
  if (subdomain === host || url.pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Reescreve a URL para /<subdomain>/<path>
  // Ex: nossabarbearia.localhost:3000/ -> localhost:3000/nossabarbearia/
  url.pathname = `/${subdomain}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}