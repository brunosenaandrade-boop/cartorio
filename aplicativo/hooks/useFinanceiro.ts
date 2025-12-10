import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DadosFinanceiros, Recibo } from '@/types'
import { getInicioFimMes } from '@/lib/utils'

export function useFinanceiro(ano?: number, mes?: number) {
  const [dados, setDados] = useState<DadosFinanceiros>({
    totalMes: 0,
    totalAno: 0,
    totalManha: 0,
    totalTarde: 0,
    recibos: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const anoAtual = ano || new Date().getFullYear()
      const mesAtual = mes !== undefined ? mes : new Date().getMonth()

      // Calcular datas do mês
      const inicioMes = new Date(anoAtual, mesAtual, 1).toISOString().split('T')[0]
      const fimMes = new Date(anoAtual, mesAtual + 1, 0).toISOString().split('T')[0]

      // Calcular datas do ano
      const inicioAno = `${anoAtual}-01-01`
      const fimAno = `${anoAtual}-12-31`

      // Buscar recibos do mês com agendamentos
      const { data: recibosMes, error: recibosMesError } = await supabase
        .from('recibos')
        .select(`
          *,
          agendamento:agendamentos(*)
        `)
        .gte('created_at', inicioMes)
        .lte('created_at', fimMes + 'T23:59:59')

      if (recibosMesError) throw recibosMesError

      // Buscar total do ano
      const { data: recibosAno, error: recibosAnoError } = await supabase
        .from('recibos')
        .select('valor')
        .gte('created_at', inicioAno)
        .lte('created_at', fimAno + 'T23:59:59')

      if (recibosAnoError) throw recibosAnoError

      // Calcular totais
      const totalMes = recibosMes?.reduce((acc, r) => acc + r.valor, 0) || 0
      const totalAno = recibosAno?.reduce((acc, r) => acc + r.valor, 0) || 0

      // Calcular totais por horário
      const totalManha = recibosMes
        ?.filter(r => r.agendamento?.horario === '09:15')
        .reduce((acc, r) => acc + r.valor, 0) || 0

      const totalTarde = recibosMes
        ?.filter(r => r.agendamento?.horario === '15:00')
        .reduce((acc, r) => acc + r.valor, 0) || 0

      setDados({
        totalMes,
        totalAno,
        totalManha,
        totalTarde,
        recibos: recibosMes || []
      })
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [ano, mes])

  useEffect(() => {
    carregar()
  }, [carregar])

  return {
    dados,
    loading,
    error,
    refetch: carregar
  }
}
