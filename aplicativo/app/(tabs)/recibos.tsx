import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Card, Button } from '@/components/ui'
import { useRecibos } from '@/hooks'
import { Colors } from '@/constants/colors'
import { formatarData, formatarMoeda, mascaraMoeda, parseMoeda } from '@/lib/utils'
import { Agendamento } from '@/types'

export default function RecibosScreen() {
  const { recibos, agendamentosSemRecibo, loading, criarRecibo, refetch } = useRecibos()
  const [modalVisible, setModalVisible] = useState(false)
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)
  const [valorInput, setValorInput] = useState('')
  const [salvando, setSalvando] = useState(false)

  const handleAbrirModal = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento)
    setValorInput('')
    setModalVisible(true)
  }

  const handleSalvarRecibo = async () => {
    if (!agendamentoSelecionado) return

    const valor = parseMoeda(valorInput)
    if (valor <= 0) {
      Alert.alert('Atenção', 'Informe um valor válido')
      return
    }

    setSalvando(true)
    const resultado = await criarRecibo(agendamentoSelecionado.id, valor)
    setSalvando(false)

    if (resultado.success) {
      setModalVisible(false)
      Alert.alert('Sucesso', 'Recibo registrado com sucesso!')
    } else {
      Alert.alert('Erro', resultado.error || 'Não foi possível salvar')
    }
  }

  const handleValorChange = (text: string) => {
    setValorInput(mascaraMoeda(text))
  }

  return (
    <LinearGradient
      colors={[Colors.primary[700], Colors.primary[600], Colors.primary[500]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recibos</Text>
          <Text style={styles.subtitle}>
            Registre os valores recebidos nas diligências
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color={Colors.white} style={styles.loader} />
          ) : (
            <>
              {/* Diligências Pendentes de Recibo */}
              {agendamentosSemRecibo.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    <Ionicons name="alert-circle" size={18} color={Colors.accent[400]} />
                    {' '}Pendentes de Recibo
                  </Text>

                  {agendamentosSemRecibo.map(agendamento => (
                    <Card key={agendamento.id} style={styles.pendingCard}>
                      <View style={styles.pendingInfo}>
                        <View style={styles.pendingHeader}>
                          <Text style={styles.pendingDate}>
                            {formatarData(agendamento.data)} - {agendamento.horario}
                          </Text>
                        </View>
                        <Text style={styles.pendingEscrevente}>
                          {agendamento.escrevente_nome}
                        </Text>
                        <Text style={styles.pendingEndereco}>
                          {agendamento.endereco}, {agendamento.numero}
                        </Text>
                      </View>

                      <Button
                        title="Registrar Valor"
                        onPress={() => handleAbrirModal(agendamento)}
                        size="sm"
                        style={styles.registerButton}
                      />
                    </Card>
                  ))}
                </View>
              )}

              {/* Recibos Registrados */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success[500]} />
                  {' '}Recibos Registrados
                </Text>

                {recibos.length === 0 ? (
                  <Card variant="glass" style={styles.emptyCard}>
                    <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.emptyText}>
                      Nenhum recibo registrado ainda
                    </Text>
                  </Card>
                ) : (
                  recibos.map(recibo => (
                    <Card key={recibo.id} style={styles.reciboCard}>
                      <View style={styles.reciboHeader}>
                        <View>
                          <Text style={styles.reciboDate}>
                            {recibo.agendamento && formatarData(recibo.agendamento.data)}
                          </Text>
                          <Text style={styles.reciboEscrevente}>
                            {recibo.agendamento?.escrevente_nome}
                          </Text>
                        </View>
                        <Text style={styles.reciboValor}>
                          {formatarMoeda(recibo.valor)}
                        </Text>
                      </View>
                    </Card>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Modal de Valor */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Registrar Recibo</Text>

              {agendamentoSelecionado && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    {formatarData(agendamentoSelecionado.data)} - {agendamentoSelecionado.horario}
                  </Text>
                  <Text style={styles.modalInfoText}>
                    {agendamentoSelecionado.escrevente_nome}
                  </Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Valor Recebido</Text>
              <TextInput
                style={styles.valorInput}
                value={valorInput}
                onChangeText={handleValorChange}
                placeholder="R$ 0,00"
                keyboardType="numeric"
                autoFocus
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                  disabled={salvando}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <Button
                  title="Salvar"
                  onPress={handleSalvarRecibo}
                  loading={salvando}
                  style={styles.saveButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loader: {
    paddingVertical: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  pendingCard: {
    marginBottom: 8,
  },
  pendingInfo: {
    marginBottom: 12,
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingDate: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  pendingEscrevente: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 4,
  },
  pendingEndereco: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  registerButton: {
    alignSelf: 'flex-start',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    textAlign: 'center',
  },
  reciboCard: {
    marginBottom: 8,
  },
  reciboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reciboDate: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  reciboEscrevente: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  reciboValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInfo: {
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalInfoText: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: 8,
  },
  valorInput: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  saveButton: {
    flex: 1,
  },
})
