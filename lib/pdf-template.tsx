import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a365d'
  },
  logoContainer: {
    flexDirection: 'column'
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a365d'
  },
  logoSubtext: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2
  },
  reciboNumero: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right'
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#1a365d',
    textTransform: 'uppercase',
    letterSpacing: 2
  },
  secao: {
    marginBottom: 20
  },
  secaoTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  infoItem: {
    width: '50%',
    marginBottom: 8
  },
  infoItemFull: {
    width: '100%',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: 11,
    color: '#333333'
  },
  valorContainer: {
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9ae6b4'
  },
  valorLabel: {
    fontSize: 10,
    color: '#276749',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  valorNumero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#276749'
  },
  valorExtenso: {
    fontSize: 10,
    color: '#276749',
    marginTop: 5,
    fontStyle: 'italic'
  },
  declaracao: {
    fontSize: 10,
    color: '#4a5568',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    lineHeight: 1.5
  },
  assinaturaContainer: {
    marginTop: 40,
    alignItems: 'center'
  },
  assinaturaCursiva: {
    fontFamily: 'Times-Italic',
    fontSize: 28,
    color: '#1a365d',
    marginBottom: 5
  },
  assinaturaLinha: {
    width: 250,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 8
  },
  assinaturaNome: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center'
  },
  assinaturaCargo: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginTop: 2
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  footerText: {
    fontSize: 8,
    color: '#999999'
  },
  footerData: {
    fontSize: 8,
    color: '#999999',
    marginTop: 3
  }
})

interface ReciboPDFProps {
  recibo: {
    id: string
    valor: number
    created_at: string
  }
  agendamento: {
    escrevente_nome: string
    data: string
    horario: string
    endereco: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

function valorPorExtenso(valor: number): string {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  const inteiro = Math.floor(valor)
  const centavos = Math.round((valor - inteiro) * 100)

  let extenso = ''

  if (inteiro === 0) {
    extenso = 'zero'
  } else if (inteiro === 100) {
    extenso = 'cem'
  } else {
    const c = Math.floor(inteiro / 100)
    const d = Math.floor((inteiro % 100) / 10)
    const u = inteiro % 10

    if (c > 0) extenso += centenas[c]
    if (d > 0) {
      if (extenso) extenso += ' e '
      if (d === 1) {
        extenso += especiais[u]
      } else {
        extenso += dezenas[d]
        if (u > 0) extenso += ' e ' + unidades[u]
      }
    } else if (u > 0) {
      if (extenso) extenso += ' e '
      extenso += unidades[u]
    }
  }

  extenso += inteiro === 1 ? ' real' : ' reais'

  if (centavos > 0) {
    const d = Math.floor(centavos / 10)
    const u = centavos % 10
    let centavosExtenso = ''

    if (d === 1) {
      centavosExtenso = especiais[u]
    } else if (d > 1) {
      centavosExtenso = dezenas[d]
      if (u > 0) centavosExtenso += ' e ' + unidades[u]
    } else {
      centavosExtenso = unidades[u]
    }

    extenso += ' e ' + centavosExtenso + (centavos === 1 ? ' centavo' : ' centavos')
  }

  return extenso.charAt(0).toUpperCase() + extenso.slice(1)
}

function formatarCEP(cep: string): string {
  const numeros = cep.replace(/\D/g, '')
  if (numeros.length <= 5) return numeros
  return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`
}

export function ReciboPDF({ recibo, agendamento }: ReciboPDFProps) {
  const enderecoCompleto = `${agendamento.endereco}, ${agendamento.numero}${agendamento.complemento ? ' - ' + agendamento.complemento : ''}`
  const cidadeEstado = `${agendamento.bairro} - ${agendamento.cidade}/${agendamento.estado}`
  const dataGeracao = new Date().toLocaleDateString('pt-BR')
  const horaGeracao = new Date().toLocaleTimeString('pt-BR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Seu Motorista VIP</Text>
            <Text style={styles.logoSubtext}>Serviços de Transporte</Text>
          </View>
          <View>
            <Text style={styles.reciboNumero}>Recibo Nº {recibo.id.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.titulo}>Recibo de Prestação de Serviço</Text>

        {/* Dados do Cliente */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Dados do Cliente</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItemFull}>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValue}>2º Tabelionato de Notas e Protestos de Tubarão</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Solicitante</Text>
              <Text style={styles.infoValue}>{agendamento.escrevente_nome}</Text>
            </View>
          </View>
        </View>

        {/* Dados do Serviço */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Dados do Serviço</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data da Diligência</Text>
              <Text style={styles.infoValue}>{formatarData(agendamento.data)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Horário</Text>
              <Text style={styles.infoValue}>{agendamento.horario}</Text>
            </View>
            <View style={styles.infoItemFull}>
              <Text style={styles.infoLabel}>Endereço</Text>
              <Text style={styles.infoValue}>{enderecoCompleto}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bairro / Cidade</Text>
              <Text style={styles.infoValue}>{cidadeEstado}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CEP</Text>
              <Text style={styles.infoValue}>{formatarCEP(agendamento.cep)}</Text>
            </View>
          </View>
        </View>

        {/* Valor */}
        <View style={styles.valorContainer}>
          <Text style={styles.valorLabel}>Valor Recebido</Text>
          <Text style={styles.valorNumero}>{formatarMoeda(recibo.valor)}</Text>
          <Text style={styles.valorExtenso}>({valorPorExtenso(recibo.valor)})</Text>
        </View>

        {/* Declaração */}
        <Text style={styles.declaracao}>
          Declaro ter recebido a quantia acima especificada, referente à prestação de serviço de transporte para realização de diligência no endereço indicado, dando plena e total quitação.
        </Text>

        {/* Assinatura */}
        <View style={styles.assinaturaContainer}>
          <Text style={styles.assinaturaCursiva}>Bruno Sena</Text>
          <View style={styles.assinaturaLinha}>
            <Text style={styles.assinaturaNome}>Bruno Sena</Text>
            <Text style={styles.assinaturaCargo}>Motorista</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>www.seumotoristavip.com.br</Text>
          <Text style={styles.footerData}>Documento gerado em {dataGeracao} às {horaGeracao}</Text>
        </View>
      </Page>
    </Document>
  )
}
