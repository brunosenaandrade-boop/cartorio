'use client'

import { useState, useEffect } from 'react'
import {
  Receipt,
  Download,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  Clock3
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { formatarData, formatarMoeda } from '@/lib/utils'
import { Recibo, Agendamento } from '@/types'

interface ReciboComAgendamento extends Recibo {
  agendamento: Agendamento
}

export function RecibosTab() {
  const [recibos, setRecibos] = useState<ReciboComAgendamento[]>([])
  const [agendamentosSemRecibo, setAgendamentosSemRecibo] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarRecibos()
  }, [])

  const carregarRecibos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recibos')
      const data = await response.json()

      if (data.success) {
        setRecibos(data.recibos)
        setAgendamentosSemRecibo(data.agendamentosSemRecibo)
      }
    } catch (error) {
      console.error('Erro ao carregar recibos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (reciboId: string) => {
    try {
      const response = await fetch(`/api/recibos/${reciboId}/pdf`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recibo-${reciboId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao baixar recibo:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Recibos Disponíveis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Recibos Disponíveis
        </h3>

        {recibos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>Nenhum recibo disponível</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recibos.map((recibo) => (
              <div
                key={recibo.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <span className="font-medium">
                          {formatarData(recibo.agendamento.data)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span>{recibo.agendamento.horario}</span>
                      </div>
                      <Badge variant="success">Disponível</Badge>
                    </div>

                    <div className="text-gray-600">
                      {recibo.agendamento.escrevente_nome}
                    </div>

                    <div className="text-xl font-bold text-green-600">
                      {formatarMoeda(recibo.valor)}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(recibo.id)}
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aguardando Recibo */}
      {agendamentosSemRecibo.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock3 className="w-5 h-5 text-yellow-500" />
            Aguardando Recibo do Motorista
          </h3>

          <div className="space-y-3">
            {agendamentosSemRecibo.map((agendamento) => (
              <div
                key={agendamento.id}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span className="font-medium">
                      {formatarData(agendamento.data)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>{agendamento.horario}</span>
                  </div>
                  <Badge variant="warning">Pendente</Badge>
                </div>

                <div className="text-gray-600 mt-2">
                  {agendamento.escrevente_nome}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
