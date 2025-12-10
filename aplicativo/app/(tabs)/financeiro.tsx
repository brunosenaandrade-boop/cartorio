import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui'
import { useFinanceiro } from '@/hooks'
import { Colors } from '@/constants/colors'
import { formatarMoeda, getNomeMes } from '@/lib/utils'

export default function FinanceiroScreen() {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())

  const { dados, loading } = useFinanceiro(anoAtual, mesAtual)

  const mesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11)
      setAnoAtual(anoAtual - 1)
    } else {
      setMesAtual(mesAtual - 1)
    }
  }

  const proximoMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0)
      setAnoAtual(anoAtual + 1)
    } else {
      setMesAtual(mesAtual + 1)
    }
  }

  // Calcular porcentagens para o gráfico de pizza
  const total = dados.totalManha + dados.totalTarde
  const percentManha = total > 0 ? (dados.totalManha / total) * 100 : 50
  const percentTarde = total > 0 ? (dados.totalTarde / total) * 100 : 50

  const handleExportar = async () => {
    const texto = `
Relatório Financeiro - ${getNomeMes(mesAtual)} ${anoAtual}

Total do Mês: ${formatarMoeda(dados.totalMes)}
Total do Ano: ${formatarMoeda(dados.totalAno)}

Distribuição:
- Manhã (09:15): ${formatarMoeda(dados.totalManha)}
- Tarde (15:00): ${formatarMoeda(dados.totalTarde)}

Total de recibos: ${dados.recibos.length}

---
Seu Motorista VIP
    `.trim()

    try {
      await Share.share({
        message: texto,
        title: 'Relatório Financeiro'
      })
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  return (
    <LinearGradient
      colors={[Colors.primary[700], Colors.primary[600], Colors.primary[500]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Financeiro</Text>
        </View>

        {/* Seletor de Mês */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={mesAnterior} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <Text style={styles.monthText}>
            {getNomeMes(mesAtual)} {anoAtual}
          </Text>

          <TouchableOpacity onPress={proximoMes} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.white} style={styles.loader} />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cards de Totais */}
            <View style={styles.totalsRow}>
              <Card style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total do Mês</Text>
                <Text style={styles.totalValue}>{formatarMoeda(dados.totalMes)}</Text>
              </Card>

              <Card style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total do Ano</Text>
                <Text style={[styles.totalValue, styles.totalAno]}>
                  {formatarMoeda(dados.totalAno)}
                </Text>
              </Card>
            </View>

            {/* Gráfico de Pizza Simples */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Distribuição por Horário</Text>

              <View style={styles.chartContainer}>
                {/* Legenda */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.primary[500] }]} />
                    <View>
                      <Text style={styles.legendLabel}>Manhã (09:15)</Text>
                      <Text style={styles.legendValue}>{formatarMoeda(dados.totalManha)}</Text>
                      <Text style={styles.legendPercent}>{percentManha.toFixed(0)}%</Text>
                    </View>
                  </View>

                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.accent[500] }]} />
                    <View>
                      <Text style={styles.legendLabel}>Tarde (15:00)</Text>
                      <Text style={styles.legendValue}>{formatarMoeda(dados.totalTarde)}</Text>
                      <Text style={styles.legendPercent}>{percentTarde.toFixed(0)}%</Text>
                    </View>
                  </View>
                </View>

                {/* Barra de progresso */}
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressManha,
                      { flex: percentManha }
                    ]}
                  />
                  <View
                    style={[
                      styles.progressTarde,
                      { flex: percentTarde }
                    ]}
                  />
                </View>
              </View>
            </Card>

            {/* Resumo */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recibos no mês</Text>
                <Text style={styles.summaryValue}>{dados.recibos.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Diligências manhã</Text>
                <Text style={styles.summaryValue}>
                  {dados.recibos.filter(r => r.agendamento?.horario === '09:15').length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Diligências tarde</Text>
                <Text style={styles.summaryValue}>
                  {dados.recibos.filter(r => r.agendamento?.horario === '15:00').length}
                </Text>
              </View>
            </Card>

            {/* Botão Exportar */}
            <TouchableOpacity style={styles.exportButton} onPress={handleExportar}>
              <Ionicons name="share-outline" size={20} color={Colors.white} />
              <Text style={styles.exportText}>Exportar Relatório</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  arrowButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginHorizontal: 20,
  },
  loader: {
    paddingVertical: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  totalCard: {
    flex: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.success[600],
  },
  totalAno: {
    color: Colors.primary[600],
  },
  chartCard: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginBottom: 16,
  },
  chartContainer: {
    gap: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  legendLabel: {
    fontSize: 13,
    color: Colors.gray[600],
  },
  legendValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
    marginTop: 2,
  },
  legendPercent: {
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 2,
  },
  progressBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.gray[200],
  },
  progressManha: {
    backgroundColor: Colors.primary[500],
  },
  progressTarde: {
    backgroundColor: Colors.accent[500],
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  exportText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
})
