import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Recibo, Agendamento } from '@/types'
import { formatarDataISO } from '@/lib/utils'

export function useRecibos() {
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [agendamentosSemRecibo, setAgendamentosSemRecibo] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Buscar recibos com agendamentos
      const { data: recibosData, error: recibosError } = await supabase
        .from('recibos')
        .select(`
          *,
          agendamento:agendamentos(*)
        `)
        .order('created_at', { ascending: false })

      if (recibosError) throw recibosError

      // Buscar agendamentos concluídos de hoje sem recibo
      const hoje = formatarDataISO(new Date())
      const { data: agendamentosData, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('status', 'concluido')
        .eq('data', hoje)

      if (agendamentosError) throw agendamentosError

      // Filtrar agendamentos que não têm recibo
      const idsComRecibo = new Set(recibosData?.map(r => r.agendamento_id) || [])
      const semRecibo = agendamentosData?.filter(a => !idsComRecibo.has(a.id)) || []

      setRecibos(recibosData || [])
      setAgendamentosSemRecibo(semRecibo)
    } catch (err) {
      console.error('Erro ao carregar recibos:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const criarRecibo = async (agendamentoId: string, valor: number) => {
    try {
      const { error } = await supabase
        .from('recibos')
        .insert([{ agendamento_id: agendamentoId, valor }])

      if (error) throw error

      await carregar()
      return { success: true }
    } catch (err) {
      console.error('Erro ao criar recibo:', err)
      return { success: false, error: 'Erro ao salvar recibo' }
    }
  }

  return {
    recibos,
    agendamentosSemRecibo,
    loading,
    error,
    refetch: carregar,
    criarRecibo
  }
}
