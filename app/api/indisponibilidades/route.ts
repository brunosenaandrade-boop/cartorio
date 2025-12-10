import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET - Listar indisponibilidades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')

    const supabase = createServerClient()

    let query = supabase
      .from('motorista_indisponibilidades')
      .select('*')
      .order('data', { ascending: true })

    if (dataInicio) {
      query = query.gte('data', dataInicio)
    }

    if (dataFim) {
      query = query.lte('data', dataFim)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro ao listar indisponibilidades:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar indisponibilidades' },
      { status: 500 }
    )
  }
}

// POST - Criar indisponibilidade
export async function POST(request: NextRequest) {
  try {
    const { data, motivo } = await request.json()

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Data é obrigatória' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Verificar se já existe agendamento para esta data
    const { data: agendamentoExistente } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data', data)
      .eq('status', 'agendado')
      .limit(1)

    if (agendamentoExistente && agendamentoExistente.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Já existem agendamentos para esta data' },
        { status: 409 }
      )
    }

    const { data: novaIndisponibilidade, error } = await supabase
      .from('motorista_indisponibilidades')
      .insert([{ data, motivo }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Esta data já está marcada como indisponível' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json(
      { success: true, data: novaIndisponibilidade },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar indisponibilidade:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar indisponibilidade' },
      { status: 500 }
    )
  }
}
