import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development'
)

const COOKIE_NAME = 'cartorio-session'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso a rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Permitir acesso a arquivos estáticos
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Verificar sessão
  const sessionCookie = request.cookies.get(COOKIE_NAME)

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(sessionCookie.value, JWT_SECRET)
    return NextResponse.next()
  } catch {
    // Token inválido ou expirado
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
