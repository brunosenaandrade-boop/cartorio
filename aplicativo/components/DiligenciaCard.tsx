import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card, Badge } from './ui'
import { Colors } from '@/constants/colors'
import { Agendamento } from '@/types'
import { formatarData, isHoje, isAmanha, abrirGoogleMaps, abrirWaze } from '@/lib/utils'

interface DiligenciaCardProps {
  agendamento: Agendamento
  onPress?: () => void
  showActions?: boolean
}

export function DiligenciaCard({
  agendamento,
  onPress,
  showActions = true
}: DiligenciaCardProps) {
  const enderecoCompleto = `${agendamento.endereco}, ${agendamento.numero}`

  const getDataLabel = () => {
    if (isHoje(agendamento.data)) return 'Hoje'
    if (isAmanha(agendamento.data)) return 'Amanhã'
    return formatarData(agendamento.data)
  }

  const handleMaps = () => {
    abrirGoogleMaps(enderecoCompleto, agendamento.cidade, agendamento.estado)
  }

  const handleWaze = () => {
    abrirWaze(enderecoCompleto, agendamento.cidade, agendamento.estado)
  }

  return (
    <Card style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dateTime}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary[500]} />
              <Text style={styles.dateText}>{getDataLabel()}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={Colors.primary[500]} />
              <Text style={styles.timeText}>{agendamento.horario}</Text>
            </View>
          </View>
          <Badge status={agendamento.status} />
        </View>

        {/* Escrevente */}
        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color={Colors.gray[500]} />
          <Text style={styles.escreventeText}>{agendamento.escrevente_nome}</Text>
        </View>

        {/* Endereço */}
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={16} color={Colors.gray[500]} style={styles.addressIcon} />
          <View style={styles.addressText}>
            <Text style={styles.addressLine}>
              {agendamento.endereco}, {agendamento.numero}
              {agendamento.complemento && ` - ${agendamento.complemento}`}
            </Text>
            <Text style={styles.addressLine2}>
              {agendamento.bairro} - {agendamento.cidade}/{agendamento.estado}
            </Text>
          </View>
        </View>

        {/* Observações */}
        {agendamento.observacoes && (
          <View style={styles.obsContainer}>
            <Text style={styles.obsText}>{agendamento.observacoes}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Ações de navegação */}
      {showActions && agendamento.status === 'agendado' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMaps}>
            <Ionicons name="map-outline" size={20} color={Colors.primary[500]} />
            <Text style={styles.actionText}>Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleWaze}>
            <Ionicons name="navigate-outline" size={20} color={Colors.primary[500]} />
            <Text style={styles.actionText}>Waze</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTime: {
    flexDirection: 'row',
    gap: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  escreventeText: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addressIcon: {
    marginTop: 2,
  },
  addressText: {
    flex: 1,
  },
  addressLine: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  addressLine2: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  obsContainer: {
    backgroundColor: Colors.gray[50],
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  obsText: {
    fontSize: 13,
    color: Colors.gray[600],
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: Colors.primary[50],
    borderRadius: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
})
