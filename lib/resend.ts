import { Resend } from 'resend'
import { Agendamento } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Cartório <noreply@resend.dev>'
const CARTORIO_EMAIL = process.env.CARTORIO_EMAIL || ''
const MOTORISTA_EMAIL = process.env.MOTORISTA_EMAIL || ''

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarHorario(horario: string): string {
  return horario === '09:15' ? '09:15 (Manhã)' : '15:00 (Tarde)'
}

function formatarEndereco(agendamento: Agendamento): string {
  const complemento = agendamento.complemento ? `, ${agendamento.complemento}` : ''
  return `${agendamento.endereco}, ${agendamento.numero}${complemento} - ${agendamento.bairro}, ${agendamento.cidade}/${agendamento.estado} - CEP: ${agendamento.cep}`
}

// Email de confirmação de novo agendamento
export async function enviarEmailNovoAgendamento(agendamento: Agendamento, emailDestinatario?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY não configurada, email não enviado')
    return { success: false, error: 'API key não configurada' }
  }

  const destinatarios = emailDestinatario
    ? [emailDestinatario]
    : [CARTORIO_EMAIL, MOTORISTA_EMAIL].filter(Boolean)

  if (destinatarios.length === 0) {
    console.log('Nenhum destinatário configurado para email')
    return { success: false, error: 'Nenhum destinatário configurado' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: destinatarios,
      subject: `Novo Agendamento - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Novo Agendamento de Diligência</h2>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Detalhes do Agendamento</h3>

            <p><strong>Escrevente:</strong> ${agendamento.escrevente_nome}</p>
            <p><strong>Data:</strong> ${formatarData(agendamento.data)}</p>
            <p><strong>Horário:</strong> ${formatarHorario(agendamento.horario)}</p>
            <p><strong>Endereço:</strong> ${formatarEndereco(agendamento)}</p>
            ${agendamento.observacoes ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>` : ''}
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Este é um email automático do Sistema de Agendamento de Diligências.
          </p>
        </div>
      `,
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
    : [CARTORIO_EMAIL, MOTORISTA_EMAIL].filter(Boolean)

  if (destinatarios.length === 0) {
    console.log('Nenhum destinatário configurado para email')
    return { success: false, error: 'Nenhum destinatário configurado' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: destinatarios,
      subject: `Agendamento Cancelado - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Agendamento Cancelado</h2>

          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #1f2937;">Detalhes do Agendamento Cancelado</h3>

            <p><strong>Escrevente:</strong> ${agendamento.escrevente_nome}</p>
            <p><strong>Data:</strong> ${formatarData(agendamento.data)}</p>
            <p><strong>Horário:</strong> ${formatarHorario(agendamento.horario)}</p>
            <p><strong>Endereço:</strong> ${formatarEndereco(agendamento)}</p>
            ${motivoCancelamento ? `<p><strong>Motivo:</strong> ${motivoCancelamento}</p>` : ''}
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Este é um email automático do Sistema de Agendamento de Diligências.
          </p>
        </div>
      `,
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
    : [CARTORIO_EMAIL, MOTORISTA_EMAIL].filter(Boolean)

  if (destinatarios.length === 0) {
    console.log('Nenhum destinatário configurado para email')
    return { success: false, error: 'Nenhum destinatário configurado' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: destinatarios,
      subject: `Lembrete: Diligência amanhã - ${formatarData(agendamento.data)} às ${agendamento.horario}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Lembrete de Diligência</h2>

          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #1f2937;">Você tem uma diligência agendada para amanhã!</h3>

            <p><strong>Escrevente:</strong> ${agendamento.escrevente_nome}</p>
            <p><strong>Data:</strong> ${formatarData(agendamento.data)}</p>
            <p><strong>Horário:</strong> ${formatarHorario(agendamento.horario)}</p>
            <p><strong>Endereço:</strong> ${formatarEndereco(agendamento)}</p>
            ${agendamento.observacoes ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>` : ''}
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Este é um email automático do Sistema de Agendamento de Diligências.
          </p>
        </div>
      `,
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
