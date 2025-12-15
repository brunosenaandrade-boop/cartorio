import { Feriado } from '@/types'

// Feriados fixos de Santa Catarina
const feriadosSC: Feriado[] = [
  { date: '08-11', name: 'Dia de Santa Catarina', type: 'state' }
]

// Buscar feriados nacionais da API Brasil
export async function buscarFeriadosNacionais(ano: number): Promise<Feriado[]> {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)

    if (!response.ok) {
      console.error('Erro ao buscar feriados:', response.statusText)
      return []
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar feriados:', error)
    return []
  }
}

// Combinar feriados nacionais com estaduais
export async function buscarTodosFeriados(ano: number): Promise<Feriado[]> {
  const feriadosNacionais = await buscarFeriadosNacionais(ano)

  // Adicionar feriados estaduais de SC
  const feriadosEstaduais = feriadosSC.map(f => ({
    ...f,
    date: `${ano}-${f.date}`
  }))

  return [...feriadosNacionais, ...feriadosEstaduais]
}

// Verificar se uma data é feriado
export function isFeriado(data: string, feriados: Feriado[]): Feriado | undefined {
  return feriados.find(f => f.date === data)
}
