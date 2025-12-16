import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Card, Button, Input } from '@/components/ui'
import { useIndisponibilidades } from '@/hooks'
import { Colors } from '@/constants/colors'
import { formatarData, getNomeDiaSemana } from '@/lib/utils'

export default function IndisponivelScreen() {
  const {
    indisponibilidades,
    loading,
    adicionarIndisponibilidade,
    removerIndisponibilidade
  } = useIndisponibilidades()

  const [dataSelecionada, setDataSelecionada] = useState('')
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)

  const handleAdicionar = async () => {
    if (!dataSelecionada) {
      Alert.alert('Atenção', 'Selecione uma data')
      return
    }

    setSalvando(true)
    const resultado = await adicionarIndisponibilidade(dataSelecionada, motivo)
    setSalvando(false)

    if (resultado.success) {
      setDataSelecionada('')
      setMotivo('')
      Alert.alert('Sucesso', 'Data marcada como indisponível')
    } else {
      Alert.alert('Erro', resultado.error || 'Não foi possível salvar')
    }
  }

  const handleRemover = (id: string, data: string) => {
    Alert.alert(
      'Remover Indisponibilidade',
      `Deseja remover a indisponibilidade de ${formatarData(data)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const resultado = await removerIndisponibilidade(id)
            if (!resultado.success) {
              Alert.alert('Erro', resultado.error || 'Não foi possível remover')
            }
          }
        }
      ]
    )
  }

  // Data mínima: hoje
  const dataMinima = new Date().toISOString().split('T')[0]

  return (
    <LinearGradient
      colors={[Colors.primary[700], Colors.primary[600], Colors.primary[500]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dias Indisponíveis</Text>
          <Text style={styles.subtitle}>
            Marque os dias em que você não poderá fazer diligências
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Formulário */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Adicionar Nova Data</Text>

            <Input
              label="Data"
              placeholder="AAAA-MM-DD"
              value={dataSelecionada}
              onChangeText={setDataSelecionada}
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Motivo (opcional)"
              placeholder="Ex: Consulta médica, viagem..."
              value={motivo}
              onChangeText={setMotivo}
              containerStyle={styles.inputContainer}
            />

            <Button
              title="Marcar como Indisponível"
              onPress={handleAdicionar}
              loading={salvando}
              style={styles.addButton}
            />
          </Card>

          {/* Lista de Indisponibilidades */}
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Datas Marcadas</Text>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.white} style={styles.loader} />
            ) : indisponibilidades.length === 0 ? (
              <Card variant="glass" style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={48} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyText}>
                  Você está disponível em todos os dias!
                </Text>
              </Card>
            ) : (
              indisponibilidades.map(item => {
                const dataObj = new Date(item.data + 'T00:00:00')
                const diaSemana = getNomeDiaSemana(dataObj.getDay())

                return (
                  <Card key={item.id} style={styles.itemCard}>
                    <View style={styles.itemContent}>
                      <View style={styles.itemInfo}>
                        <View style={styles.itemDateRow}>
                          <Ionicons name="calendar" size={18} color={Colors.danger[500]} />
                          <Text style={styles.itemDate}>{formatarData(item.data)}</Text>
                          <Text style={styles.itemDay}>{diaSemana}</Text>
                        </View>
                        {item.motivo && (
                          <Text style={styles.itemMotivo}>{item.motivo}</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemover(item.id, item.data)}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.danger[500]} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                )
              })
            )}
          </View>
        </ScrollView>
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
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  addButton: {
    marginTop: 8,
  },
  listSection: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  loader: {
    paddingVertical: 40,
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
  itemCard: {
    marginBottom: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  itemDay: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  itemMotivo: {
    fontSize: 13,
    color: Colors.gray[600],
    marginTop: 4,
    marginLeft: 26,
  },
  removeButton: {
    padding: 8,
  },
})
