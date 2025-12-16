'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  PartyPopper,
  Ban,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react'
import { Button, TimeSlotPicker } from '@/components/ui'
import { formatarData, HORARIOS_MANHA, HORARIOS_TARDE, HORARIOS_DISPONIVEIS, getPeriodo } from '@/lib/utils'
import { Feriado, MotoristaIndisponibilidade } from '@/types'

interface DiaDetalheModalProps {
  isOpen: boolean
  onClose: () => void
  data: string
  dia: number
  diaSemana: number
  horariosOcupados: string[]
  horariosDisponiveis: string[]
  feriado?: Feriado
  indisponivel?: MotoristaIndisponibilidade
  isPassado: boolean
  isHoje: boolean
  horariosPassados?: string[]
}

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export function DiaDetalheModal({
  isOpen,
  onClose,
  data,
  dia,
  diaSemana,
  horariosOcupados,
  horariosDisponiveis,
  feriado,
  indisponivel,
  isPassado,
  isHoje,
  horariosPassados = []
}: DiaDetalheModalProps) {
  const router = useRouter()
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>('')
  const [animating, setAnimating] = useState(false)

  if (!isOpen) return null

  // Combinar horários ocupados com horários que já passaram (para hoje)
  const todosIndisponiveis = Array.from(new Set([...horariosOcupados, ...horariosPassados]))

  // Horários realmente disponíveis
  const horariosRealmenteDisponiveis = HORARIOS_DISPONIVEIS.filter(
    h => !todosIndisponiveis.includes(h)
  )

  const manhaDisponiveis = HORARIOS_MANHA.filter(h => !todosIndisponiveis.includes(h))
  const tardeDisponiveis = HORARIOS_TARDE.filter(h => !todosIndisponiveis.includes(h))

  const ehFimDeSemana = diaSemana === 0 || diaSemana === 6
  const ehIndisponivel = !!indisponivel || !!feriado || ehFimDeSemana || isPassado

  // Primeiro horário disponível
  const primeiroDisponivel = horariosRealmenteDisponiveis[0]

  const handleAgendar = () => {
    if (!horarioSelecionado) return

    setAnimating(true)

    // Navegar para página de novo agendamento com data e horário pré-selecionados
    setTimeout(() => {
      router.push(`/dashboard/novo?data=${data}&horario=${horarioSelecionado}`)
    }, 300)
  }

  const handleAgendarRapido = () => {
    if (!primeiroDisponivel) return
    setHorarioSelecionado(primeiroDisponivel)
  }

  return (
    <>
      {/* Backdrop com blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`
            w-full max-w-lg bg-white rounded-3xl shadow-2xl
            transform transition-all duration-300 ease-out
            ${animating ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-slide-up'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Colorido */}
          <div className={`
            relative px-6 py-5 rounded-t-3xl
            ${ehIndisponivel
              ? 'bg-gradient-to-r from-gray-400 to-gray-500'
              : horariosRealmenteDisponiveis.length === 0
                ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                : horariosRealmenteDisponiveis.length === HORARIOS_DISPONIVEIS.length
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600'
            }
          `}>
            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Data grande */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg">
                <span className="text-3xl font-bold text-gray-800">{dia}</span>
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {DIAS_SEMANA[diaSemana].slice(0, 3)}
                </span>
              </div>

              <div className="flex-1 pt-2">
                <h2 className="text-xl font-bold text-white">
                  {DIAS_SEMANA[diaSemana]}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {formatarData(data)}
                </p>

                {/* Badge de status */}
                {isHoje && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                    <Sparkles className="w-3 h-3" />
                    Hoje
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {/* Mensagens de status especial */}
            {feriado && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <PartyPopper className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-800">Feriado</p>
                  <p className="text-sm text-purple-600">{feriado.name}</p>
                </div>
              </div>
            )}

            {indisponivel && !feriado && (
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl mb-4">
                <div className="p-2 bg-gray-200 rounded-xl">
                  <Ban className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Motorista Indisponível</p>
                  <p className="text-sm text-gray-600">Não há atendimento neste dia</p>
                </div>
              </div>
            )}

            {ehFimDeSemana && !feriado && (
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl mb-4">
                <div className="p-2 bg-gray-200 rounded-xl">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Fim de Semana</p>
                  <p className="text-sm text-gray-600">Não há atendimento aos finais de semana</p>
                </div>
              </div>
            )}

            {isPassado && !ehFimDeSemana && !feriado && !indisponivel && (
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl mb-4">
                <div className="p-2 bg-gray-200 rounded-xl">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Data Passada</p>
                  <p className="text-sm text-gray-600">Não é possível agendar em datas anteriores</p>
                </div>
              </div>
            )}

            {/* Seletor de horários - apenas se disponível */}
            {!ehIndisponivel && (
              <>
                {/* Resumo de disponibilidade */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`
                    flex items-center gap-2 p-3 rounded-xl
                    ${manhaDisponiveis.length === 0 ? 'bg-rose-50' : manhaDisponiveis.length === HORARIOS_MANHA.length ? 'bg-emerald-50' : 'bg-amber-50'}
                  `}>
                    <Sun className={`w-5 h-5 ${manhaDisponiveis.length === 0 ? 'text-rose-500' : manhaDisponiveis.length === HORARIOS_MANHA.length ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <div>
                      <p className="text-xs text-gray-500">Manhã</p>
                      <p className="font-semibold text-gray-800">{manhaDisponiveis.length}/{HORARIOS_MANHA.length}</p>
                    </div>
                  </div>
                  <div className={`
                    flex items-center gap-2 p-3 rounded-xl
                    ${tardeDisponiveis.length === 0 ? 'bg-rose-50' : tardeDisponiveis.length === HORARIOS_TARDE.length ? 'bg-emerald-50' : 'bg-amber-50'}
                  `}>
                    <Moon className={`w-5 h-5 ${tardeDisponiveis.length === 0 ? 'text-rose-500' : tardeDisponiveis.length === HORARIOS_TARDE.length ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <div>
                      <p className="text-xs text-gray-500">Tarde</p>
                      <p className="font-semibold text-gray-800">{tardeDisponiveis.length}/{HORARIOS_TARDE.length}</p>
                    </div>
                  </div>
                </div>

                {/* Botão de agendamento rápido */}
                {primeiroDisponivel && !horarioSelecionado && (
                  <button
                    onClick={handleAgendarRapido}
                    className="w-full flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-150 rounded-2xl border-2 border-primary-200 border-dashed transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-primary-800">Próximo Disponível</p>
                        <p className="text-sm text-primary-600">{primeiroDisponivel} - {getPeriodo(primeiroDisponivel)}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {/* TimeSlotPicker */}
                {horariosRealmenteDisponiveis.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Selecione um horário
                    </p>
                    <TimeSlotPicker
                      value={horarioSelecionado}
                      onChange={setHorarioSelecionado}
                      horariosIndisponiveis={todosIndisponiveis}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-4 bg-rose-100 rounded-full mb-4">
                      <Ban className="w-8 h-8 text-rose-500" />
                    </div>
                    <p className="font-semibold text-gray-800 mb-1">Dia Lotado</p>
                    <p className="text-sm text-gray-500">Todos os horários estão ocupados</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer com ações */}
          {!ehIndisponivel && horariosRealmenteDisponiveis.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 rounded-b-3xl border-t border-gray-100">
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAgendar}
                  disabled={!horarioSelecionado}
                  className={`
                    flex-1 flex items-center justify-center gap-2
                    ${horarioSelecionado
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
                      : ''
                    }
                  `}
                >
                  {horarioSelecionado ? (
                    <>
                      Agendar {horarioSelecionado}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Selecione um horário'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Footer para dias indisponíveis */}
          {ehIndisponivel && (
            <div className="px-6 py-4 bg-gray-50 rounded-b-3xl border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
