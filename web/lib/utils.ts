import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

  // Horário limite para cancelamento
  const limiteMinutos = horario === '09:15' ? 30 : 30 // 30 minutos antes
  const limiteMs = limiteMinutos * 60 * 1000

  const horarioLimite = new Date(dataAgendamento.getTime() - limiteMs)

  return agora < horarioLimite
}

// Gerar horário limite de cancelamento
export function getHorarioLimiteCancelamento(horario: string): string {
  if (horario === '09:15') return '08:45'
  if (horario === '15:00') return '14:30'
  return ''
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
