import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '@/constants/colors'
import { useNotifications } from '@/hooks'
import { Card } from '@/components/ui'
import {
  listarNotificacoesAgendadas,
  cancelarTodasNotificacoes,
  enviarNotificacaoTeste,
} from '@/lib/notifications'

export default function ConfiguracoesScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [notificacoesListadas, setNotificacoesListadas] = useState<number>(0)

  const {
    permissaoConcedida,
    precisaConfigurarBateria,
    notificacoesAgendadas,
    loading,
    solicitarPermissao,
    abrirConfigBateria,
    abrirConfigNotificacao,
    testarNotificacao,
    reagendarTodas,
    verificarPermissoes,
  } = useNotifications()

  const onRefresh = async () => {
    setRefreshing(true)
    await verificarPermissoes()
    const agendadas = await listarNotificacoesAgendadas()
    setNotificacoesListadas(agendadas.length)
    setRefreshing(false)
  }

  const handleTestarNotificacao = async () => {
    await testarNotificacao()
    Alert.alert('Sucesso', 'Notificacao de teste enviada!')
  }

  const handleReagendar = async () => {
    Alert.alert(
      'Reagendar Notificacoes',
      'Isso vai cancelar todas as notificacoes atuais e reagendar baseado nos agendamentos ativos. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reagendar',
          onPress: async () => {
            await reagendarTodas()
            Alert.alert('Sucesso', 'Notificacoes reagendadas!')
            onRefresh()
          },
        },
      ]
    )
  }

  const handleLimparNotificacoes = async () => {
    Alert.alert(
      'Limpar Notificacoes',
      'Isso vai cancelar TODAS as notificacoes agendadas. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await cancelarTodasNotificacoes()
            Alert.alert('Sucesso', 'Todas as notificacoes foram canceladas!')
            onRefresh()
          },
        },
      ]
    )
  }

  const handleResetSetup = async () => {
    Alert.alert(
      'Resetar Configuracao',
      'Isso vai mostrar o assistente de configuracao novamente na proxima vez que abrir o app. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          onPress: async () => {
            await AsyncStorage.removeItem('setup_notificacoes_completo')
            Alert.alert('Sucesso', 'Feche e abra o app para ver o assistente.')
          },
        },
      ]
    )
  }

  const handleVerNotificacoes = async () => {
    const agendadas = await listarNotificacoesAgendadas()
    setNotificacoesListadas(agendadas.length)

    if (agendadas.length === 0) {
      Alert.alert('Notificacoes Agendadas', 'Nenhuma notificacao agendada.')
      return
    }

    const lista = agendadas.slice(0, 5).map((n, i) => {
      const data = n.trigger && 'date' in n.trigger
        ? new Date(n.trigger.date as number).toLocaleString('pt-BR')
        : 'Imediata'
      return `${i + 1}. ${n.content.title}\n   ${data}`
    }).join('\n\n')

    const mensagem = agendadas.length > 5
      ? `${lista}\n\n... e mais ${agendadas.length - 5} notificacoes`
      : lista

    Alert.alert(`Notificacoes Agendadas (${agendadas.length})`, mensagem)
  }

  return (
    <LinearGradient
      colors={[Colors.primary[600], Colors.primary[700], Colors.primary[800]]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.white}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configuracoes</Text>
          <Text style={styles.subtitle}>Gerencie notificacoes e bateria</Text>
        </View>

        {/* Status das Permissoes */}
        <Card variant="glass">
          <Text style={styles.sectionTitle}>Status</Text>

          <View style={styles.statusItem}>
            <View style={styles.statusLeft}>
              <Ionicons
                name={permissaoConcedida ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={permissaoConcedida ? Colors.success : Colors.error}
              />
              <Text style={styles.statusText}>Permissao de Notificacoes</Text>
            </View>
            {!permissaoConcedida && (
              <TouchableOpacity
                style={styles.statusButton}
                onPress={solicitarPermissao}
              >
                <Text style={styles.statusButtonText}>Permitir</Text>
              </TouchableOpacity>
            )}
          </View>

          {Platform.OS === 'android' && (
            <View style={styles.statusItem}>
              <View style={styles.statusLeft}>
                <Ionicons
                  name={!precisaConfigurarBateria ? 'checkmark-circle' : 'warning'}
                  size={24}
                  color={!precisaConfigurarBateria ? Colors.success : Colors.warning}
                />
                <Text style={styles.statusText}>Otimizacao de Bateria</Text>
              </View>
              <TouchableOpacity
                style={styles.statusButton}
                onPress={abrirConfigBateria}
              >
                <Text style={styles.statusButtonText}>Configurar</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.statusItem}>
            <View style={styles.statusLeft}>
              <Ionicons name="notifications" size={24} color={Colors.gold[500]} />
              <Text style={styles.statusText}>Notificacoes Agendadas</Text>
            </View>
            <TouchableOpacity onPress={handleVerNotificacoes}>
              <Text style={styles.countBadge}>{notificacoesAgendadas}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Acoes de Notificacao */}
        <Card variant="glass">
          <Text style={styles.sectionTitle}>Notificacoes</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTestarNotificacao}
            disabled={!permissaoConcedida}
          >
            <Ionicons name="paper-plane-outline" size={22} color={Colors.white} />
            <Text style={styles.actionButtonText}>Enviar Notificacao de Teste</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReagendar}
            disabled={!permissaoConcedida}
          >
            <Ionicons name="refresh-outline" size={22} color={Colors.white} />
            <Text style={styles.actionButtonText}>Reagendar Todas as Notificacoes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleVerNotificacoes}
          >
            <Ionicons name="list-outline" size={22} color={Colors.white} />
            <Text style={styles.actionButtonText}>Ver Notificacoes Agendadas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleLimparNotificacoes}
          >
            <Ionicons name="trash-outline" size={22} color={Colors.error} />
            <Text style={[styles.actionButtonText, styles.dangerText]}>
              Cancelar Todas as Notificacoes
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Configuracoes do Sistema */}
        <Card variant="glass">
          <Text style={styles.sectionTitle}>Sistema</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={abrirConfigNotificacao}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.white} />
            <Text style={styles.actionButtonText}>Abrir Configuracoes do App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleResetSetup}
          >
            <Ionicons name="reload-outline" size={22} color={Colors.white} />
            <Text style={styles.actionButtonText}>Mostrar Assistente de Setup</Text>
          </TouchableOpacity>
        </Card>

        {/* Informacoes */}
        <Card variant="glass">
          <Text style={styles.sectionTitle}>Sobre as Notificacoes</Text>
          <Text style={styles.infoText}>
            Voce recebera notificacoes nos seguintes momentos:
          </Text>
          <View style={styles.infoList}>
            <InfoItem icon="flash" text="Imediatamente quando uma diligencia e agendada" />
            <InfoItem icon="time" text="As 18h do dia anterior" />
            <InfoItem icon="moon" text="As 21h do dia anterior" />
            <InfoItem icon="sunny" text="As 8h do dia da diligencia" />
          </View>
          <Text style={styles.infoNote}>
            Para garantir que as notificacoes funcionem mesmo com o app fechado,
            desative a otimizacao de bateria para este app.
          </Text>
        </Card>
      </ScrollView>
    </LinearGradient>
  )
}

function InfoItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon as any} size={18} color={Colors.gold[500]} />
      <Text style={styles.infoItemText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[300],
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    color: Colors.gray[200],
  },
  statusButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  countBadge: {
    backgroundColor: Colors.gold[500],
    color: Colors.primary[900],
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: 'rgba(229, 62, 62, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(229, 62, 62, 0.3)',
  },
  dangerText: {
    color: Colors.error,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray[300],
    marginBottom: 12,
  },
  infoList: {
    gap: 10,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoItemText: {
    fontSize: 13,
    color: Colors.gray[200],
    flex: 1,
  },
  infoNote: {
    fontSize: 12,
    color: Colors.gray[400],
    fontStyle: 'italic',
    lineHeight: 18,
  },
})
