import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { formatarData, formatarMoeda } from '@/lib/utils'

// Esta rota gera um PDF simples como HTML
// Para produção, você pode usar @react-pdf/renderer no servidor
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

    // Gerar HTML do recibo
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recibo de Transporte</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1a365d;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1a365d;
            }
            .titulo {
              font-size: 20px;
              margin-top: 10px;
              color: #333;
            }
            .info {
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              margin: 10px 0;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
              color: #666;
            }
            .info-value {
              color: #333;
            }
            .valor {
              font-size: 28px;
              font-weight: bold;
              color: #38a169;
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #f0fff4;
              border-radius: 8px;
            }
            .assinatura {
              margin-top: 60px;
              text-align: center;
            }
            .linha-assinatura {
              border-top: 1px solid #333;
              width: 300px;
              margin: 0 auto;
              padding-top: 10px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Seu Motorista VIP</div>
            <div class="titulo">RECIBO DE TRANSPORTE</div>
          </div>

          <div class="info">
            <div class="info-row">
              <span class="info-label">Cliente:</span>
              <span class="info-value">2º Tabelionato de Notas e Protestos de Tubarão</span>
            </div>
            <div class="info-row">
              <span class="info-label">Escrevente:</span>
              <span class="info-value">${agendamento.escrevente_nome}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data da Diligência:</span>
              <span class="info-value">${formatarData(agendamento.data)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Horário:</span>
              <span class="info-value">${agendamento.horario}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Endereço:</span>
              <span class="info-value">
                ${agendamento.endereco}, ${agendamento.numero}
                ${agendamento.complemento ? ' - ' + agendamento.complemento : ''}
                - ${agendamento.bairro}, ${agendamento.cidade}/${agendamento.estado}
              </span>
            </div>
          </div>

          <div class="valor">
            Valor Recebido: ${formatarMoeda(recibo.valor)}
          </div>

          <p style="text-align: center; color: #666;">
            Recebi a quantia acima referente ao serviço de transporte para diligência.
          </p>

          <div class="assinatura">
            <div class="linha-assinatura">
              Bruno Sena - Motorista
            </div>
          </div>

          <div class="footer">
            <p>www.seumotoristavip.com.br</p>
            <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="recibo-${id}.html"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar recibo' },
      { status: 500 }
    )
  }
}
