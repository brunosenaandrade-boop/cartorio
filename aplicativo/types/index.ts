// Tipos principais do aplicativo

export type StatusAgendamento = 'agendado' | 'concluido' | 'cancelado'

export type HorarioDisponivel = '09:15' | '15:00'

export interface Agendamento {
  id: string
  escrevente_nome: string
  data: string
  horario: HorarioDisponivel
  cep: string
  endereco: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  observacoes?: string
  status: StatusAgendamento
  created_at: string
  cancelled_at?: string
  cancelled_by?: string
}

export interface MotoristaIndisponibilidade {
  id: string
  data: string
  motivo?: string
  created_at: string
}

export interface Recibo {
  id: string
  agendamento_id: string
  valor: number
  created_at: string
  agendamento?: Agendamento
}

export interface DadosFinanceiros {
  totalMes: number
  totalAno: number
  totalManha: number
  totalTarde: number
  recibos: Recibo[]
}

export interface FiltroAgendamentos {
  periodo: 'hoje' | 'semana' | 'mes' | 'todos'
  status?: StatusAgendamento
}
