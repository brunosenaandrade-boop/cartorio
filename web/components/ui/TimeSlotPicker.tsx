'use client'

import { Sun, Moon, Check } from 'lucide-react'
import { HORARIOS_MANHA, HORARIOS_TARDE } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TimeSlotPickerProps {
  value: string
  onChange: (horario: string) => void
  horariosIndisponiveis?: string[]
  disabled?: boolean
  className?: string
}

export function TimeSlotPicker({
  value,
  onChange,
  horariosIndisponiveis = [],
  disabled = false,
  className
}: TimeSlotPickerProps) {
  const isDisponivel = (horario: string) => !horariosIndisponiveis.includes(horario)
  const isSelected = (horario: string) => value === horario

  const renderSlot = (horario: string) => {
    const disponivel = isDisponivel(horario)
    const selected = isSelected(horario)

    return (
      <button
        key={horario}
        type="button"
        disabled={disabled || !disponivel}
        onClick={() => disponivel && onChange(horario)}
        className={cn(
          'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-1',
          {
            // Selecionado
            'bg-primary-500 border-primary-500 text-white shadow-md scale-105 focus:ring-primary-300':
              selected && disponivel,
            // Disponível
            'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50 focus:ring-primary-200':
              !selected && disponivel,
            // Indisponível
            'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through opacity-60':
              !disponivel
          }
        )}
      >
        {horario}
        {selected && disponivel && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </span>
        )}
      </button>
    )
  }

  // Calcular estatísticas
  const manhaDisponiveis = HORARIOS_MANHA.filter(h => isDisponivel(h)).length
  const tardeDisponiveis = HORARIOS_TARDE.filter(h => isDisponivel(h)).length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Manhã */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Sun className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-medium text-gray-700">Manhã</span>
          </div>
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            manhaDisponiveis === 0
              ? 'bg-rose-100 text-rose-600'
              : manhaDisponiveis === HORARIOS_MANHA.length
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-amber-100 text-amber-600'
          )}>
            {manhaDisponiveis}/{HORARIOS_MANHA.length} disponíveis
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {HORARIOS_MANHA.map(renderSlot)}
        </div>
      </div>

      {/* Divisor */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider">
            Intervalo
          </span>
        </div>
      </div>

      {/* Tarde */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <Moon className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-700">Tarde</span>
          </div>
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            tardeDisponiveis === 0
              ? 'bg-rose-100 text-rose-600'
              : tardeDisponiveis === HORARIOS_TARDE.length
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-amber-100 text-amber-600'
          )}>
            {tardeDisponiveis}/{HORARIOS_TARDE.length} disponíveis
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {HORARIOS_TARDE.map(renderSlot)}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 rounded bg-white border-2 border-gray-200" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 rounded bg-primary-500" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  )
}
