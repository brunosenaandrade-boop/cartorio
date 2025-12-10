import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// DELETE - Remover indisponibilidade
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { error } = await supabase
      .from('motorista_indisponibilidades')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover indisponibilidade:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao remover indisponibilidade' },
      { status: 500 }
    )
  }
}
