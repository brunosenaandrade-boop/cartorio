import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { z } from 'zod'

// Schema de validação
const concluirSchema = z.object({
  agendamento_id: z.string().uuid('ID do agendamento inválido'),
  valor: z.number().positive('Valor deve ser maior que zero')
})

// POST - Motorista conclui diligência e informa valor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados
    const validacao = concluirSchema.safeParse(body)
    if (!validacao.success) {
      return NextResponse.json(
        { success: false, error: validacao.error.errors[0].message },
        { status: 400 }
      )
    }

    const { agendamento_id, valor } = validacao.data
    const supabase = createServerClient()

    // Verificar se agendamento existe e está pendente
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

    // Verificar status
    if (agendamento.status === 'cancelado') {
      return NextResponse.json(
        { success: false, error: 'Este agendamento foi cancelado' },
        { status: 400 }
      )
    }

    if (agendamento.status === 'concluido') {
      return NextResponse.json(
        { success: false, error: 'Esta diligência já foi concluída' },
        { status: 400 }
      )
    }

    // Verificar se já existe recibo
    const { data: reciboExistente } = await supabase
      .from('recibos')
      .select('id')
      .eq('agendamento_id', agendamento_id)
      .single()

    if (reciboExistente) {
      return NextResponse.json(
        { success: false, error: 'Já existe um recibo para esta diligência' },
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
    const { data: recibo, error: insertError } = await supabase
      .from('recibos')
      .insert([{
        agendamento_id,
        valor
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // Criar log
    await supabase
      .from('logs')
      .insert([{
        acao: 'agendamento_concluido',
        escrevente_nome: agendamento.escrevente_nome,
        agendamento_id: agendamento.id,
        detalhes: `Diligência concluída. Valor: R$ ${valor.toFixed(2)}`
      }])

    return NextResponse.json({
      success: true,
      message: 'Diligência concluída com sucesso!',
      data: {
        agendamento: { ...agendamento, status: 'concluido' },
        recibo
      }
    })
  } catch (error) {
    console.error('Erro ao concluir diligência:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao concluir diligência' },
      { status: 500 }
    )
  }
}
