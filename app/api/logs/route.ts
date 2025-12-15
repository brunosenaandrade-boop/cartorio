import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Força rota dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limite = parseInt(searchParams.get('limite') || '50')

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('logs')
      .select(`
        *,
        agendamento:agendamentos(data, horario, escrevente_nome, endereco, cidade)
      `)
      .order('created_at', { ascending: false })
      .limit(limite)

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro ao listar logs:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar histórico' },
      { status: 500 }
    )
  }
}
