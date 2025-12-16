// Tipos principais do sistema

export type StatusAgendamento = 'agendado' | 'concluido' | 'cancelado'

export type HorarioDisponivel =
  | '08:45' | '09:00' | '09:15' | '09:30' | '09:45' | '10:00'
  | '10:15' | '10:30' | '10:45' | '11:00' | '11:15' | '11:30'
  | '14:00' | '14:15' | '14:30' | '14:45' | '15:00' | '15:15'
  | '15:30' | '15:45' | '16:00' | '16:15' | '16:30' | '16:45'

export interface Agendamento {
  id: string
  escrevente_nome: string
  data: string // formato YYYY-MM-DD
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
  data: string // formato YYYY-MM-DD
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

export type AcaoLog = 'agendamento_criado' | 'agendamento_cancelado' | 'agendamento_concluido'

export interface Log {
  id: string
  acao: AcaoLog
  escrevente_nome: string
  agendamento_id: string
  detalhes?: string
  created_at: string
  agendamento?: Agendamento
}

export interface Feriado {
  date: string
  name: string
  type: string
}

export interface DiaCalendario {
  data: string
  diaSemana: number
  disponibilidadeManha: boolean
  disponibilidadeTarde: boolean
  feriado?: string
  indisponivel: boolean
  motivoIndisponibilidade?: string
}

export interface EnderecoViaCep {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

// Formulários
export interface NovoAgendamentoForm {
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
}

// Respostas API
export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface CalendarioResponse {
  dias: DiaCalendario[]
  feriados: Feriado[]
  indisponibilidades: MotoristaIndisponibilidade[]
}
