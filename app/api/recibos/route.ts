import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

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
