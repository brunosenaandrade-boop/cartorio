import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, StatusColors } from '@/constants/colors'
import { StatusAgendamento } from '@/types'

interface BadgeProps {
  status: StatusAgendamento
}

const statusLabels: Record<StatusAgendamento, string> = {
  agendado: 'Agendado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export function Badge({ status }: BadgeProps) {
  const colors = StatusColors[status]

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {statusLabels[status]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})
