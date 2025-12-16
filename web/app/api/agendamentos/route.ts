import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { z } from 'zod'
import { enviarEmailNovoAgendamento } from '@/lib/resend'
import { notificarNovoAgendamento } from '@/lib/push-notifications'
import { normalizarHorario } from '@/lib/utils'

// Schema de validação para novo agendamento
const novoAgendamentoSchema = z.object({
  escrevente_nome: z.string().min(1, 'Nome do escrevente é obrigatório'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  horario: z.enum([
    '08:45', '09:00', '09:15', '09:30', '09:45', '10:00',
    '10:15', '10:30', '10:45', '11:00', '11:15', '11:30',
    '14:00', '14:15', '14:30', '14:45', '15:00', '15:15',
    '15:30', '15:45', '16:00', '16:15', '16:30', '16:45'
  ], { message: 'Horário inválido' }),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  observacoes: z.string().optional()
})

// GET - Listar agendamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')

    const supabase = createServerClient()

    let query = supabase
      .from('agendamentos')
      .select('*')
      .order('data', { ascending: false })
      .order('horario', { ascending: true })

    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    if (dataInicio) {
      query = query.gte('data', dataInicio)
    }

    if (dataFim) {
      query = query.lte('data', dataFim)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar agendamentos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Normalizar horário antes de validar (garante formato HH:MM)
    if (body.horario) {
      body.horario = normalizarHorario(body.horario)
    }

    // Validar dados
    const validacao = novoAgendamentoSchema.safeParse(body)
    if (!validacao.success) {
      return NextResponse.json(
        { success: false, error: validacao.error.errors[0].message },
        { status: 400 }
      )
    }

    const dados = validacao.data
    const supabase = createServerClient()

    // Verificar se data é dia útil (não fim de semana)
    const dataAgendamento = new Date(dados.data + 'T00:00:00')
    const diaSemana = dataAgendamento.getDay()

    if (diaSemana === 0 || diaSemana === 6) {
      return NextResponse.json(
        { success: false, error: 'Não é possível agendar em fins de semana' },
        { status: 400 }
      )
    }

    // Verificar se o horário já passou (para hoje)
    // Usar hora local do Brasil (não UTC) para evitar problemas de timezone
    const hoje = new Date()
    const hojeString = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

    if (dados.data === hojeString) {
      const horaAtual = hoje.getHours()
      const minutoAtual = hoje.getMinutes()

      const [horaAgendamento, minutoAgendamento] = dados.horario.split(':').map(Number)

      const horarioPassou =
        horaAtual > horaAgendamento ||
        (horaAtual === horaAgendamento && minutoAtual >= minutoAgendamento)

      if (horarioPassou) {
        return NextResponse.json(
          { success: false, error: 'Este horário já passou. Escolha um horário futuro.' },
          { status: 400 }
        )
      }
    }

    // Verificar se a data já passou (dia anterior)
    if (dados.data < hojeString) {
      return NextResponse.json(
        { success: false, error: 'Não é possível agendar em datas passadas' },
        { status: 400 }
      )
    }

    // Verificar se motorista está disponível
    const { data: indisponibilidade } = await supabase
      .from('motorista_indisponibilidades')
      .select('id')
      .eq('data', dados.data)
      .single()

    if (indisponibilidade) {
      return NextResponse.json(
        { success: false, error: 'Motorista indisponível nesta data' },
        { status: 400 }
      )
    }

    // Verificar se horário já está ocupado
    const { data: agendamentoExistente } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data', dados.data)
      .eq('horario', dados.horario)
      .eq('status', 'agendado')
      .single()

    if (agendamentoExistente) {
      return NextResponse.json(
        { success: false, error: 'Este horário já está ocupado' },
        { status: 409 }
      )
    }

    // Criar agendamento
    const { data: novoAgendamento, error } = await supabase
      .from('agendamentos')
      .insert([{
        ...dados,
        status: 'agendado'
      }])
      .select()
      .single()

    if (error) throw error

    // Criar log de agendamento criado
    await supabase
      .from('logs')
      .insert([{
        acao: 'agendamento_criado',
        escrevente_nome: novoAgendamento.escrevente_nome,
        agendamento_id: novoAgendamento.id,
        detalhes: `Agendamento para ${dados.data} às ${dados.horario}`
      }])

    // Enviar email de notificação (não bloqueia a resposta)
    enviarEmailNovoAgendamento(novoAgendamento).catch(console.error)

    // Enviar push notification para o motorista (não bloqueia a resposta)
    notificarNovoAgendamento(novoAgendamento).catch(console.error)

    return NextResponse.json(
      { success: true, data: novoAgendamento },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}
