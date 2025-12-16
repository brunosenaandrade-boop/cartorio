import React from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle
} from 'react-native'
import { Colors } from '@/constants/colors'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={Colors.gray[400]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.gray[900],
  },
  inputError: {
    borderColor: Colors.danger[500],
  },
  error: {
    fontSize: 12,
    color: Colors.danger[500],
    marginTop: 4,
  },
})
