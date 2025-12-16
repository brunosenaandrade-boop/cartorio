import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { MotoristaIndisponibilidade } from '@/types'

export function useIndisponibilidades() {
  const [indisponibilidades, setIndisponibilidades] = useState<MotoristaIndisponibilidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('motorista_indisponibilidades')
        .select('*')
        .order('data', { ascending: true })

      if (queryError) throw queryError

      setIndisponibilidades(data || [])
    } catch (err) {
      console.error('Erro ao carregar indisponibilidades:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const adicionarIndisponibilidade = async (data: string, motivo?: string) => {
    try {
      // Verificar se há agendamentos nesta data
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('data', data)
        .eq('status', 'agendado')
        .limit(1)

      if (agendamentos && agendamentos.length > 0) {
        return { success: false, error: 'Já existem agendamentos para esta data' }
      }

      const { error } = await supabase
        .from('motorista_indisponibilidades')
        .insert([{ data, motivo }])

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Esta data já está marcada como indisponível' }
        }
        throw error
      }

      await carregar()
      return { success: true }
    } catch (err) {
      console.error('Erro ao adicionar indisponibilidade:', err)
      return { success: false, error: 'Erro ao salvar' }
    }
  }

  const removerIndisponibilidade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('motorista_indisponibilidades')
        .delete()
        .eq('id', id)

      if (error) throw error

      await carregar()
      return { success: true }
    } catch (err) {
      console.error('Erro ao remover indisponibilidade:', err)
      return { success: false, error: 'Erro ao remover' }
    }
  }

  return {
    indisponibilidades,
    loading,
    error,
    refetch: carregar,
    adicionarIndisponibilidade,
    removerIndisponibilidade
  }
}
