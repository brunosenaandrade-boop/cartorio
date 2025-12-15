'use client'

import { useState, useEffect } from 'react'
import {
  History,
  Calendar,
  Clock,
  User,
  PlusCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui'
import { formatarData } from '@/lib/utils'
import { Log } from '@/types'

export function HistoricoTab() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarLogs()
  }, [])

  const carregarLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/logs')
      const data = await response.json()

      if (data.success) {
        setLogs(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarDataHora = (dataISO: string) => {
    const data = new Date(dataISO)
    return {
      data: data.toLocaleDateString('pt-BR'),
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getAcaoInfo = (acao: string) => {
    if (acao === 'agendamento_criado') {
      return {
        icon: PlusCircle,
        label: 'Agendamento Criado',
        variant: 'success' as const,
        color: 'text-green-500'
      }
    }
    return {
      icon: XCircle,
      label: 'Agendamento Cancelado',
      variant: 'danger' as const,
      color: 'text-red-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhuma atividade registrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <History className="w-5 h-5 text-primary-500" />
        Histórico de Atividades
      </h3>

      <div className="relative">
        {/* Linha do tempo */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {logs.map((log) => {
            const { data, hora } = formatarDataHora(log.created_at)
            const acaoInfo = getAcaoInfo(log.acao)
            const IconeAcao = acaoInfo.icon

            return (
              <div key={log.id} className="relative pl-14">
                {/* Ícone na linha do tempo */}
                <div className={`absolute left-4 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 ${
                  log.acao === 'agendamento_criado'
                    ? 'border-green-500'
                    : 'border-red-500'
                }`}>
                  <IconeAcao className={`w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${acaoInfo.color}`} />
                </div>

                {/* Card do log */}
                <div className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Badge variant={acaoInfo.variant}>
                      {acaoInfo.label}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      {data} às {hora}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{log.escrevente_nome}</span>
                  </div>

                  {log.detalhes && (
                    <p className="text-sm text-gray-600">
                      {log.detalhes}
                    </p>
                  )}

                  {log.agendamento && (
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatarData(log.agendamento.data)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.agendamento.horario}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
