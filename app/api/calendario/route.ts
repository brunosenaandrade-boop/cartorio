import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { buscarTodosFeriados } from '@/lib/feriados'
import { HORARIOS_DISPONIVEIS } from '@/lib/utils'

// Força rota dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Função para formatar data sem problemas de timezone
function formatarDataLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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

    // Usar formatação local para evitar problemas de timezone
    const dataInicio = formatarDataLocal(inicioCalendario)
    const dataFim = formatarDataLocal(fimCalendario)

    // Buscar indisponibilidades
    const { data: indisponibilidades } = await supabase
      .from('motorista_indisponibilidades')
      .select('*')
      .gte('data', dataInicio)
      .lte('data', dataFim)

    // Buscar agendamentos ativos
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'agendado')
      .gte('data', dataInicio)
      .lte('data', dataFim)

    if (agendamentosError) {
      console.error('ERRO Supabase:', agendamentosError)
    }

    // Montar array de dias
    const dias = []
    const dataAtual = new Date(inicioCalendario)

    while (dataAtual <= fimCalendario) {
      const dataStr = formatarDataLocal(dataAtual)

      const diaSemana = dataAtual.getDay()
      const mesAtual = dataAtual.getMonth() + 1 === mes

      // Encontrar feriado
      const feriado = feriados.find(f => f.date === dataStr)

      // Encontrar indisponibilidade
      const indisponivel = indisponibilidades?.find(i => i.data === dataStr)

      // Encontrar agendamentos do dia
      const agendamentosDoDia = agendamentos?.filter(a => a.data === dataStr) || []
      const horariosOcupados = agendamentosDoDia.map(a => a.horario)
      const horariosDisponiveis = HORARIOS_DISPONIVEIS.filter(h => !horariosOcupados.includes(h))

      dias.push({
        data: dataStr,
        dia: dataAtual.getDate(),
        mesAtual,
        diaSemana,
        feriado,
        indisponivel,
        agendamentosDoDia,
        horariosOcupados,
        horariosDisponiveis,
        totalSlots: HORARIOS_DISPONIVEIS.length,
        slotsDisponiveis: horariosDisponiveis.length
      })

      dataAtual.setDate(dataAtual.getDate() + 1)
    }

    const response = NextResponse.json({
      success: true,
      dias,
      feriados,
      indisponibilidades
    })

    // Desabilitar cache completamente
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Erro ao carregar calendário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar calendário' },
      { status: 500 }
    )
  }
}
