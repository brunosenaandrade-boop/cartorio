import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Colors } from '@/constants/colors'

interface CardProps {
  children: React.ReactNode
  variant?: 'glass' | 'solid'
  style?: ViewStyle
}

export function Card({ children, variant = 'solid', style }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  solid: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
})
