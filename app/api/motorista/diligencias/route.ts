import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET - Listar diligências do motorista (agendamentos pendentes e de hoje)
export async function GET() {
  try {
    const supabase = createServerClient()
    const hoje = new Date().toISOString().split('T')[0]

    // Buscar agendamentos pendentes (status = 'agendado')
    const { data: pendentes, error: pendentesError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'agendado')
      .gte('data', hoje)
      .order('data', { ascending: true })
      .order('horario', { ascending: true })

    if (pendentesError) throw pendentesError

    // Buscar agendamentos de hoje (para destaque)
    const diligenciasHoje = pendentes?.filter(a => a.data === hoje) || []
    const diligenciasFuturas = pendentes?.filter(a => a.data !== hoje) || []

    return NextResponse.json({
      success: true,
      hoje: diligenciasHoje,
      proximas: diligenciasFuturas,
      total: pendentes?.length || 0
    })
  } catch (error) {
    console.error('Erro ao listar diligências:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar diligências' },
      { status: 500 }
    )
  }
}
