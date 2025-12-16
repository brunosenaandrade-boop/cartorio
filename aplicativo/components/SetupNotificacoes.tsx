import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '@/constants/colors'
import { useNotifications } from '@/hooks/useNotifications'

const STORAGE_KEY_SETUP_COMPLETO = 'setup_notificacoes_completo'

interface SetupNotificacoesProps {
  onComplete?: () => void
}

type SetupStep = 'welcome' | 'notification' | 'battery' | 'complete'

export function SetupNotificacoes({ onComplete }: SetupNotificacoesProps) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState<SetupStep>('welcome')
  const [carregando, setCarregando] = useState(false)

  const {
    permissaoConcedida,
    solicitarPermissao,
    abrirConfigBateria,
    testarNotificacao,
  } = useNotifications()

  // Verificar se setup já foi feito
  useEffect(() => {
    const verificarSetup = async () => {
      const setupCompleto = await AsyncStorage.getItem(STORAGE_KEY_SETUP_COMPLETO)
      if (!setupCompleto) {
        setVisible(true)
      }
    }
    verificarSetup()
  }, [])

  const handleSolicitarPermissao = async () => {
    setCarregando(true)
    const concedida = await solicitarPermissao()
    setCarregando(false)

    if (concedida) {
      // No Android, vai para configuração de bateria
      if (Platform.OS === 'android') {
        setStep('battery')
      } else {
        setStep('complete')
      }
    }
  }

  const handleConfigurarBateria = async () => {
    await abrirConfigBateria()
    // Aguarda um pouco e vai para o próximo passo
    setTimeout(() => {
      setStep('complete')
    }, 1000)
  }

  const handlePularBateria = () => {
    setStep('complete')
  }

  const handleTestarNotificacao = async () => {
    setCarregando(true)
    await testarNotificacao()
    setCarregando(false)
  }

  const handleConcluir = async () => {
    await AsyncStorage.setItem(STORAGE_KEY_SETUP_COMPLETO, 'true')
    setVisible(false)
    onComplete?.()
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={80} color={Colors.gold[500]} />
            </View>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>
              Para garantir que você nunca perca uma diligência, precisamos configurar as notificações.
            </Text>
            <Text style={styles.description}>
              Você receberá alertas quando:
            </Text>
            <View style={styles.bulletList}>
              <BulletItem text="Uma nova diligência for agendada" />
              <BulletItem text="Lembrete às 18h do dia anterior" />
              <BulletItem text="Lembrete às 21h do dia anterior" />
              <BulletItem text="Alerta às 8h do dia da diligência" />
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep('notification')}
            >
              <Text style={styles.primaryButtonText}>Começar Configuração</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )

      case 'notification':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={permissaoConcedida ? 'checkmark-circle' : 'notifications-outline'}
                size={80}
                color={permissaoConcedida ? Colors.success : Colors.gold[500]}
              />
            </View>
            <Text style={styles.title}>Permissão de Notificações</Text>
            <Text style={styles.subtitle}>
              {permissaoConcedida
                ? 'Ótimo! Permissão concedida!'
                : 'Precisamos da sua permissão para enviar notificações.'}
            </Text>
            {!permissaoConcedida && (
              <Text style={styles.description}>
                Ao clicar no botão abaixo, o Android vai perguntar se você permite notificações. Toque em "Permitir".
              </Text>
            )}
            {permissaoConcedida ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => Platform.OS === 'android' ? setStep('battery') : setStep('complete')}
              >
                <Text style={styles.primaryButtonText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, carregando && styles.buttonDisabled]}
                onPress={handleSolicitarPermissao}
                disabled={carregando}
              >
                <Text style={styles.primaryButtonText}>
                  {carregando ? 'Aguarde...' : 'Permitir Notificações'}
                </Text>
                <Ionicons name="notifications" size={20} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        )

      case 'battery':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="battery-charging" size={80} color={Colors.gold[500]} />
            </View>
            <Text style={styles.title}>Otimização de Bateria</Text>
            <Text style={styles.subtitle}>
              Para notificações confiáveis, desative a otimização de bateria para este app.
            </Text>
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>Siga estes passos:</Text>
              <View style={styles.bulletList}>
                <BulletItem text="1. Clique em 'Configurar' abaixo" />
                <BulletItem text="2. Encontre 'Bateria' ou 'Economia de energia'" />
                <BulletItem text="3. Selecione 'Sem restrições' ou 'Não otimizar'" />
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleConfigurarBateria}
            >
              <Text style={styles.primaryButtonText}>Configurar Bateria</Text>
              <Ionicons name="settings-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePularBateria}
            >
              <Text style={styles.secondaryButtonText}>Pular por agora</Text>
            </TouchableOpacity>
          </View>
        )

      case 'complete':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
            </View>
            <Text style={styles.title}>Tudo Pronto!</Text>
            <Text style={styles.subtitle}>
              As notificações estão configuradas. Você será alertado sobre todas as diligências.
            </Text>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestarNotificacao}
              disabled={carregando}
            >
              <Ionicons name="paper-plane-outline" size={20} color={Colors.primary[600]} />
              <Text style={styles.testButtonText}>
                {carregando ? 'Enviando...' : 'Enviar Notificação de Teste'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleConcluir}
            >
              <Text style={styles.primaryButtonText}>Começar a Usar</Text>
              <Ionicons name="car" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )
    }
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={[Colors.primary[700], Colors.primary[800], Colors.primary[900]]}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderStep()}
          </ScrollView>
          <View style={styles.stepIndicator}>
            {['welcome', 'notification', 'battery', 'complete'].map((s, index) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  step === s && styles.stepDotActive,
                  ['welcome', 'notification', 'battery', 'complete'].indexOf(step) > index && styles.stepDotCompleted,
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  )
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletItem}>
      <Ionicons name="checkmark" size={16} color={Colors.gold[500]} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[300],
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
    marginBottom: 16,
  },
  bulletList: {
    width: '100%',
    marginBottom: 24,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  bulletText: {
    fontSize: 14,
    color: Colors.gray[200],
    marginLeft: 12,
    flex: 1,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold[400],
    marginBottom: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    marginTop: 12,
    padding: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Colors.gray[400],
    textDecorationLine: 'underline',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepDotActive: {
    backgroundColor: Colors.gold[500],
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
  },
})
