'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  X,
  Loader2,
  AlertCircle,
  Filter
} from 'lucide-react'
import { Button, Badge, Modal, ModalActions, Select } from '@/components/ui'
import { formatarData, podeCancelar, getHorarioLimiteCancelamento } from '@/lib/utils'
import { Agendamento, StatusAgendamento } from '@/types'

export function AgendamentosTab() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [modalCancelar, setModalCancelar] = useState<Agendamento | null>(null)
  const [cancelando, setCancelando] = useState(false)
  const [erroCancelamento, setErroCancelamento] = useState<string>('')

  useEffect(() => {
    carregarAgendamentos()
  }, [filtroStatus])

  const carregarAgendamentos = async () => {
    setLoading(true)
    try {
      const params = filtroStatus !== 'todos' ? `?status=${filtroStatus}` : ''
      const response = await fetch(`/api/agendamentos${params}`)
      const data = await response.json()

      if (data.success) {
        setAgendamentos(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = async () => {
    if (!modalCancelar) return

    setCancelando(true)
    setErroCancelamento('')
    try {
      const response = await fetch(`/api/agendamentos/${modalCancelar.id}/cancelar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelled_by: 'Escrevente' })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setModalCancelar(null)
        carregarAgendamentos()
      } else {
        setErroCancelamento(data.error || 'Erro ao cancelar agendamento')
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      setErroCancelamento('Erro de conexão. Tente novamente.')
    } finally {
      setCancelando(false)
    }
  }

  const getStatusBadge = (status: StatusAgendamento) => {
    const variants = {
      agendado: { variant: 'info' as const, label: 'Agendado' },
      concluido: { variant: 'success' as const, label: 'Concluído' },
      cancelado: { variant: 'danger' as const, label: 'Cancelado' }
    }
    return variants[status]
  }

  const optionsFiltro = [
    { value: 'todos', label: 'Todos os status' },
    { value: 'agendado', label: 'Agendados' },
    { value: 'concluido', label: 'Concluídos' },
    { value: 'cancelado', label: 'Cancelados' }
  ]

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filtrar:</span>
        </div>
        <Select
          options={optionsFiltro}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Lista de Agendamentos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : agendamentos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agendamentos.map((agendamento) => {
            const statusBadge = getStatusBadge(agendamento.status)
            const podeSerCancelado =
              agendamento.status === 'agendado' &&
              podeCancelar(agendamento.data, agendamento.horario)

            return (
              <div
                key={agendamento.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Data e Horário */}
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
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                    </div>

                    {/* Escrevente */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{agendamento.escrevente_nome}</span>
                    </div>

                    {/* Endereço */}
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {agendamento.endereco}, {agendamento.numero}
                        {agendamento.complemento && ` - ${agendamento.complemento}`}
                        <br />
                        {agendamento.bairro} - {agendamento.cidade}/{agendamento.estado}
                        <br />
                        CEP: {agendamento.cep}
                      </span>
                    </div>

                    {/* Observações */}
                    {agendamento.observacoes && (
                      <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                        {agendamento.observacoes}
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  {podeSerCancelado && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setModalCancelar(agendamento)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Cancelamento */}
      <Modal
        isOpen={!!modalCancelar}
        onClose={() => {
          setModalCancelar(null)
          setErroCancelamento('')
        }}
        title="Cancelar Agendamento"
      >
        {modalCancelar && (
          <div className="-mt-2">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Tem certeza que deseja cancelar?</p>
                <p className="mt-1">
                  Agendamento de {formatarData(modalCancelar.data)} às {modalCancelar.horario}
                </p>
                <p className="mt-2 text-yellow-600">
                  Limite para cancelamento: {getHorarioLimiteCancelamento(modalCancelar.horario)}
                </p>
              </div>
            </div>

            {/* Mensagem de erro */}
            {erroCancelamento && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl mt-3 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Erro ao cancelar</p>
                  <p className="mt-1">{erroCancelamento}</p>
                </div>
              </div>
            )}

            <ModalActions className="mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setModalCancelar(null)
                  setErroCancelamento('')
                }}
                disabled={cancelando}
              >
                Voltar
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelar}
                isLoading={cancelando}
              >
                Confirmar Cancelamento
              </Button>
            </ModalActions>
          </>
        )}
      </Modal>
    </div>
  )
}
