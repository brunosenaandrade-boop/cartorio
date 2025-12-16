import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { DiligenciaCard } from '@/components/DiligenciaCard'
import { useAgendamentos } from '@/hooks'
import { Colors } from '@/constants/colors'
import { FiltroAgendamentos } from '@/types'

type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'todos'

const filtroLabels: Record<PeriodoFiltro, string> = {
  hoje: 'Hoje',
  semana: 'Semana',
  mes: 'Mês',
  todos: 'Todos'
}

export default function AgendamentosScreen() {
  const [filtro, setFiltro] = useState<FiltroAgendamentos>({ periodo: 'semana' })
  const { agendamentos, loading, refetch } = useAgendamentos(filtro)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const changeFiltro = (periodo: PeriodoFiltro) => {
    setFiltro({ ...filtro, periodo })
  }

  return (
    <LinearGradient
      colors={[Colors.primary[700], Colors.primary[600], Colors.primary[500]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Agendamentos</Text>
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(Object.keys(filtroLabels) as PeriodoFiltro[]).map((periodo) => (
              <TouchableOpacity
                key={periodo}
                style={[
                  styles.filterButton,
                  filtro.periodo === periodo && styles.filterButtonActive
                ]}
                onPress={() => changeFiltro(periodo)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filtro.periodo === periodo && styles.filterTextActive
                  ]}
                >
                  {filtroLabels[periodo]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Contador */}
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Lista */}
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
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
            </View>
          ) : (
            agendamentos.map(agendamento => (
              <DiligenciaCard
                key={agendamento.id}
                agendamento={agendamento}
              />
            ))
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  filterButtonActive: {
    backgroundColor: Colors.white,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterTextActive: {
    color: Colors.primary[700],
  },
  counter: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  counterText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
  },
})
