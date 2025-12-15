import { NextRequest, NextResponse } from 'next/server'
import { verificarSenha, criarSessao, definirCookieSessao } from '@/lib/auth'

// Rate limiting simples em memória
const tentativas = new Map<string, { count: number; timestamp: number }>()

const LIMITE_TENTATIVAS = 10
const JANELA_MINUTOS = 5

function verificarRateLimit(ip: string): boolean {
  const agora = Date.now()
  const registro = tentativas.get(ip)

  if (!registro) {
    tentativas.set(ip, { count: 1, timestamp: agora })
    return true
  }

  // Resetar se passou o tempo da janela
  if (agora - registro.timestamp > JANELA_MINUTOS * 60 * 1000) {
    tentativas.set(ip, { count: 1, timestamp: agora })
    return true
  }

  // Incrementar contador
  registro.count++

  return registro.count <= LIMITE_TENTATIVAS
}

export async function POST(request: NextRequest) {
  try {
    // Obter IP para rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Verificar rate limit
    if (!verificarRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde um minuto.' },
        { status: 429 }
      )
    }

    const { senha } = await request.json()

    if (!senha) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar senha
    const senhaValida = await verificarSenha(senha)

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      )
    }

    // Criar sessão
    const token = await criarSessao()

    // Definir cookie
    await definirCookieSessao(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
