'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Loader2
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

  const getCorDia = (dia: DiaCalendario) => {
    // Fim de semana
    if (dia.diaSemana === 0 || dia.diaSemana === 6) {
      return 'bg-gray-100 text-gray-400'
    }

    // Feriado
    if (dia.feriado) {
      return 'bg-gray-100 text-gray-400'
    }

    // Indisponível
    if (dia.indisponivel) {
      return 'bg-gray-100 text-gray-400'
    }

    // Ambos horários livres
    if (!dia.agendamentoManha && !dia.agendamentoTarde) {
      return 'bg-green-100 text-green-700 hover:bg-green-200'
    }

    // Um horário ocupado
    if (dia.agendamentoManha || dia.agendamentoTarde) {
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
    }

    // Ambos ocupados
    return 'bg-red-100 text-red-700'
  }

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-4">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={mesAnterior} size="sm">
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <h2 className="text-xl font-semibold text-gray-900">
          {getNomeMes(mes)} {ano}
        </h2>

        <Button variant="ghost" onClick={proximoMes} size="sm">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          <span className="text-gray-600">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
          <span className="text-gray-600">Parcial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
          <span className="text-gray-600">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
          <span className="text-gray-600">Indisponível</span>
        </div>
      </div>

      {/* Grid do Calendário */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 bg-gray-50">
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="p-2 text-center text-sm font-medium text-gray-600 border-b border-gray-200"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7">
            {dias.map((dia, index) => (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border-b border-r border-gray-200
                  ${!dia.mesAtual ? 'bg-gray-50' : getCorDia(dia)}
                  ${dia.mesAtual ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <div className="font-medium text-sm mb-1">
                  {dia.dia}
                </div>

                {dia.mesAtual && !dia.feriado && !dia.indisponivel && dia.diaSemana > 0 && dia.diaSemana < 6 && (
                  <div className="space-y-1">
                    {/* Slot manhã */}
                    <div className={`
                      flex items-center gap-1 text-xs rounded px-1.5 py-0.5
                      ${dia.agendamentoManha
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-200 text-green-800'
                      }
                    `}>
                      <Sun className="w-3 h-3" />
                      <span>09:15</span>
                    </div>

                    {/* Slot tarde */}
                    <div className={`
                      flex items-center gap-1 text-xs rounded px-1.5 py-0.5
                      ${dia.agendamentoTarde
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-200 text-green-800'
                      }
                    `}>
                      <Moon className="w-3 h-3" />
                      <span>15:00</span>
                    </div>
                  </div>
                )}

                {dia.feriado && (
                  <div className="text-xs text-gray-500 mt-1">
                    {dia.feriado.name}
                  </div>
                )}

                {dia.indisponivel && (
                  <div className="text-xs text-gray-500 mt-1">
                    Motorista indisponível
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
