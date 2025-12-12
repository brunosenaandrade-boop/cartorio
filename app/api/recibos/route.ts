import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { z } from 'zod'

// Schema de validação para criar recibo
const criarReciboSchema = z.object({
  agendamento_id: z.string().uuid('ID do agendamento inválido'),
  valor: z.number().positive('Valor deve ser maior que zero')
})

export async function GET() {
  try {
    const supabase = createServerClient()

    // Buscar recibos com agendamentos
    const { data: recibos, error: recibosError } = await supabase
      .from('recibos')
      .select(`
        *,
        agendamento:agendamentos(*)
      `)
      .order('created_at', { ascending: false })

    if (recibosError) throw recibosError

    // Buscar agendamentos concluídos sem recibo
    const { data: agendamentosConcluidos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'concluido')
      .order('data', { ascending: false })

    if (agendamentosError) throw agendamentosError

    // Filtrar agendamentos que não têm recibo
    const idsComRecibo = new Set(recibos?.map(r => r.agendamento_id) || [])
    const agendamentosSemRecibo = agendamentosConcluidos?.filter(
      a => !idsComRecibo.has(a.id)
    ) || []

    return NextResponse.json({
      success: true,
      recibos: recibos || [],
      agendamentosSemRecibo
    })
  } catch (error) {
    console.error('Erro ao listar recibos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar recibos' },
      { status: 500 }
    )
  }
}

// POST - Criar recibo (usado pelo motorista ao finalizar diligência)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados
    const validacao = criarReciboSchema.safeParse(body)
    if (!validacao.success) {
      return NextResponse.json(
        { success: false, error: validacao.error.errors[0].message },
        { status: 400 }
      )
    }

    const { agendamento_id, valor } = validacao.data
    const supabase = createServerClient()

    // Verificar se agendamento existe
    const { data: agendamento, error: fetchError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', agendamento_id)
      .single()

    if (fetchError || !agendamento) {
      return NextResponse.json(
        { success: false, error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já foi cancelado
    if (agendamento.status === 'cancelado') {
      return NextResponse.json(
        { success: false, error: 'Não é possível criar recibo para agendamento cancelado' },
        { status: 400 }
      )
    }

    // Verificar se já existe recibo para este agendamento
    const { data: reciboExistente } = await supabase
      .from('recibos')
      .select('id')
      .eq('agendamento_id', agendamento_id)
      .single()

    if (reciboExistente) {
      return NextResponse.json(
        { success: false, error: 'Já existe um recibo para este agendamento' },
        { status: 409 }
      )
    }

    // Atualizar status do agendamento para concluído
    const { error: updateError } = await supabase
      .from('agendamentos')
      .update({ status: 'concluido' })
      .eq('id', agendamento_id)

    if (updateError) throw updateError

    // Criar recibo
    const { data: novoRecibo, error: insertError } = await supabase
      .from('recibos')
      .insert([{
        agendamento_id,
        valor
      }])
      .select(`
        *,
        agendamento:agendamentos(*)
      `)
      .single()

    if (insertError) throw insertError

    return NextResponse.json(
      { success: true, data: novoRecibo },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar recibo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar recibo' },
      { status: 500 }
    )
  }
}
