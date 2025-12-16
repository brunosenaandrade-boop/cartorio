import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'
import { Agendamento } from '@/types'

// Chaves para AsyncStorage
const STORAGE_KEYS = {
  NOTIFICATION_IDS: 'notification_ids',
  PUSH_TOKEN: 'push_token',
  BATTERY_OPTIMIZATION_ASKED: 'battery_optimization_asked',
}

// ============================================
// PUSH TOKEN - EXPO PUSH NOTIFICATIONS
// ============================================

export async function registrarPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push tokens só funcionam em dispositivos físicos')
    return null
  }

  try {
    // Verificar/solicitar permissão
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada')
      return null
    }

    // Obter o push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    if (!projectId) {
      console.log('Project ID não encontrado')
      return null
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    })
    const pushToken = tokenData.data
    console.log('Push Token obtido:', pushToken)

    // Salvar localmente
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, pushToken)

    // Salvar no Supabase (para o servidor poder enviar push)
    await salvarPushTokenNoServidor(pushToken)

    return pushToken
  } catch (error) {
    console.error('Erro ao registrar push token:', error)
    return null
  }
}

async function salvarPushTokenNoServidor(token: string): Promise<void> {
  try {
    // Obter device ID único
    const deviceId = Device.modelId || Device.deviceName || 'unknown'

    // Upsert no Supabase - atualiza se existe, insere se não existe
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          token: token,
          device_id: deviceId,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'device_id' }
      )

    if (error) {
      console.error('Erro ao salvar push token no servidor:', error)
    } else {
      console.log('Push token salvo no servidor')
    }
  } catch (error) {
    console.error('Erro ao salvar push token:', error)
  }
}

export async function obterPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN)
  } catch {
    return null
  }
}

// Configuração do handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
})

// Tipos
interface NotificationIds {
  [agendamentoId: string]: string[] // Array de IDs de notificações agendadas
}

interface AgendamentoNotificationData {
  agendamentoId: string
  tipo: 'imediato' | 'lembrete_18h' | 'lembrete_21h' | 'lembrete_8h'
}

// ============================================
// PERMISSÕES E CONFIGURAÇÃO
// ============================================

export async function solicitarPermissaoNotificacao(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notificações só funcionam em dispositivos físicos')
    return false
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Permissão de notificação negada')
    return false
  }

  // Configurar canal de notificação para Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('diligencias', {
      name: 'Diligências',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a365d',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true, // Ignorar modo não perturbe
      sound: 'default',
    })

    // Canal de alta prioridade para lembretes urgentes
    await Notifications.setNotificationChannelAsync('diligencias_urgente', {
      name: 'Diligências Urgentes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#e53e3e',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      sound: 'default',
    })
  }

  return true
}

export async function verificarPermissaoNotificacao(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

// ============================================
// OTIMIZAÇÃO DE BATERIA (ANDROID)
// ============================================

export async function verificarOtimizacaoBateria(): Promise<boolean> {
  if (Platform.OS !== 'android') return true

  try {
    // Verifica se já foi perguntado
    const perguntado = await AsyncStorage.getItem(STORAGE_KEYS.BATTERY_OPTIMIZATION_ASKED)
    return perguntado === 'true'
  } catch {
    return false
  }
}

export async function abrirConfiguracoesBateria(): Promise<void> {
  if (Platform.OS !== 'android') return

  try {
    // Abre as configurações do app (onde o usuário pode configurar bateria)
    await Linking.openSettings()

    // Marca como perguntado
    await AsyncStorage.setItem(STORAGE_KEYS.BATTERY_OPTIMIZATION_ASKED, 'true')
  } catch (error) {
    console.error('Erro ao abrir configurações de bateria:', error)
    // Fallback: abre configurações gerais
    await Linking.openSettings()
  }
}

export async function abrirConfiguracoesNotificacao(): Promise<void> {
  try {
    await Linking.openSettings()
  } catch (error) {
    console.error('Erro ao abrir configurações:', error)
  }
}

// ============================================
// AGENDAMENTO DE NOTIFICAÇÕES
// ============================================

async function salvarNotificationIds(ids: NotificationIds): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_IDS, JSON.stringify(ids))
}

async function carregarNotificationIds(): Promise<NotificationIds> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_IDS)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function criarDataHorario(dataString: string, hora: number, minuto: number): Date {
  const [ano, mes, dia] = dataString.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia, hora, minuto, 0, 0)
  return data
}

export async function agendarNotificacoesParaAgendamento(agendamento: Agendamento): Promise<void> {
  const permissao = await verificarPermissaoNotificacao()
  if (!permissao) {
    console.log('Sem permissão para notificações')
    return
  }

  const notificationIds: string[] = []
  const agora = new Date()

  const { id, escrevente_nome, data, horario, endereco, numero, bairro, cidade } = agendamento
  const enderecoCompleto = `${endereco}, ${numero} - ${bairro}, ${cidade}`
  const dataFormatada = data.split('-').reverse().join('/')

  // Data do agendamento
  const [ano, mes, dia] = data.split('-').map(Number)
  const dataAgendamento = new Date(ano, mes - 1, dia)
  const diaAnterior = new Date(dataAgendamento)
  diaAnterior.setDate(diaAnterior.getDate() - 1)

  // 1. NOTIFICAÇÃO IMEDIATA - Nova diligência criada
  try {
    const idImediato = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚗 Nova Diligência!',
        body: `${escrevente_nome} agendou para ${dataFormatada} às ${horario}`,
        data: { agendamentoId: id, tipo: 'imediato' } as AgendamentoNotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        channelId: 'diligencias',
      },
      trigger: null, // Imediato
    })
    notificationIds.push(idImediato)
  } catch (error) {
    console.error('Erro ao agendar notificação imediata:', error)
  }

  // 2. LEMBRETE 18H DO DIA ANTERIOR
  const data18h = criarDataHorario(
    `${diaAnterior.getFullYear()}-${String(diaAnterior.getMonth() + 1).padStart(2, '0')}-${String(diaAnterior.getDate()).padStart(2, '0')}`,
    18, 0
  )

  if (data18h > agora) {
    try {
      const id18h = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Lembrete de Diligência',
          body: `Amanhã às ${horario} - ${enderecoCompleto}`,
          data: { agendamentoId: id, tipo: 'lembrete_18h' } as AgendamentoNotificationData,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: 'diligencias',
        },
        trigger: { date: data18h },
      })
      notificationIds.push(id18h)
    } catch (error) {
      console.error('Erro ao agendar notificação 18h:', error)
    }
  }

  // 3. LEMBRETE 21H DO DIA ANTERIOR
  const data21h = criarDataHorario(
    `${diaAnterior.getFullYear()}-${String(diaAnterior.getMonth() + 1).padStart(2, '0')}-${String(diaAnterior.getDate()).padStart(2, '0')}`,
    21, 0
  )

  if (data21h > agora) {
    try {
      const id21h = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Diligência Amanhã',
          body: `Não esqueça: ${horario} - ${escrevente_nome}\n${enderecoCompleto}`,
          data: { agendamentoId: id, tipo: 'lembrete_21h' } as AgendamentoNotificationData,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: 'diligencias',
        },
        trigger: { date: data21h },
      })
      notificationIds.push(id21h)
    } catch (error) {
      console.error('Erro ao agendar notificação 21h:', error)
    }
  }

  // 4. LEMBRETE 8H DO DIA DA DILIGÊNCIA
  const data8h = criarDataHorario(data, 8, 0)

  if (data8h > agora) {
    try {
      const id8h = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Diligência Hoje!',
          body: `Hoje às ${horario} - ${enderecoCompleto}\n${escrevente_nome}`,
          data: { agendamentoId: id, tipo: 'lembrete_8h' } as AgendamentoNotificationData,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          channelId: 'diligencias_urgente',
        },
        trigger: { date: data8h },
      })
      notificationIds.push(id8h)
    } catch (error) {
      console.error('Erro ao agendar notificação 8h:', error)
    }
  }

  // Salvar IDs das notificações
  if (notificationIds.length > 0) {
    const todosIds = await carregarNotificationIds()
    todosIds[id] = notificationIds
    await salvarNotificationIds(todosIds)
    console.log(`✅ ${notificationIds.length} notificações agendadas para agendamento ${id}`)
  }
}

export async function cancelarNotificacoesDoAgendamento(agendamentoId: string): Promise<void> {
  try {
    const todosIds = await carregarNotificationIds()
    const ids = todosIds[agendamentoId]

    if (ids && ids.length > 0) {
      for (const notificationId of ids) {
        await Notifications.cancelScheduledNotificationAsync(notificationId)
      }

      delete todosIds[agendamentoId]
      await salvarNotificationIds(todosIds)
      console.log(`❌ Notificações canceladas para agendamento ${agendamentoId}`)
    }
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error)
  }
}

export async function cancelarTodasNotificacoes(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
    await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_IDS)
    console.log('Todas as notificações canceladas')
  } catch (error) {
    console.error('Erro ao cancelar todas as notificações:', error)
  }
}

// ============================================
// REAGENDAMENTO (QUANDO APP ABRE)
// ============================================

export async function reagendarNotificacoesPendentes(agendamentos: Agendamento[]): Promise<void> {
  const permissao = await verificarPermissaoNotificacao()
  if (!permissao) return

  // Cancela todas as notificações existentes
  await cancelarTodasNotificacoes()

  // Reagenda para todos os agendamentos ativos
  const agendamentosAtivos = agendamentos.filter(a => a.status === 'agendado')

  for (const agendamento of agendamentosAtivos) {
    // Verifica se a data ainda é futura ou hoje
    const dataAgendamento = new Date(agendamento.data + 'T23:59:59')
    if (dataAgendamento >= new Date()) {
      await agendarNotificacoesParaAgendamento(agendamento)
    }
  }

  console.log(`🔄 Reagendadas notificações para ${agendamentosAtivos.length} agendamentos`)
}

// ============================================
// NOTIFICAÇÃO DE CANCELAMENTO
// ============================================

export async function notificarCancelamento(agendamento: Agendamento): Promise<void> {
  const permissao = await verificarPermissaoNotificacao()
  if (!permissao) return

  const { escrevente_nome, data, horario } = agendamento
  const dataFormatada = data.split('-').reverse().join('/')

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '❌ Diligência Cancelada',
        body: `${escrevente_nome} cancelou a diligência de ${dataFormatada} às ${horario}`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: 'diligencias',
      },
      trigger: null, // Imediato
    })
  } catch (error) {
    console.error('Erro ao notificar cancelamento:', error)
  }

  // Cancela as notificações agendadas para esse agendamento
  await cancelarNotificacoesDoAgendamento(agendamento.id)
}

// ============================================
// LISTENERS DE NOTIFICAÇÃO
// ============================================

export function configurarListenerNotificacao(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  // Listener para notificação recebida (app em foreground)
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificação recebida:', notification)
    onNotificationReceived?.(notification)
  })

  // Listener para quando usuário toca na notificação
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Resposta da notificação:', response)
    onNotificationResponse?.(response)
  })

  // Retorna função de cleanup
  return () => {
    receivedSubscription.remove()
    responseSubscription.remove()
  }
}

// ============================================
// DEBUG E TESTES
// ============================================

export async function listarNotificacoesAgendadas(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync()
}

export async function enviarNotificacaoTeste(): Promise<void> {
  const permissao = await verificarPermissaoNotificacao()
  if (!permissao) {
    console.log('Sem permissão para notificações')
    return
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🧪 Teste de Notificação',
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
      channelId: 'diligencias',
    },
    trigger: null,
  })
}
