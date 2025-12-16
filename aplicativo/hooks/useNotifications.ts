import { useState, useEffect, useCallback, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  solicitarPermissaoNotificacao,
  verificarPermissaoNotificacao,
  verificarOtimizacaoBateria,
  abrirConfiguracoesBateria,
  abrirConfiguracoesNotificacao,
  configurarListenerNotificacao,
  listarNotificacoesAgendadas,
  enviarNotificacaoTeste,
  reagendarNotificacoesPendentes,
  registrarPushToken,
} from '@/lib/notifications'
import { supabase } from '@/lib/supabase'

const STORAGE_KEYS = {
  PERMISSION_ASKED: 'notification_permission_asked',
  BATTERY_ASKED: 'battery_optimization_asked',
}

interface UseNotificationsReturn {
  permissaoConcedida: boolean
  precisaConfigurarBateria: boolean
  loading: boolean
  notificacoesAgendadas: number
  solicitarPermissao: () => Promise<boolean>
  abrirConfigBateria: () => Promise<void>
  abrirConfigNotificacao: () => Promise<void>
  testarNotificacao: () => Promise<void>
  reagendarTodas: () => Promise<void>
  verificarPermissoes: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [permissaoConcedida, setPermissaoConcedida] = useState(false)
  const [precisaConfigurarBateria, setPrecisaConfigurarBateria] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notificacoesAgendadas, setNotificacoesAgendadas] = useState(0)
  const appState = useRef(AppState.currentState)

  // Verificar estado das permissões
  const verificarPermissoes = useCallback(async () => {
    setLoading(true)
    try {
      const permissao = await verificarPermissaoNotificacao()
      setPermissaoConcedida(permissao)

      const batteriaConfigurada = await verificarOtimizacaoBateria()
      setPrecisaConfigurarBateria(!batteriaConfigurada)

      // Contar notificações agendadas
      const agendadas = await listarNotificacoesAgendadas()
      setNotificacoesAgendadas(agendadas.length)
    } catch (error) {
      console.error('Erro ao verificar permissões:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Solicitar permissão de notificação
  const solicitarPermissao = useCallback(async (): Promise<boolean> => {
    const concedida = await solicitarPermissaoNotificacao()
    setPermissaoConcedida(concedida)
    await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_ASKED, 'true')

    if (concedida) {
      // Registrar push token para receber notificações do servidor
      await registrarPushToken()
      // Buscar agendamentos e reagendar notificações
      await reagendarTodas()
    }

    return concedida
  }, [])

  // Abrir configurações de bateria
  const abrirConfigBateria = useCallback(async () => {
    await abrirConfiguracoesBateria()
    await AsyncStorage.setItem(STORAGE_KEYS.BATTERY_ASKED, 'true')
    setPrecisaConfigurarBateria(false)
  }, [])

  // Abrir configurações de notificação
  const abrirConfigNotificacao = useCallback(async () => {
    await abrirConfiguracoesNotificacao()
  }, [])

  // Testar notificação
  const testarNotificacao = useCallback(async () => {
    await enviarNotificacaoTeste()
  }, [])

  // Reagendar todas as notificações
  const reagendarTodas = useCallback(async () => {
    try {
      // Buscar todos os agendamentos ativos
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('status', 'agendado')
        .gte('data', new Date().toISOString().split('T')[0])

      if (agendamentos) {
        await reagendarNotificacoesPendentes(agendamentos)

        // Atualizar contador
        const agendadas = await listarNotificacoesAgendadas()
        setNotificacoesAgendadas(agendadas.length)
      }
    } catch (error) {
      console.error('Erro ao reagendar notificações:', error)
    }
  }, [])

  // Inicialização e listeners
  useEffect(() => {
    // Verificar permissões ao montar
    verificarPermissoes()

    // Registrar push token se já tiver permissão
    verificarPermissaoNotificacao().then(async (temPermissao) => {
      if (temPermissao) {
        await registrarPushToken()
      }
    })

    // Configurar listeners de notificação
    const cleanup = configurarListenerNotificacao(
      // Notificação recebida em foreground
      (notification) => {
        console.log('📬 Notificação recebida:', notification.request.content.title)
      },
      // Usuário tocou na notificação
      (response) => {
        const data = response.notification.request.content.data
        console.log('👆 Usuário tocou na notificação:', data)
        // Aqui você pode navegar para uma tela específica baseado no data
      }
    )

    // Listener para quando o app volta do background
    const appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App voltou ao foreground')
        // Reverificar permissões quando o app volta
        await verificarPermissoes()
      }
      appState.current = nextAppState
    })

    return () => {
      cleanup()
      appStateSubscription.remove()
    }
  }, [verificarPermissoes])

  return {
    permissaoConcedida,
    precisaConfigurarBateria,
    loading,
    notificacoesAgendadas,
    solicitarPermissao,
    abrirConfigBateria,
    abrirConfigNotificacao,
    testarNotificacao,
    reagendarTodas,
    verificarPermissoes,
  }
}

// Hook simplificado para usar nas telas que só precisam verificar
export function useNotificationPermission(): { concedida: boolean; loading: boolean } {
  const [concedida, setConcedida] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verificarPermissaoNotificacao()
      .then(setConcedida)
      .finally(() => setLoading(false))
  }, [])

  return { concedida, loading }
}
