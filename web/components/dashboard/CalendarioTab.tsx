'use client'

import { useState, useEffect, useMemo } from 'react'
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
  PartyPopper
} from 'lucide-react'
import { Button } from '@/components/ui'
import { getNomeMes, formatarData } from '@/lib/utils'
import { Agendamento, MotoristaIndisponibilidade, Feriado } from '@/types'

interface DiaCalendario {
  data: string
  dia: number
  mesAtual: boolean
  diaSemana: number
  agendamentoManha?: Agendamento
  agendamentoTarde?: Agendamento
  feriado?: Feriado
  indisponivel?: MotoristaIndisponibilidade
}

export function CalendarioTab() {
  const [mesAtual, setMesAtual] = useState(new Date())
  const [dias, setDias] = useState<DiaCalendario[]>([])
  const [loading, setLoading] = useState(true)

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
        // Debug: verificar se agendamentos estão vindo
        const diasComAgendamento = data.dias.filter((d: DiaCalendario) => d.agendamentoManha || d.agendamentoTarde)
        console.log('Dias com agendamento:', diasComAgendamento.length)
        diasComAgendamento.forEach((d: DiaCalendario) => {
          console.log(`Dia ${d.data}: manhã=${!!d.agendamentoManha}, tarde=${!!d.agendamentoTarde}`)
        })
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
      return 'bg-purple-50 text-purple-600'
    }

    // Indisponível (motorista)
    if (dia.indisponivel) {
      return 'bg-gray-100 text-gray-500'
    }

    // Verificar se horários já passaram (para hoje)
    const manhaPassou = isHorarioPassado(dia.data, '09:15')
    const tardePassou = isHorarioPassado(dia.data, '15:00')

    // Slot ocupado = tem agendamento OU já passou
    const manhaOcupada = dia.agendamentoManha || manhaPassou
    const tardeOcupada = dia.agendamentoTarde || tardePassou

    // Ambos horários livres = DISPONÍVEL (verde)
    if (!manhaOcupada && !tardeOcupada) {
      return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-md transition-all'
    }

    // Ambos horários ocupados = OCUPADO (vermelho)
    if (manhaOcupada && tardeOcupada) {
      return 'bg-rose-50 text-rose-700'
    }

    // Apenas um horário ocupado = PARCIAL (amarelo/laranja)
    return 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-md transition-all'
  }

  const getStatusDia = (dia: DiaCalendario): { label: string; slots: number } => {
    if (!dia.mesAtual || dia.feriado || dia.indisponivel || dia.diaSemana === 0 || dia.diaSemana === 6) {
      return { label: '', slots: 0 }
    }

    if (isDataPassada(dia.data)) {
      return { label: '', slots: 0 }
    }

    // Verificar se horários já passaram (para hoje)
    const manhaPassou = isHorarioPassado(dia.data, '09:15')
    const tardePassou = isHorarioPassado(dia.data, '15:00')

    // Slot só está livre se não tem agendamento E não passou
    const manhaLivre = !dia.agendamentoManha && !manhaPassou
    const tardeLivre = !dia.agendamentoTarde && !tardePassou

    const slotsLivres = (manhaLivre ? 1 : 0) + (tardeLivre ? 1 : 0)
    return { label: slotsLivres > 0 ? `${slotsLivres} vaga${slotsLivres > 1 ? 's' : ''}` : 'Lotado', slots: slotsLivres }
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

              return (
                <div
                  key={index}
                  className={`
                    relative min-h-[110px] p-2 border-b border-r border-gray-100
                    ${!dia.mesAtual ? 'bg-gray-50/50' : getCorDia(dia)}
                    ${dia.mesAtual && !passado && ehDiaUtil && !dia.feriado && !dia.indisponivel ? 'cursor-pointer' : 'cursor-default'}
                    ${eHoje ? 'ring-2 ring-primary-500 ring-inset z-10' : ''}
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
                        text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        ${status.slots === 2 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}
                      `}>
                        {status.slots}
                      </span>
                    )}
                  </div>

                  {/* Slots de horário - Apenas para dias futuros úteis */}
                  {dia.mesAtual && !passado && !dia.feriado && !dia.indisponivel && ehDiaUtil && (
                    <div className="space-y-1.5">
                      {/* Slot manhã */}
                      {(() => {
                        const manhaPassou = isHorarioPassado(dia.data, '09:15')
                        const manhaOcupada = dia.agendamentoManha || manhaPassou
                        return (
                          <div className={`
                            flex items-center gap-1.5 text-xs rounded-lg px-2 py-1 font-medium
                            transition-all duration-200
                            ${manhaOcupada
                              ? 'bg-rose-100/80 text-rose-700 line-through opacity-60'
                              : 'bg-emerald-100 text-emerald-700 shadow-sm'
                            }
                          `}>
                            <Sun className="w-3.5 h-3.5" />
                            <span>09:15</span>
                            {!manhaOcupada && (
                              <CheckCircle2 className="w-3 h-3 ml-auto" />
                            )}
                          </div>
                        )
                      })()}

                      {/* Slot tarde */}
                      {(() => {
                        const tardePassou = isHorarioPassado(dia.data, '15:00')
                        const tardeOcupada = dia.agendamentoTarde || tardePassou
                        return (
                          <div className={`
                            flex items-center gap-1.5 text-xs rounded-lg px-2 py-1 font-medium
                            transition-all duration-200
                            ${tardeOcupada
                              ? 'bg-rose-100/80 text-rose-700 line-through opacity-60'
                              : 'bg-emerald-100 text-emerald-700 shadow-sm'
                            }
                          `}>
                            <Moon className="w-3.5 h-3.5" />
                            <span>15:00</span>
                            {!tardeOcupada && (
                              <CheckCircle2 className="w-3 h-3 ml-auto" />
                            )}
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
    </div>
  )
}
