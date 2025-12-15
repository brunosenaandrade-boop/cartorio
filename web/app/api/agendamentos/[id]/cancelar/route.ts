import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { enviarEmailCancelamento } from '@/lib/resend'
import { notificarCancelamento } from '@/lib/push-notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { cancelled_by } = body

    const supabase = createServerClient()

    // Buscar agendamento
    const { data: agendamento, error: fetchError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !agendamento) {
      return NextResponse.json(
        { success: false, error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já está cancelado
    if (agendamento.status === 'cancelado') {
      return NextResponse.json(
        { success: false, error: 'Agendamento já está cancelado' },
        { status: 400 }
      )
    }

    // Verificar se já foi concluído
    if (agendamento.status === 'concluido') {
      return NextResponse.json(
        { success: false, error: 'Não é possível cancelar um agendamento concluído' },
        { status: 400 }
      )
    }

    // Verificar prazo de cancelamento
    const agora = new Date()
    const dataHorario = new Date(`${agendamento.data}T${agendamento.horario}:00`)

    // Limite: 30 minutos antes do horário
    const limiteMs = 30 * 60 * 1000
    const horarioLimite = new Date(dataHorario.getTime() - limiteMs)

    if (agora >= horarioLimite) {
      return NextResponse.json(
        { success: false, error: 'Prazo para cancelamento expirado' },
        { status: 400 }
      )
    }

    // Cancelar agendamento
    const { error: updateError } = await supabase
      .from('agendamentos')
      .update({
        status: 'cancelado',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelled_by || 'Sistema'
      })
      .eq('id', id)

    if (updateError) throw updateError

    // Criar log de cancelamento
    await supabase
      .from('logs')
      .insert([{
        acao: 'agendamento_cancelado',
        escrevente_nome: agendamento.escrevente_nome,
        agendamento_id: agendamento.id,
        detalhes: `Cancelado por: ${cancelled_by || 'Sistema'}`
      }])

    // Enviar email de cancelamento (não bloqueia a resposta)
    enviarEmailCancelamento(agendamento, cancelled_by).catch(console.error)

    // Enviar push notification para o motorista (não bloqueia a resposta)
    notificarCancelamento(agendamento).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao cancelar agendamento' },
      { status: 500 }
    )
  }
}
