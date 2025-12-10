import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { buscarTodosFeriados } from '@/lib/feriados'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ano = parseInt(searchParams.get('ano') || new Date().getFullYear().toString())
    const mes = parseInt(searchParams.get('mes') || (new Date().getMonth() + 1).toString())

    const supabase = createServerClient()

    // Calcular primeiro e último dia do mês
    const primeiroDia = new Date(ano, mes - 1, 1)
    const ultimoDia = new Date(ano, mes, 0)

    // Ajustar para incluir dias do mês anterior/próximo para completar semanas
    const inicioCalendario = new Date(primeiroDia)
    inicioCalendario.setDate(inicioCalendario.getDate() - primeiroDia.getDay())

    const fimCalendario = new Date(ultimoDia)
    const diasRestantes = 6 - ultimoDia.getDay()
    fimCalendario.setDate(fimCalendario.getDate() + diasRestantes)

    // Buscar feriados
    const feriados = await buscarTodosFeriados(ano)

    // Buscar indisponibilidades
    const { data: indisponibilidades } = await supabase
      .from('motorista_indisponibilidades')
      .select('*')
      .gte('data', inicioCalendario.toISOString().split('T')[0])
      .lte('data', fimCalendario.toISOString().split('T')[0])

    // Buscar agendamentos do mês
    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select('*')
      .gte('data', inicioCalendario.toISOString().split('T')[0])
      .lte('data', fimCalendario.toISOString().split('T')[0])
      .eq('status', 'agendado')

    // Montar array de dias
    const dias = []
    const dataAtual = new Date(inicioCalendario)

    while (dataAtual <= fimCalendario) {
      const dataStr = dataAtual.toISOString().split('T')[0]
      const diaSemana = dataAtual.getDay()
      const mesAtual = dataAtual.getMonth() + 1 === mes

      // Encontrar feriado
      const feriado = feriados.find(f => f.date === dataStr)

      // Encontrar indisponibilidade
      const indisponivel = indisponibilidades?.find(i => i.data === dataStr)

      // Encontrar agendamentos
      const agendamentoManha = agendamentos?.find(
        a => a.data === dataStr && a.horario === '09:15'
      )
      const agendamentoTarde = agendamentos?.find(
        a => a.data === dataStr && a.horario === '15:00'
      )

      dias.push({
        data: dataStr,
        dia: dataAtual.getDate(),
        mesAtual,
        diaSemana,
        feriado,
        indisponivel,
        agendamentoManha,
        agendamentoTarde
      })

      dataAtual.setDate(dataAtual.getDate() + 1)
    }

    return NextResponse.json({
      success: true,
      dias,
      feriados,
      indisponibilidades
    })
  } catch (error) {
    console.error('Erro ao carregar calendário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar calendário' },
      { status: 500 }
    )
  }
}
