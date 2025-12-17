import { Resend } from 'resend'
import { Agendamento } from '@/types'

// Cliente Resend criado de forma lazy para evitar erro durante build
function getResendClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY)
}

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

function formatarDiaSemanaAbrev(data: string): string {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const dataObj = new Date(data + 'T12:00:00')
  return dias[dataObj.getDay()]
}

function formatarPeriodo(horario: string): string {
  const hora = parseInt(horario.split(':')[0])
  return hora < 12 ? 'Manhã' : 'Tarde'
}

// SVG Icons (inline para máxima compatibilidade)
const icons = {
  calendar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  clock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  mapPin: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  user: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  check: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  x: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  bell: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  fileText: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
}

// Template base do email - Design minimalista e moderno
function getEmailTemplate(content: string, accentColor: string, headerIcon: string, headerTitle: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 48px 24px;">

        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);">

          <!-- Header Icon -->
          <tr>
            <td style="padding: 48px 48px 24px 48px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 16px auto; background-color: ${accentColor}10; border-radius: 50%; text-align: center; line-height: 64px;">
                ${headerIcon}
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1e293b; letter-spacing: -0.025em;">
                ${headerTitle}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 48px 48px 48px;">
              ${content}
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px;">
          <tr>
            <td style="padding: 32px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">
                2º Tabelionato de Notas
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Este é um email automático. Por favor, não responda.
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

// Card de data/horário em destaque
function getDateTimeCard(data: string, horario: string, accentColor: string): string {
  const diaSemana = formatarDiaSemanaAbrev(data)
  const [dia, mes, ano] = formatarData(data).split('/')
  const periodo = formatarPeriodo(horario)

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; background-color: ${accentColor}08; border-radius: 12px; border: 1px solid ${accentColor}20;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <!-- Data -->
              <td width="50%" style="text-align: center; border-right: 1px solid ${accentColor}20; padding-right: 16px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
                  ${diaSemana}
                </p>
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #1e293b; line-height: 1;">
                  ${dia}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">
                  ${mes}/${ano}
                </p>
              </td>
              <!-- Horário -->
              <td width="50%" style="text-align: center; padding-left: 16px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
                  ${periodo}
                </p>
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #1e293b; line-height: 1;">
                  ${horario}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">
                  horário
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

// Linha de informação minimalista
function getInfoLine(icon: string, label: string, value: string, color: string = '#64748b'): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="32" style="vertical-align: middle; color: ${color};">
              ${icon}
            </td>
            <td style="vertical-align: middle; padding-left: 12px;">
              <p style="margin: 0; font-size: 14px; color: #1e293b;">
                ${value}
              </p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">
                ${label}
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
  const cidadeEstado = `${agendamento.bairro}, ${agendamento.cidade}/${agendamento.estado}`

  const content = `
    <!-- Mensagem -->
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6; text-align: center;">
      Uma nova diligência foi agendada com sucesso.
    </p>

    <!-- Card Data/Horário -->
    ${getDateTimeCard(agendamento.data, agendamento.horario, '#3b82f6')}

    <!-- Detalhes -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${getInfoLine(icons.user, 'Escrevente', agendamento.escrevente_nome, '#3b82f6')}
      ${getInfoLine(icons.mapPin, 'Endereço', enderecoCompleto, '#3b82f6')}
      ${getInfoLine(icons.mapPin, 'Localidade', cidadeEstado, '#3b82f6')}
      ${agendamento.observacoes ? getInfoLine(icons.fileText, 'Observações', agendamento.observacoes, '#3b82f6') : ''}
    </table>
  `

  try {
    const { data, error } = await getResendClient().emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `Nova Diligência - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: getEmailTemplate(content, '#3b82f6', icons.check, 'Agendamento Confirmado'),
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

  const content = `
    <!-- Mensagem -->
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6; text-align: center;">
      A diligência abaixo foi cancelada.
    </p>

    <!-- Card Data/Horário -->
    ${getDateTimeCard(agendamento.data, agendamento.horario, '#ef4444')}

    <!-- Detalhes -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${getInfoLine(icons.user, 'Escrevente', agendamento.escrevente_nome, '#ef4444')}
      ${getInfoLine(icons.mapPin, 'Endereço', enderecoCompleto, '#ef4444')}
      ${motivoCancelamento ? `
        <tr>
          <td style="padding: 16px 0 0 0;">
            <div style="padding: 12px 16px; background-color: #fef2f2; border-radius: 8px; border-left: 3px solid #ef4444;">
              <p style="margin: 0; font-size: 13px; color: #991b1b;">
                <strong>Motivo:</strong> ${motivoCancelamento}
              </p>
            </div>
          </td>
        </tr>
      ` : ''}
    </table>

    <!-- Aviso -->
    <div style="margin-top: 24px; padding: 12px 16px; background-color: #fffbeb; border-radius: 8px;">
      <p style="margin: 0; font-size: 13px; color: #92400e; text-align: center;">
        O horário está novamente disponível para novos agendamentos.
      </p>
    </div>
  `

  try {
    const { data, error } = await getResendClient().emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `Diligência Cancelada - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: getEmailTemplate(content, '#ef4444', icons.x, 'Agendamento Cancelado'),
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
  const cidadeEstado = `${agendamento.bairro}, ${agendamento.cidade}/${agendamento.estado}`

  const content = `
    <!-- Badge Destaque -->
    <div style="margin-bottom: 24px; text-align: center;">
      <span style="display: inline-block; padding: 8px 20px; background-color: #fef3c7; color: #92400e; font-size: 14px; font-weight: 600; border-radius: 50px;">
        Diligência Amanhã
      </span>
    </div>

    <!-- Mensagem -->
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6; text-align: center;">
      Este é um lembrete sobre a diligência agendada para amanhã.
    </p>

    <!-- Card Data/Horário -->
    ${getDateTimeCard(agendamento.data, agendamento.horario, '#f59e0b')}

    <!-- Detalhes -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${getInfoLine(icons.user, 'Escrevente', agendamento.escrevente_nome, '#f59e0b')}
      ${getInfoLine(icons.mapPin, 'Endereço', enderecoCompleto, '#f59e0b')}
      ${getInfoLine(icons.mapPin, 'Localidade', cidadeEstado, '#f59e0b')}
      ${agendamento.observacoes ? getInfoLine(icons.fileText, 'Observações', agendamento.observacoes, '#f59e0b') : ''}
    </table>

    <!-- Dicas -->
    <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #166534;">
        Lembrete:
      </p>
      <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
        Verifique o trajeto e chegue com antecedência.
      </p>
    </div>
  `

  try {
    const { data, error } = await getResendClient().emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `Lembrete: Diligência Amanhã - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: getEmailTemplate(content, '#f59e0b', icons.bell, 'Lembrete de Diligência'),
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
