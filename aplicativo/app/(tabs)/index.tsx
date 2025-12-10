import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui'
import { DiligenciaCard } from '@/components/DiligenciaCard'
import { useProximosAgendamentos } from '@/hooks'
import { Colors } from '@/constants/colors'
import { formatarDataISO } from '@/lib/utils'

export default function HomeScreen() {
  const { agendamentos, loading, refetch } = useProximosAgendamentos()
  const [refreshing, setRefreshing] = React.useState(false)

  const hoje = formatarDataISO(new Date())
  const agendamentosHoje = agendamentos.filter(a => a.data === hoje)
  const agendamentosFuturos = agendamentos.filter(a => a.data !== hoje)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <LinearGradient
      colors={[Colors.primary[700], Colors.primary[600], Colors.primary[500]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Bruno!</Text>
            <Text style={styles.subtitle}>Seu Motorista VIP</Text>
          </View>
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={28} color={Colors.white} />
          </View>
        </View>

        {/* Resumo do Dia */}
        <Card variant="glass" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Diligências Hoje</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{agendamentosHoje.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {agendamentosHoje.filter(a => a.horario === '09:15').length}
              </Text>
              <Text style={styles.summaryLabel}>Manhã</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {agendamentosHoje.filter(a => a.horario === '15:00').length}
              </Text>
              <Text style={styles.summaryLabel}>Tarde</Text>
            </View>
          </View>
        </Card>

        {/* Lista de Agendamentos */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.white}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.white} />
            </View>
          ) : agendamentos.length === 0 ? (
            <Card variant="glass" style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>
                Nenhuma diligência para hoje ou amanhã
              </Text>
            </Card>
          ) : (
            <>
              {/* Agendamentos de Hoje */}
              {agendamentosHoje.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Hoje</Text>
                  {agendamentosHoje.map(agendamento => (
                    <DiligenciaCard
                      key={agendamento.id}
                      agendamento={agendamento}
                    />
                  ))}
                </View>
              )}

              {/* Agendamentos Futuros */}
              {agendamentosFuturos.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Próximos</Text>
                  {agendamentosFuturos.map(agendamento => (
                    <DiligenciaCard
                      key={agendamento.id}
                      agendamento={agendamento}
                    />
                  ))}
                </View>
              )}
            </>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
})
