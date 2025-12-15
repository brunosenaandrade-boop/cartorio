// Serviço de Push Notifications via Expo Push API
// Documentação: https://docs.expo.dev/push-notifications/sending-notifications/

import { createServerClient } from './supabase'

interface ExpoPushMessage {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
  channelId?: string
  priority?: 'default' | 'normal' | 'high'
}

interface ExpoPushTicket {
  status: 'ok' | 'error'
  id?: string
  message?: string
  details?: {
    error?: string
  }
}

/**
 * Busca todos os push tokens cadastrados no Supabase
 */
async function obterPushTokens(): Promise<string[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('push_tokens')
    .select('token')

  if (error) {
    console.error('Erro ao buscar push tokens:', error)
    return []
  }

  return data?.map(item => item.token) || []
}

/**
 * Envia notificação push para todos os dispositivos cadastrados
 */
export async function enviarPushParaTodos(
  titulo: string,
  mensagem: string,
  dados?: Record<string, unknown>
): Promise<boolean> {
  const tokens = await obterPushTokens()

  if (tokens.length === 0) {
    console.log('Nenhum push token cadastrado')
    return false
  }

  // Criar mensagens para cada token
  const messages: ExpoPushMessage[] = tokens.map(token => ({
    to: token,
    title: titulo,
    body: mensagem,
    data: dados,
    sound: 'default',
    priority: 'high',
    channelId: 'diligencias',
  }))

  return await enviarPushMessages(messages)
}

/**
 * Envia mensagens push via Expo Push API
 */
async function enviarPushMessages(messages: ExpoPushMessage[]): Promise<boolean> {
  // Expo Push API URL
  const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

  try {
    // Enviar em lotes de 100 (limite da Expo)
    const chunks = chunkArray(messages, 100)

    for (const chunk of chunks) {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      })

      if (!response.ok) {
        console.error('Erro na Expo Push API:', response.status, response.statusText)
        continue
      }

      const result = await response.json()
      const tickets: ExpoPushTicket[] = result.data || []

      // Log dos resultados
      tickets.forEach((ticket, index) => {
        if (ticket.status === 'error') {
          console.error(`Push falhou para ${chunk[index].to}:`, ticket.message)

          // Se o token é inválido, podemos removê-lo do banco
          if (ticket.details?.error === 'DeviceNotRegistered') {
            removerTokenInvalido(chunk[index].to)
          }
        }
      })
    }

    console.log(`✅ Push enviado para ${messages.length} dispositivo(s)`)
    return true
  } catch (error) {
    console.error('Erro ao enviar push notifications:', error)
    return false
  }
}

/**
 * Remove token inválido do banco de dados
 */
async function removerTokenInvalido(token: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('token', token)

  if (error) {
    console.error('Erro ao remover token inválido:', error)
  } else {
    console.log('Token inválido removido:', token)
  }
}

/**
 * Divide array em chunks menores
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

// ============================================
// FUNÇÕES DE NOTIFICAÇÃO ESPECÍFICAS
// ============================================

/**
 * Notifica sobre novo agendamento criado
 */
export async function notificarNovoAgendamento(agendamento: {
  escrevente_nome: string
  data: string
  horario: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
}): Promise<void> {
  const dataFormatada = agendamento.data.split('-').reverse().join('/')

  await enviarPushParaTodos(
    '🚗 Nova Diligência!',
    `${agendamento.escrevente_nome} agendou para ${dataFormatada} às ${agendamento.horario}`,
    {
      tipo: 'novo_agendamento',
      data: agendamento.data,
      horario: agendamento.horario,
    }
  )
}

/**
 * Notifica sobre agendamento cancelado
 */
export async function notificarCancelamento(agendamento: {
  escrevente_nome: string
  data: string
  horario: string
}): Promise<void> {
  const dataFormatada = agendamento.data.split('-').reverse().join('/')

  await enviarPushParaTodos(
    '❌ Diligência Cancelada',
    `${agendamento.escrevente_nome} cancelou a diligência de ${dataFormatada} às ${agendamento.horario}`,
    {
      tipo: 'cancelamento',
      data: agendamento.data,
      horario: agendamento.horario,
    }
  )
}
