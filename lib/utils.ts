import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Horários disponíveis para agendamento
export const HORARIOS_MANHA = [
  '08:45', '09:00', '09:15', '09:30', '09:45', '10:00',
  '10:15', '10:30', '10:45', '11:00', '11:15', '11:30'
] as const

export const HORARIOS_TARDE = [
  '14:00', '14:15', '14:30', '14:45', '15:00', '15:15',
  '15:30', '15:45', '16:00', '16:15', '16:30', '16:45'
] as const

export const HORARIOS_DISPONIVEIS = [...HORARIOS_MANHA, ...HORARIOS_TARDE] as const

export type HorarioDisponivel = typeof HORARIOS_DISPONIVEIS[number]

// Normalizar horário para formato HH:MM (com zero à esquerda)
export function normalizarHorario(horario: string): string {
  if (!horario || !horario.includes(':')) return ''
  const partes = horario.split(':')
  if (partes.length < 2) return ''
  const [hora, minuto] = partes
  return `${hora.padStart(2, '0')}:${(minuto || '00').padStart(2, '0')}`
}

// Verificar se horário é válido (está na lista de horários disponíveis)
export function isHorarioValido(horario: string): boolean {
  const normalizado = normalizarHorario(horario)
  return HORARIOS_DISPONIVEIS.includes(normalizado as HorarioDisponivel)
}

// Determinar período do horário
export function getPeriodo(horario: string): 'Manhã' | 'Tarde' {
  const hora = parseInt(horario.split(':')[0])
  return hora < 12 ? 'Manhã' : 'Tarde'
}

// Utility para combinar classes do Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatar data para exibição (DD/MM/YYYY)
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Formatar data para ISO (YYYY-MM-DD)
export function formatarDataISO(data: Date): string {
  return data.toISOString().split('T')[0]
}

// Formatar valor monetário (R$ 1.234,56)
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Formatar CEP (00000-000)
export function formatarCEP(cep: string): string {
  const numeros = cep.replace(/\D/g, '')
  if (numeros.length <= 5) return numeros
  return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`
}

// Remover formatação do CEP
export function limparCEP(cep: string): string {
  return cep.replace(/\D/g, '')
}

// Validar CEP
export function validarCEP(cep: string): boolean {
  const numeros = cep.replace(/\D/g, '')
  return numeros.length === 8
}

// Obter nome do dia da semana
export function getNomeDiaSemana(diaSemana: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return dias[diaSemana]
}

// Obter nome do mês
export function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return meses[mes]
}

// Verificar se é dia útil (segunda a sexta)
export function isDiaUtil(data: Date): boolean {
  const diaSemana = data.getDay()
  return diaSemana >= 1 && diaSemana <= 5
}

// Verificar se horário de cancelamento ainda é válido
export function podeCancelar(data: string, horario: string): boolean {
  const agora = new Date()
  const dataAgendamento = new Date(data + 'T' + horario + ':00')

  // Horário limite para cancelamento: 30 minutos antes
  const limiteMs = 30 * 60 * 1000

  const horarioLimite = new Date(dataAgendamento.getTime() - limiteMs)

  return agora < horarioLimite
}

// Gerar horário limite de cancelamento (30 min antes)
export function getHorarioLimiteCancelamento(horario: string): string {
  const [hora, minuto] = horario.split(':').map(Number)
  let novaHora = hora
  let novoMinuto = minuto - 30

  if (novoMinuto < 0) {
    novoMinuto += 60
    novaHora -= 1
  }

  return `${novaHora.toString().padStart(2, '0')}:${novoMinuto.toString().padStart(2, '0')}`
}

// Verificar se data é hoje
export function isHoje(data: string): boolean {
  const hoje = new Date()
  const dataVerificar = new Date(data + 'T00:00:00')
  return (
    hoje.getFullYear() === dataVerificar.getFullYear() &&
    hoje.getMonth() === dataVerificar.getMonth() &&
    hoje.getDate() === dataVerificar.getDate()
  )
}

// Verificar se data é no passado
export function isPassado(data: string): boolean {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dataVerificar = new Date(data + 'T00:00:00')
  return dataVerificar < hoje
}

// Capitalizar primeira letra
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}
