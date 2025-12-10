import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development'
)

const COOKIE_NAME = 'cartorio-session'

// Hash da senha padrão "123" - em produção, usar variável de ambiente
const DEFAULT_PASSWORD_HASH = process.env.AUTH_PASSWORD_HASH ||
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' // hash de "123"

export interface SessionPayload {
  authenticated: boolean
  exp: number
}

// Verificar senha
export async function verificarSenha(senha: string): Promise<boolean> {
  return bcrypt.compare(senha, DEFAULT_PASSWORD_HASH)
}

// Criar sessão JWT
export async function criarSessao(): Promise<string> {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

// Verificar sessão JWT
export async function verificarSessao(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as SessionPayload
  } catch {
    return null
  }
}

// Obter sessão dos cookies
export async function obterSessao(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  return verificarSessao(sessionCookie.value)
}

// Definir cookie de sessão
export async function definirCookieSessao(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    // Expira quando o browser fechar (session cookie)
  })
}

// Remover cookie de sessão
export async function removerCookieSessao(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Gerar hash de senha (utility para criar novo hash)
export async function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10)
}
