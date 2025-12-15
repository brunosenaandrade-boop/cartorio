import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReciboPDF } from '@/lib/pdf-template'
import React from 'react'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    // Buscar recibo com agendamento
    const { data: recibo, error } = await supabase
      .from('recibos')
      .select(`
        *,
        agendamento:agendamentos(*)
      `)
      .eq('id', id)
      .single()

    if (error || !recibo) {
      return NextResponse.json(
        { success: false, error: 'Recibo não encontrado' },
        { status: 404 }
      )
    }

    const agendamento = recibo.agendamento

    // Criar documento PDF
    const doc = React.createElement(ReciboPDF, {
      recibo: {
        id: recibo.id,
        valor: recibo.valor,
        created_at: recibo.created_at
      },
      agendamento: {
        escrevente_nome: agendamento.escrevente_nome,
        data: agendamento.data,
        horario: agendamento.horario,
        endereco: agendamento.endereco,
        numero: agendamento.numero,
        complemento: agendamento.complemento,
        bairro: agendamento.bairro,
        cidade: agendamento.cidade,
        estado: agendamento.estado,
        cep: agendamento.cep
      }
    })

    // Gerar PDF como buffer (compatível com serverless)
    const pdfBuffer = await renderToBuffer(doc as React.ReactElement)

    // Retornar PDF real
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-${id.slice(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar recibo PDF' },
      { status: 500 }
    )
  }
}
