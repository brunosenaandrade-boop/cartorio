import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Erro no App</Text>
            <Text style={styles.subtitle}>O app encontrou um problema</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={styles.errorTitle}>Mensagem do erro:</Text>
            <Text style={styles.errorText}>
              {this.state.error?.message || 'Erro desconhecido'}
            </Text>

            <Text style={styles.errorTitle}>Stack trace:</Text>
            <Text style={styles.stackText}>
              {this.state.error?.stack || 'Sem stack trace'}
            </Text>

            {this.state.errorInfo && (
              <>
                <Text style={styles.errorTitle}>Component Stack:</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a365d',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#93c5fd',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#3182ce',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
