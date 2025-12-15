import { NextResponse } from 'next/server'
import { removerCookieSessao } from '@/lib/auth'

export async function POST() {
  try {
    await removerCookieSessao()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no logout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
