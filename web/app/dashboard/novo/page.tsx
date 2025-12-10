'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Loader2
} from 'lucide-react'
import { Button, Input, Select, Textarea, Card, CardContent } from '@/components/ui'
import { buscarCEP } from '@/lib/viacep'
import { formatarCEP, formatarData } from '@/lib/utils'
import { NovoAgendamentoForm, HorarioDisponivel } from '@/types'

type Etapa = 'formulario' | 'confirmar' | 'sucesso'

const horariosOptions = [
  { value: '09:15', label: '09:15 - Manhã' },
  { value: '15:00', label: '15:00 - Tarde' }
]

export default function NovoAgendamentoPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<Etapa>('formulario')
  const [loading, setLoading] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [erro, setErro] = useState('')

  const [formData, setFormData] = useState<NovoAgendamentoForm>({
    escrevente_nome: '',
    data: '',
    horario: '' as HorarioDisponivel,
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SC',
    observacoes: ''
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '')
    if (valor.length > 8) valor = valor.slice(0, 8)

    const cepFormatado = formatarCEP(valor)
    setFormData(prev => ({ ...prev, cep: cepFormatado }))

    // Buscar CEP quando tiver 8 dígitos
    if (valor.length === 8) {
      setBuscandoCep(true)
      const endereco = await buscarCEP(valor)
      setBuscandoCep(false)

      if (endereco) {
        setFormData(prev => ({
          ...prev,
          endereco: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.localidade,
          estado: endereco.uf
        }))
      }
    }
  }

  const validarFormulario = (): boolean => {
    if (!formData.escrevente_nome.trim()) {
      setErro('Nome do escrevente é obrigatório')
      return false
    }
    if (!formData.data) {
      setErro('Data é obrigatória')
      return false
    }
    if (!formData.horario) {
      setErro('Horário é obrigatório')
      return false
    }
    if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
      setErro('CEP inválido')
      return false
    }
    if (!formData.endereco.trim()) {
      setErro('Endereço é obrigatório')
      return false
    }
    if (!formData.numero.trim()) {
      setErro('Número é obrigatório')
      return false
    }
    if (!formData.bairro.trim()) {
      setErro('Bairro é obrigatório')
      return false
    }
    if (!formData.cidade.trim()) {
      setErro('Cidade é obrigatória')
      return false
    }

    // Verificar se não é fim de semana
    const dataSelecionada = new Date(formData.data + 'T00:00:00')
    const diaSemana = dataSelecionada.getDay()
    if (diaSemana === 0 || diaSemana === 6) {
      setErro('Não é possível agendar em fins de semana')
      return false
    }

    // Verificar se não é data passada
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    if (dataSelecionada < hoje) {
      setErro('Não é possível agendar em datas passadas')
      return false
    }

    setErro('')
    return true
  }

  const handleAvancar = () => {
    if (validarFormulario()) {
      setEtapa('confirmar')
    }
  }

  const handleVoltar = () => {
    if (etapa === 'confirmar') {
      setEtapa('formulario')
    } else {
      router.push('/dashboard')
    }
  }

  const handleConfirmar = async () => {
    setLoading(true)
    setErro('')

    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setEtapa('sucesso')
      } else {
        setErro(data.error || 'Erro ao criar agendamento')
        setEtapa('formulario')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
      setEtapa('formulario')
    } finally {
      setLoading(false)
    }
  }

  // Data mínima: hoje
  const dataMinima = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleVoltar}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-white">
                Novo Agendamento
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Indicador de Etapas */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              etapa === 'formulario'
                ? 'bg-white text-primary-700'
                : 'bg-white/20 text-white'
            }`}>
              1
            </div>
            <div className="w-12 h-0.5 bg-white/30" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              etapa === 'confirmar'
                ? 'bg-white text-primary-700'
                : etapa === 'sucesso'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/20 text-white/50'
            }`}>
              2
            </div>
            <div className="w-12 h-0.5 bg-white/30" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              etapa === 'sucesso'
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-white/50'
            }`}>
              <Check className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Etapa: Formulário */}
        {etapa === 'formulario' && (
          <Card variant="solid">
            <CardContent className="p-6 space-y-6">
              {erro && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {erro}
                </div>
              )}

              {/* Escrevente */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" />
                  Informações do Escrevente
                </h3>
                <Input
                  label="Nome do Escrevente"
                  name="escrevente_nome"
                  value={formData.escrevente_nome}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                />
              </div>

              {/* Data e Horário */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  Data e Horário
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Data"
                    type="date"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    min={dataMinima}
                  />
                  <Select
                    label="Horário"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    options={horariosOptions}
                    placeholder="Selecione o horário"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  Endereço da Diligência
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="CEP"
                    name="cep"
                    value={formData.cep}
                    onChange={handleCEPChange}
                    placeholder="00000-000"
                    className={buscandoCep ? 'animate-pulse' : ''}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Endereço"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="Número"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="123"
                  />
                  <Input
                    label="Complemento"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder="Apto, Sala..."
                  />
                  <Input
                    label="Bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    placeholder="Bairro"
                  />
                  <Input
                    label="Cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Cidade"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  Observações (opcional)
                </h3>
                <Textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Informações adicionais sobre a diligência..."
                  rows={3}
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={handleVoltar}>
                  Cancelar
                </Button>
                <Button onClick={handleAvancar}>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa: Confirmar */}
        {etapa === 'confirmar' && (
          <Card variant="solid">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmar Agendamento
              </h2>

              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-500">Escrevente</p>
                    <p className="font-medium">{formData.escrevente_nome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium">{formatarData(formData.data)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-500">Horário</p>
                    <p className="font-medium">
                      {formData.horario} ({formData.horario === '09:15' ? 'Manhã' : 'Tarde'})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Endereço</p>
                    <p className="font-medium">
                      {formData.endereco}, {formData.numero}
                      {formData.complemento && ` - ${formData.complemento}`}
                    </p>
                    <p className="text-gray-600">
                      {formData.bairro} - {formData.cidade}/{formData.estado}
                    </p>
                    <p className="text-gray-500 text-sm">CEP: {formData.cep}</p>
                  </div>
                </div>

                {formData.observacoes && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Observações</p>
                      <p className="text-gray-700">{formData.observacoes}</p>
                    </div>
                  </div>
                )}
              </div>

              {erro && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {erro}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={handleVoltar} disabled={loading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleConfirmar} isLoading={loading}>
                  Confirmar Agendamento
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa: Sucesso */}
        {etapa === 'sucesso' && (
          <Card variant="solid">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Agendamento Confirmado!
              </h2>

              <p className="text-gray-600 mb-6">
                A diligência foi agendada com sucesso para{' '}
                <strong>{formatarData(formData.data)}</strong> às{' '}
                <strong>{formData.horario}</strong>.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-gray-600">
                  <strong>Endereço:</strong><br />
                  {formData.endereco}, {formData.numero}<br />
                  {formData.bairro} - {formData.cidade}/{formData.estado}
                </p>
              </div>

              <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
