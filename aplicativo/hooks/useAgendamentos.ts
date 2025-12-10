import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Agendamento, FiltroAgendamentos } from '@/types'
import { formatarDataISO, getInicioFimSemana, getInicioFimMes } from '@/lib/utils'

export function useAgendamentos(filtro: FiltroAgendamentos = { periodo: 'todos' }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarAgendamentos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('agendamentos')
        .select('*')
        .order('data', { ascending: true })
        .order('horario', { ascending: true })

      // Aplicar filtro de período
      const hoje = formatarDataISO(new Date())

      switch (filtro.periodo) {
        case 'hoje':
          query = query.eq('data', hoje)
          break
        case 'semana': {
          const { inicio, fim } = getInicioFimSemana()
          query = query.gte('data', inicio).lte('data', fim)
          break
        }
        case 'mes': {
          const { inicio, fim } = getInicioFimMes()
          query = query.gte('data', inicio).lte('data', fim)
          break
        }
        // 'todos' não aplica filtro de data
      }

      // Aplicar filtro de status
      if (filtro.status) {
        query = query.eq('status', filtro.status)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setAgendamentos(data || [])
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err)
      setError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }, [filtro.periodo, filtro.status])

  useEffect(() => {
    carregarAgendamentos()
  }, [carregarAgendamentos])

  // Inscrever-se para atualizações em tempo real
  useEffect(() => {
    const subscription = supabase
      .channel('agendamentos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos' },
        () => {
          carregarAgendamentos()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [carregarAgendamentos])

  return {
    agendamentos,
    loading,
    error,
    refetch: carregarAgendamentos
  }
}

// Hook para agendamentos de hoje e amanhã (Home)
export function useProximosAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)

    try {
      const hoje = new Date()
      const amanha = new Date()
      amanha.setDate(amanha.getDate() + 1)

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .in('data', [formatarDataISO(hoje), formatarDataISO(amanha)])
        .eq('status', 'agendado')
        .order('data', { ascending: true })
        .order('horario', { ascending: true })

      if (error) throw error

      setAgendamentos(data || [])
    } catch (err) {
      console.error('Erro ao carregar próximos agendamentos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { agendamentos, loading, refetch: carregar }
}
