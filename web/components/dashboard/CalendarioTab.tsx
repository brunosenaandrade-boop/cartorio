'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Loader2,
  Calendar,
  Clock,
  Ban,
  CheckCircle2,
  AlertCircle,
  PartyPopper,
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui'
import { DiaDetalheModal } from './DiaDetalheModal'
import { getNomeMes, formatarData, HORARIOS_MANHA, HORARIOS_TARDE, HORARIOS_DISPONIVEIS, getPeriodo } from '@/lib/utils'
import { Agendamento, MotoristaIndisponibilidade, Feriado } from '@/types'

interface DiaCalendario {
  data: string
  dia: number
  mesAtual: boolean
  diaSemana: number
  agendamentosDoDia: Agendamento[]
  horariosOcupados: string[]
  horariosDisponiveis: string[]
  totalSlots: number
  slotsDisponiveis: number
  feriado?: Feriado
  indisponivel?: MotoristaIndisponibilidade
}

export function CalendarioTab() {
  const router = useRouter()
  const [mesAtual, setMesAtual] = useState(new Date())
  const [dias, setDias] = useState<DiaCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [diaModal, setDiaModal] = useState<DiaCalendario | null>(null)
  const [hoveredDia, setHoveredDia] = useState<string | null>(null)

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()

  // Data de hoje para comparação (sem hora)
  const hoje = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const hojeString = useMemo(() => {
    return hoje.toISOString().split('T')[0]
  }, [hoje])

  useEffect(() => {
    carregarCalendario()
  }, [ano, mes])

  const carregarCalendario = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calendario?ano=${ano}&mes=${mes + 1}`)
      const data = await response.json()

      if (data.success) {
        setDias(data.dias)
      }
    } catch (error) {
      console.error('Erro ao carregar calendário:', error)
    } finally {
      setLoading(false)
    }
  }

  const mesAnterior = () => {
    setMesAtual(new Date(ano, mes - 1, 1))
  }

  const proximoMes = () => {
    setMesAtual(new Date(ano, mes + 1, 1))
  }

  // Verifica se a data já passou
  const isDataPassada = (dataString: string) => {
    const data = new Date(dataString + 'T00:00:00')
    return data < hoje
  }

  // Verifica se é hoje
  const isHoje = (dataString: string) => {
    return dataString === hojeString
  }

  // Verifica se um horário específico já passou (para o dia de hoje)
  const isHorarioPassado = (dataString: string, horario: string) => {
    // Se não é hoje, retorna false (não passou)
    if (dataString !== hojeString) return false

    // Pegar hora atual
    const agora = new Date()
    const horaAtual = agora.getHours()
    const minutoAtual = agora.getMinutes()

    // Converter horário do slot para números (ex: "09:15" -> 9, 15)
    const [horaSlot, minutoSlot] = horario.split(':').map(Number)

    // Comparar: se hora atual > hora do slot, ou se mesma hora mas minuto atual >= minuto do slot
    if (horaAtual > horaSlot) return true
    if (horaAtual === horaSlot && minutoAtual >= minutoSlot) return true

    return false
  }

  // Retorna array de horários que já passaram para hoje
  const getHorariosPassados = (dataString: string): string[] => {
    if (dataString !== hojeString) return []
    return HORARIOS_DISPONIVEIS.filter(h => isHorarioPassado(dataString, h))
  }

  // Calcula slots disponíveis considerando horários que já passaram (para hoje)
  const getSlotsDisponiveis = (dia: DiaCalendario): number => {
    if (!dia.mesAtual || dia.feriado || dia.indisponivel || dia.diaSemana === 0 || dia.diaSemana === 6) {
      return 0
    }
    if (isDataPassada(dia.data)) {
      return 0
    }

    // Filtrar horários disponíveis que ainda não passaram
    const horariosAindaDisponiveis = dia.horariosDisponiveis.filter(
      horario => !isHorarioPassado(dia.data, horario)
    )
    return horariosAindaDisponiveis.length
  }

  // Encontrar próximo slot disponível global
  const proximoDisponivel = useMemo(() => {
    for (const dia of dias) {
      if (!dia.mesAtual) continue
      if (isDataPassada(dia.data)) continue
      if (dia.feriado || dia.indisponivel) continue
      if (dia.diaSemana === 0 || dia.diaSemana === 6) continue

      const horariosPassados = getHorariosPassados(dia.data)
      const disponiveis = dia.horariosDisponiveis.filter(h => !horariosPassados.includes(h))

      if (disponiveis.length > 0) {
        return {
          data: dia.data,
          horario: disponiveis[0],
          dia: dia
        }
      }
    }
    return null
  }, [dias, hojeString])

  const handleProximoDisponivel = () => {
    if (proximoDisponivel) {
      router.push(`/dashboard/novo?data=${proximoDisponivel.data}&horario=${proximoDisponivel.horario}`)
    }
  }

  const getCorDia = (dia: DiaCalendario) => {
    // Data passada - sempre cinza escuro
    if (dia.mesAtual && isDataPassada(dia.data)) {
      return 'bg-gray-200/80 text-gray-400'
    }

    // Fim de semana
    if (dia.diaSemana === 0 || dia.diaSemana === 6) {
      return 'bg-gray-50 text-gray-400'
    }

    // Feriado
    if (dia.feriado) {
      return 'bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all cursor-pointer'
    }

    // Indisponível (motorista)
    if (dia.indisponivel) {
      return 'bg-gray-100 text-gray-500 hover:bg-gray-150 transition-all cursor-pointer'
    }

    const slotsLivres = getSlotsDisponiveis(dia)
    const totalSlots = dia.totalSlots || HORARIOS_DISPONIVEIS.length

    // Todos os slots livres = DISPONÍVEL (verde)
    if (slotsLivres === totalSlots) {
      return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer'
    }

    // Nenhum slot livre = LOTADO (vermelho)
    if (slotsLivres === 0) {
      return 'bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer'
    }

    // Alguns slots livres = PARCIAL (amarelo/laranja)
    return 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer'
  }

  const getStatusDia = (dia: DiaCalendario): { label: string; slots: number } => {
    if (!dia.mesAtual || dia.feriado || dia.indisponivel || dia.diaSemana === 0 || dia.diaSemana === 6) {
      return { label: '', slots: 0 }
    }

    if (isDataPassada(dia.data)) {
      return { label: '', slots: 0 }
    }

    const slotsLivres = getSlotsDisponiveis(dia)
    return {
      label: slotsLivres > 0 ? `${slotsLivres} vaga${slotsLivres > 1 ? 's' : ''}` : 'Lotado',
      slots: slotsLivres
    }
  }

  const handleDiaClick = (dia: DiaCalendario) => {
    if (!dia.mesAtual) return
    setDiaModal(dia)
  }

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-6">
      {/* Header do Calendário - Modernizado */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-4 shadow-lg">
        <Button
          variant="ghost"
          onClick={mesAnterior}
          size="sm"
          className="text-white hover:bg-white/20 rounded-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-white/80" />
          <h2 className="text-2xl font-bold text-white">
            {getNomeMes(mes)} {ano}
          </h2>
        </div>

        <Button
          variant="ghost"
          onClick={proximoMes}
          size="sm"
          className="text-white hover:bg-white/20 rounded-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Botão Próximo Disponível - DESTAQUE */}
      {proximoDisponivel && !loading && (
        <button
          onClick={handleProximoDisponivel}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white/80 text-sm font-medium">Agendamento Rápido</p>
                <p className="text-white text-xl font-bold">
                  {formatarData(proximoDisponivel.data)} às {proximoDisponivel.horario}
                </p>
                <p className="text-white/70 text-sm">
                  {getPeriodo(proximoDisponivel.horario)} - Próximo horário disponível
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm font-medium hidden sm:block">Agendar agora</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </button>
      )}

      {/* Legenda Melhorada */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Disponível</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">Parcial</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200">
          <Ban className="w-4 h-4 text-rose-600" />
          <span className="text-sm font-medium text-rose-700">Lotado</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
          <PartyPopper className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Feriado</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Passado/Indisponível</span>
        </div>
      </div>

      {/* Dica de interação */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
        <Sparkles className="w-4 h-4 text-primary-500" />
        <span>Clique em um dia para ver horários disponíveis e agendar</span>
      </div>

      {/* Grid do Calendário */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-3" />
          <span className="text-gray-500">Carregando calendário...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100">
            {diasSemana.map((dia, index) => (
              <div
                key={dia}
                className={`
                  p-3 text-center text-sm font-semibold border-b border-gray-200
                  ${index === 0 || index === 6 ? 'text-gray-400' : 'text-gray-700'}
                `}
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7">
            {dias.map((dia, index) => {
              const eHoje = dia.mesAtual && isHoje(dia.data)
              const passado = dia.mesAtual && isDataPassada(dia.data)
              const status = getStatusDia(dia)
              const ehDiaUtil = dia.diaSemana > 0 && dia.diaSemana < 6
              const isHovered = hoveredDia === dia.data
              const isClickable = dia.mesAtual

              return (
                <div
                  key={index}
                  onClick={() => handleDiaClick(dia)}
                  onMouseEnter={() => dia.mesAtual && setHoveredDia(dia.data)}
                  onMouseLeave={() => setHoveredDia(null)}
                  className={`
                    relative min-h-[110px] p-2 border-b border-r border-gray-100
                    ${!dia.mesAtual ? 'bg-gray-50/50' : getCorDia(dia)}
                    ${eHoje ? 'ring-2 ring-primary-500 ring-inset z-10' : ''}
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {/* Número do dia */}
                  <div className={`
                    flex items-center justify-between mb-2
                  `}>
                    <span className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold
                      ${eHoje ? 'bg-primary-500 text-white shadow-md' : ''}
                      ${!dia.mesAtual ? 'text-gray-300' : ''}
                    `}>
                      {dia.dia}
                    </span>

                    {/* Badge de vagas */}
                    {status.slots > 0 && !passado && (
                      <span className={`
                        text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-transform
                        ${status.slots === HORARIOS_DISPONIVEIS.length ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}
                        ${isHovered ? 'scale-110' : ''}
                      `}>
                        {status.slots}
                      </span>
                    )}
                  </div>

                  {/* Resumo de slots - Apenas para dias futuros úteis */}
                  {dia.mesAtual && !passado && !dia.feriado && !dia.indisponivel && ehDiaUtil && (
                    <div className="space-y-1">
                      {/* Slots manhã */}
                      {(() => {
                        const slotsManha = HORARIOS_MANHA.filter(
                          h => !dia.horariosOcupados.includes(h) && !isHorarioPassado(dia.data, h)
                        ).length
                        const totalManha = HORARIOS_MANHA.length
                        return (
                          <div className={`
                            flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 font-medium
                            ${slotsManha === 0
                              ? 'bg-rose-100/80 text-rose-600'
                              : slotsManha === totalManha
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }
                          `}>
                            <Sun className="w-3 h-3" />
                            <span>{slotsManha}/{totalManha}</span>
                          </div>
                        )
                      })()}

                      {/* Slots tarde */}
                      {(() => {
                        const slotsTarde = HORARIOS_TARDE.filter(
                          h => !dia.horariosOcupados.includes(h) && !isHorarioPassado(dia.data, h)
                        ).length
                        const totalTarde = HORARIOS_TARDE.length
                        return (
                          <div className={`
                            flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 font-medium
                            ${slotsTarde === 0
                              ? 'bg-rose-100/80 text-rose-600'
                              : slotsTarde === totalTarde
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }
                          `}>
                            <Moon className="w-3 h-3" />
                            <span>{slotsTarde}/{totalTarde}</span>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Badge de feriado */}
                  {dia.feriado && dia.mesAtual && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">
                        <PartyPopper className="w-3 h-3" />
                        {dia.feriado.name}
                      </span>
                    </div>
                  )}

                  {/* Indicador de indisponível */}
                  {dia.indisponivel && dia.mesAtual && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-lg">
                        <Ban className="w-3 h-3" />
                        Indisponível
                      </span>
                    </div>
                  )}

                  {/* Indicador de passado */}
                  {passado && ehDiaUtil && !dia.feriado && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-[1px] bg-gray-300 rotate-[-20deg]" />
                    </div>
                  )}

                  {/* Indicador visual de hover */}
                  {isHovered && dia.mesAtual && !passado && ehDiaUtil && !dia.feriado && !dia.indisponivel && (
                    <div className="absolute inset-0 bg-primary-500/5 rounded-lg pointer-events-none" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Indicador de Hoje */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
        <span>Hoje: {formatarData(hojeString)}</span>
      </div>

      {/* Modal de detalhes do dia */}
      {diaModal && (
        <DiaDetalheModal
          isOpen={!!diaModal}
          onClose={() => setDiaModal(null)}
          data={diaModal.data}
          dia={diaModal.dia}
          diaSemana={diaModal.diaSemana}
          horariosOcupados={diaModal.horariosOcupados}
          horariosDisponiveis={diaModal.horariosDisponiveis}
          feriado={diaModal.feriado}
          indisponivel={diaModal.indisponivel}
          isPassado={isDataPassada(diaModal.data)}
          isHoje={isHoje(diaModal.data)}
          horariosPassados={getHorariosPassados(diaModal.data)}
        />
      )}
    </div>
  )
}
