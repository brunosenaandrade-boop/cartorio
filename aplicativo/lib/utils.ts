import { Linking, Platform } from 'react-native'

// Formatar data para exibição (DD/MM/YYYY)
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Formatar data para ISO (YYYY-MM-DD)
export function formatarDataISO(data: Date): string {
  return data.toISOString().split('T')[0]
}

// Formatar valor monetário (R$ 1.234,56)
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Parser de valor monetário (remove R$ e converte para número)
export function parseMoeda(valor: string): number {
  const numeros = valor.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(numeros) || 0
}

// Máscara de moeda para input
export function mascaraMoeda(valor: string): string {
  const numeros = valor.replace(/\D/g, '')
  const numero = parseInt(numeros, 10) / 100
  if (isNaN(numero)) return 'R$ 0,00'
  return formatarMoeda(numero)
}

// Obter nome do dia da semana
export function getNomeDiaSemana(diaSemana: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return dias[diaSemana]
}

// Obter nome do dia da semana abreviado
export function getNomeDiaSemanaAbrev(diaSemana: number): string {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return dias[diaSemana]
}

// Obter nome do mês
export function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return meses[mes]
}

// Verificar se é hoje
export function isHoje(data: string): boolean {
  const hoje = new Date()
  const dataVerificar = new Date(data + 'T00:00:00')
  return (
    hoje.getFullYear() === dataVerificar.getFullYear() &&
    hoje.getMonth() === dataVerificar.getMonth() &&
    hoje.getDate() === dataVerificar.getDate()
  )
}

// Verificar se é amanhã
export function isAmanha(data: string): boolean {
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  const dataVerificar = new Date(data + 'T00:00:00')
  return (
    amanha.getFullYear() === dataVerificar.getFullYear() &&
    amanha.getMonth() === dataVerificar.getMonth() &&
    amanha.getDate() === dataVerificar.getDate()
  )
}

// Abrir endereço no Google Maps
export function abrirGoogleMaps(endereco: string, cidade: string, estado: string): void {
  const enderecoCompleto = `${endereco}, ${cidade}, ${estado}`
  const url = Platform.select({
    ios: `maps:?q=${encodeURIComponent(enderecoCompleto)}`,
    android: `geo:0,0?q=${encodeURIComponent(enderecoCompleto)}`,
  })

  if (url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url)
      } else {
        // Fallback para URL web do Google Maps
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`)
      }
    })
  }
}

// Abrir endereço no Waze
export function abrirWaze(endereco: string, cidade: string, estado: string): void {
  const enderecoCompleto = `${endereco}, ${cidade}, ${estado}`
  const url = `https://waze.com/ul?q=${encodeURIComponent(enderecoCompleto)}`

  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url)
    } else {
      // Fallback para Play Store
      Linking.openURL('https://play.google.com/store/apps/details?id=com.waze')
    }
  })
}

// Calcular início e fim da semana
export function getInicioFimSemana(): { inicio: string; fim: string } {
  const hoje = new Date()
  const diaSemana = hoje.getDay()

  const inicio = new Date(hoje)
  inicio.setDate(hoje.getDate() - diaSemana)

  const fim = new Date(hoje)
  fim.setDate(hoje.getDate() + (6 - diaSemana))

  return {
    inicio: formatarDataISO(inicio),
    fim: formatarDataISO(fim)
  }
}

// Calcular início e fim do mês
export function getInicioFimMes(): { inicio: string; fim: string } {
  const hoje = new Date()

  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

  return {
    inicio: formatarDataISO(inicio),
    fim: formatarDataISO(fim)
  }
}
