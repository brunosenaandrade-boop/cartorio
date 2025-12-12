import { Resend } from 'resend'
import { Agendamento } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

function getFromEmail(): string {
  return process.env.EMAIL_FROM || 'Cartório <noreply@resend.dev>'
}

function getDestinatarios(): string[] {
  const cartorioEmail = process.env.CARTORIO_EMAIL || ''
  const motoristaEmail = process.env.MOTORISTA_EMAIL || ''
  return [cartorioEmail, motoristaEmail].filter(Boolean)
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarDiaSemana(data: string): string {
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const dataObj = new Date(data + 'T12:00:00')
  return dias[dataObj.getDay()]
}

function formatarHorario(horario: string): string {
  return horario === '09:15' ? '09:15' : '15:00'
}

function formatarPeriodo(horario: string): string {
  return horario === '09:15' ? 'Manhã' : 'Tarde'
}

// Template base do email
function getEmailTemplate(content: string, headerColor: string, headerIcon: string, headerTitle: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${headerColor} 0%, ${adjustColor(headerColor, -20)} 100%); padding: 40px 40px 30px 40px; text-align: center;">
              <div style="width: 70px; height: 70px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">${headerIcon}</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                ${headerTitle}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                      Sistema de Agendamento de Diligências
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      Este é um email automático. Por favor, não responda diretamente.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Sub-footer -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} 2º Tabelionato de Notas. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

function getInfoRow(icon: string, label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="40" style="vertical-align: top;">
              <span style="font-size: 20px;">${icon}</span>
            </td>
            <td style="vertical-align: top;">
              <p style="margin: 0 0 2px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${label}
              </p>
              <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 500;">
                ${value}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

// Email de confirmação de novo agendamento
export async function enviarEmailNovoAgendamento(agendamento: Agendamento, emailDestinatario?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY não configurada, email não enviado')
    return { success: false, error: 'API key não configurada' }
  }

  const destinatarios = emailDestinatario
    ? [emailDestinatario]
    : getDestinatarios()

  if (destinatarios.length === 0) {
    console.log('Nenhum destinatário configurado para email')
    return { success: false, error: 'Nenhum destinatário configurado' }
  }

  const complemento = agendamento.complemento ? `, ${agendamento.complemento}` : ''
  const enderecoCompleto = `${agendamento.endereco}, ${agendamento.numero}${complemento}`
  const cidadeEstado = `${agendamento.bairro} - ${agendamento.cidade}/${agendamento.estado}`

  const content = `
    <!-- Success Badge -->
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 500;">
        ✓ Agendamento Confirmado
      </span>
    </div>

    <!-- Greeting -->
    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
      Um novo agendamento de diligência foi registrado com sucesso. Confira os detalhes abaixo:
    </p>

    <!-- Info Card -->
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${getInfoRow('👤', 'Escrevente', agendamento.escrevente_nome)}
        ${getInfoRow('📅', 'Data', `${formatarDiaSemana(agendamento.data)}, ${formatarData(agendamento.data)}`)}
        ${getInfoRow('🕐', 'Horário', `${formatarHorario(agendamento.horario)} (${formatarPeriodo(agendamento.horario)})`)}
        ${getInfoRow('📍', 'Endereço', enderecoCompleto)}
        ${getInfoRow('🏙️', 'Localidade', cidadeEstado)}
        ${getInfoRow('📮', 'CEP', agendamento.cep)}
        ${agendamento.observacoes ? getInfoRow('📝', 'Observações', agendamento.observacoes) : ''}
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #64748b; font-size: 14px; margin: 0;">
        Em caso de dúvidas ou necessidade de alteração, entre em contato conosco.
      </p>
    </div>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `✅ Novo Agendamento - ${formatarData(agendamento.data)} às ${formatarHorario(agendamento.horario)}`,
      html: getEmailTemplate(content, '#2563eb', '📋', 'Novo Agendamento'),
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      return { success: false, error: error.message }
    }

    console.log('Email enviado com sucesso:', data?.id)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Erro ao enviar email:', err)
    return { success: false, error: 'Erro ao enviar email' }
  }
}

// Email de cancelamento de agendamento
export async function enviarEmailCancelamento(agendamento: Agendamento, motivoCancelamento?: string, emailDestinatario?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY não configurada, email não enviado')
    return { success: false, error: 'API key não configurada' }
  }

  const destinatarios = emailDestinatario
    ? [emailDestinatario]
    : getDestinatarios()

  if (destinatarios.length === 0) {
    console.log('Nenhum destinatário configurado para email')
    return { success: false, error: 'Nenhum destinatário configurado' }
  }

  const complemento = agendamento.complemento ? `, ${agendamento.complemento}` : ''
  const enderecoCompleto = `${agendamento.endereco}, ${agendamento.numero}${complemento}`
  const cidadeEstado = `${agendamento.bairro} - ${agendamento.cidade}/${agendamento.estado}`

  const content = `
    <!-- Cancel Badge -->
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="display: inline-block; background-color: #fee2e2; color: #991b1b; padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 500;">
        ✕ Agendamento Cancelado
      </span>
    </div>

    <!-- Message -->
    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
      O agendamento abaixo foi cancelado. Confira os detalhes:
    </p>

    <!-- Info Card -->
    <div style="background-color: #fef2f2; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${getInfoRow('👤', 'Escrevente', agendamento.escrevente_nome)}
        ${getInfoRow('📅', 'Data', `${formatarDiaSemana(agendamento.data)}, ${formatarData(agendamento.data)}`)}
        ${getInfoRow('🕐', 'Horário', `${formatarHorario(agendamento.horario)} (${formatarPeriodo(agendamento.horario)})`)}
        ${getInfoRow('📍', 'Endereço', enderecoCompleto)}
        ${getInfoRow('🏙️', 'Localidade', cidadeEstado)}
        ${motivoCancelamento ? getInfoRow('❌', 'Motivo do Cancelamento', motivoCancelamento) : ''}
      </table>
    </div>

    <!-- Notice -->
    <div style="background-color: #fffbeb; border-radius: 8px; padding: 15px; border-left: 4px solid #f59e0b;">
      <p style="color: #92400e; font-size: 14px; margin: 0;">
        <strong>Atenção:</strong> O horário está novamente disponível para novos agendamentos.
      </p>
    </div>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `❌ Agendamento Cancelado - ${formatarData(agendamento.data)} às ${formatarHorario(agendamento.horario)}`,
      html: getEmailTemplate(content, '#dc2626', '🚫', 'Agendamento Cancelado'),
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      return { success: false, error: error.message }
    }

    console.log('Email de cancelamento enviado com sucesso:', data?.id)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Erro ao enviar email:', err)
    return { success: false, error: 'Erro ao enviar email' }
  }
}

// Email de lembrete de agendamento
export async function enviarEmailLembrete(agendamento: Agendamento, emailDestinatario?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY não configurada, email não enviado')
    return { success: false, error: 'API key não configurada' }
  }

  const destinatarios = emailDestinatario
    ? [emailDestinatario]
    : getDestinatarios()

  if (destinatarios.length === 0) {
    console.log('Nenhum destinatário configurado para email')
    return { success: false, error: 'Nenhum destinatário configurado' }
  }

  const complemento = agendamento.complemento ? `, ${agendamento.complemento}` : ''
  const enderecoCompleto = `${agendamento.endereco}, ${agendamento.numero}${complemento}`
  const cidadeEstado = `${agendamento.bairro} - ${agendamento.cidade}/${agendamento.estado}`

  const content = `
    <!-- Reminder Badge -->
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 500;">
        ⏰ Lembrete de Diligência
      </span>
    </div>

    <!-- Highlight Box -->
    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
      <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 5px 0;">
        Diligência Amanhã!
      </p>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">
        Não esqueça do compromisso agendado
      </p>
    </div>

    <!-- Message -->
    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
      Este é um lembrete sobre a diligência agendada para amanhã. Confira os detalhes:
    </p>

    <!-- Info Card -->
    <div style="background-color: #fffbeb; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${getInfoRow('👤', 'Escrevente', agendamento.escrevente_nome)}
        ${getInfoRow('📅', 'Data', `${formatarDiaSemana(agendamento.data)}, ${formatarData(agendamento.data)}`)}
        ${getInfoRow('🕐', 'Horário', `${formatarHorario(agendamento.horario)} (${formatarPeriodo(agendamento.horario)})`)}
        ${getInfoRow('📍', 'Endereço', enderecoCompleto)}
        ${getInfoRow('🏙️', 'Localidade', cidadeEstado)}
        ${getInfoRow('📮', 'CEP', agendamento.cep)}
        ${agendamento.observacoes ? getInfoRow('📝', 'Observações', agendamento.observacoes) : ''}
      </table>
    </div>

    <!-- Tips -->
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px;">
      <p style="color: #166534; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
        💡 Dicas para o dia:
      </p>
      <ul style="color: #166534; font-size: 14px; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 5px;">Verifique o trajeto com antecedência</li>
        <li style="margin-bottom: 5px;">Leve todos os documentos necessários</li>
        <li>Chegue com alguns minutos de antecedência</li>
      </ul>
    </div>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `⏰ Lembrete: Diligência Amanhã - ${formatarData(agendamento.data)} às ${formatarHorario(agendamento.horario)}`,
      html: getEmailTemplate(content, '#f59e0b', '🔔', 'Lembrete de Diligência'),
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      return { success: false, error: error.message }
    }

    console.log('Email de lembrete enviado com sucesso:', data?.id)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Erro ao enviar email:', err)
    return { success: false, error: 'Erro ao enviar email' }
  }
}
