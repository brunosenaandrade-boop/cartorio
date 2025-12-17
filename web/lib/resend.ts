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

function getMesNome(mes: string): string {
  const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return meses[parseInt(mes)]
}

function formatarPeriodo(horario: string): string {
  const hora = parseInt(horario.split(':')[0])
  return hora < 12 ? 'Manhã' : 'Tarde'
}

// Configurações de tema por tipo de email
interface EmailTheme {
  icon: string
  title: string
  subtitle: string
  headerBg: string
  headerBgDark: string
  accentColor: string
  accentLight: string
  iconBg: string
}

const themes: Record<string, EmailTheme> = {
  confirmacao: {
    icon: '✓',
    title: 'Agendamento Confirmado',
    subtitle: 'Nova diligência agendada com sucesso',
    headerBg: '#10b981',
    headerBgDark: '#059669',
    accentColor: '#059669',
    accentLight: '#d1fae5',
    iconBg: '#ffffff'
  },
  cancelamento: {
    icon: '✕',
    title: 'Agendamento Cancelado',
    subtitle: 'A diligência foi cancelada',
    headerBg: '#ef4444',
    headerBgDark: '#dc2626',
    accentColor: '#dc2626',
    accentLight: '#fee2e2',
    iconBg: '#ffffff'
  },
  lembrete: {
    icon: '🔔',
    title: 'Lembrete',
    subtitle: 'Você tem uma diligência amanhã',
    headerBg: '#f59e0b',
    headerBgDark: '#d97706',
    accentColor: '#d97706',
    accentLight: '#fef3c7',
    iconBg: '#ffffff'
  }
}

// Template principal - Design moderno e compatível
function getEmailTemplate(content: string, theme: EmailTheme): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${theme.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container Principal -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

          <!-- Header Colorido -->
          <tr>
            <td style="background-color: ${theme.headerBg}; padding: 32px 32px 48px 32px; text-align: center;">

              <!-- Ícone em círculo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="width: 72px; height: 72px; background-color: ${theme.iconBg}; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 32px; line-height: 72px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
                    <span style="color: ${theme.headerBg};">${theme.icon}</span>
                  </td>
                </tr>
              </table>

              <!-- Título -->
              <h1 style="margin: 20px 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                ${theme.title}
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.9);">
                ${theme.subtitle}
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer interno -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #374151;">
                      2º Tabelionato de Notas
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      Sistema de Diligências
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Footer externo -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
          <tr>
            <td style="padding: 24px 20px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
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

// Card de Data e Horário - Design elegante
function getDateTimeCard(data: string, horario: string, theme: EmailTheme): string {
  const [ano, mes, dia] = data.split('-')
  const mesNome = getMesNome(mes)
  const diaSemana = formatarDiaSemana(data)
  const periodo = formatarPeriodo(horario)

  return `
    <!-- Card Data/Hora -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td style="background-color: ${theme.accentLight}; border-radius: 12px; padding: 4px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 10px;">
            <tr>
              <!-- Bloco da Data -->
              <td width="50%" style="padding: 20px; text-align: center; border-right: 2px solid ${theme.accentLight};">
                <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${theme.accentColor}; text-transform: uppercase; letter-spacing: 1px;">
                  ${diaSemana}
                </p>
                <p style="margin: 0; font-size: 42px; font-weight: 800; color: #111827; line-height: 1;">
                  ${dia}
                </p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280; font-weight: 500;">
                  ${mesNome} ${ano}
                </p>
              </td>
              <!-- Bloco do Horário -->
              <td width="50%" style="padding: 20px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${theme.accentColor}; text-transform: uppercase; letter-spacing: 1px;">
                  ${periodo}
                </p>
                <p style="margin: 0; font-size: 42px; font-weight: 800; color: #111827; line-height: 1;">
                  ${horario.split(':')[0]}<span style="color: ${theme.accentColor};">:</span>${horario.split(':')[1]}
                </p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280; font-weight: 500;">
                  Horário
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

// Linha de informação com ícone Unicode
function getInfoRow(icon: string, label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="36" style="vertical-align: top;">
              <span style="display: inline-block; width: 32px; height: 32px; background-color: #f9fafb; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">
                ${icon}
              </span>
            </td>
            <td style="padding-left: 12px; vertical-align: middle;">
              <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">
                ${label}
              </p>
              <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 500;">
                ${value}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

// Bloco de alerta/destaque
function getAlertBox(text: string, bgColor: string, textColor: string, borderColor: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 20px;">
      <tr>
        <td style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 0 8px 8px 0; padding: 14px 16px;">
          <p style="margin: 0; font-size: 13px; color: ${textColor}; line-height: 1.5;">
            ${text}
          </p>
        </td>
      </tr>
    </table>
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

  const theme = themes.confirmacao
  const complemento = agendamento.complemento ? `, ${agendamento.complemento}` : ''
  const enderecoCompleto = `${agendamento.endereco}, ${agendamento.numero}${complemento}`
  const cidadeEstado = `${agendamento.bairro} · ${agendamento.cidade}/${agendamento.estado}`

  const content = `
    <!-- Card Data/Horário -->
    ${getDateTimeCard(agendamento.data, agendamento.horario, theme)}

    <!-- Detalhes -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${getInfoRow('👤', 'Escrevente', agendamento.escrevente_nome)}
      ${getInfoRow('📍', 'Endereço', enderecoCompleto)}
      ${getInfoRow('🏙️', 'Localidade', cidadeEstado)}
      ${getInfoRow('📮', 'CEP', agendamento.cep)}
      ${agendamento.observacoes ? getInfoRow('📝', 'Observações', agendamento.observacoes) : ''}
    </table>
  `

  try {
    const { data, error } = await getResendClient().emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `✓ Nova Diligência - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: getEmailTemplate(content, theme),
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

  const theme = themes.cancelamento
  const complemento = agendamento.complemento ? `, ${agendamento.complemento}` : ''
  const enderecoCompleto = `${agendamento.endereco}, ${agendamento.numero}${complemento}`

  const content = `
    <!-- Card Data/Horário -->
    ${getDateTimeCard(agendamento.data, agendamento.horario, theme)}

    <!-- Detalhes -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${getInfoRow('👤', 'Escrevente', agendamento.escrevente_nome)}
      ${getInfoRow('📍', 'Endereço', enderecoCompleto)}
    </table>

    ${motivoCancelamento ? getAlertBox(
      `<strong>Motivo do cancelamento:</strong> ${motivoCancelamento}`,
      '#fef2f2',
      '#991b1b',
      '#ef4444'
    ) : ''}

    ${getAlertBox(
      '⏰ O horário está novamente disponível para novos agendamentos.',
      '#fffbeb',
      '#92400e',
      '#f59e0b'
    )}
  `

  try {
    const { data, error } = await getResendClient().emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `✕ Diligência Cancelada - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: getEmailTemplate(content, theme),
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

  const theme = themes.lembrete
  const complemento = agendamento.complemento ? `, ${agendamento.complemento}` : ''
  const enderecoCompleto = `${agendamento.endereco}, ${agendamento.numero}${complemento}`
  const cidadeEstado = `${agendamento.bairro} · ${agendamento.cidade}/${agendamento.estado}`

  const content = `
    <!-- Badge Amanhã -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
      <tr>
        <td align="center">
          <span style="display: inline-block; background-color: ${theme.accentLight}; color: ${theme.accentColor}; font-size: 12px; font-weight: 700; padding: 8px 20px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px;">
            ⚡ Amanhã
          </span>
        </td>
      </tr>
    </table>

    <!-- Card Data/Horário -->
    ${getDateTimeCard(agendamento.data, agendamento.horario, theme)}

    <!-- Detalhes -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${getInfoRow('👤', 'Escrevente', agendamento.escrevente_nome)}
      ${getInfoRow('📍', 'Endereço', enderecoCompleto)}
      ${getInfoRow('🏙️', 'Localidade', cidadeEstado)}
      ${getInfoRow('📮', 'CEP', agendamento.cep)}
      ${agendamento.observacoes ? getInfoRow('📝', 'Observações', agendamento.observacoes) : ''}
    </table>

    ${getAlertBox(
      '💡 <strong>Dica:</strong> Verifique o trajeto e chegue com antecedência ao local.',
      '#ecfdf5',
      '#065f46',
      '#10b981'
    )}
  `

  try {
    const { data, error } = await getResendClient().emails.send({
      from: getFromEmail(),
      to: destinatarios,
      subject: `🔔 Lembrete: Diligência Amanhã - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: getEmailTemplate(content, theme),
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
