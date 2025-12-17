import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const diagnostico: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    versao: 'debug-v1'
  }

  try {
    // 1. Verificar variáveis de ambiente
    diagnostico.env = {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    const supabase = createServerClient()

    // 2. Testar conexão - listar agendamentos
    const { data: agendamentos, error: errAgend } = await supabase
      .from('agendamentos')
      .select('*')
      .limit(1)

    diagnostico.tabela_agendamentos = {
      sucesso: !errAgend,
      erro: errAgend ? errAgend.message : null,
      colunas: agendamentos && agendamentos[0] ? Object.keys(agendamentos[0]) : 'tabela vazia ou erro'
    }

    // 3. Testar tabela motorista_indisponibilidades
    const { error: errIndispo } = await supabase
      .from('motorista_indisponibilidades')
      .select('id')
      .limit(1)

    diagnostico.tabela_indisponibilidades = {
      sucesso: !errIndispo,
      erro: errIndispo ? errIndispo.message : null
    }

    // 4. Testar tabela logs
    const { error: errLogs } = await supabase
      .from('logs')
      .select('id')
      .limit(1)

    diagnostico.tabela_logs = {
      sucesso: !errLogs,
      erro: errLogs ? errLogs.message : null
    }

    // 5. Testar tabela push_tokens
    const { error: errPush } = await supabase
      .from('push_tokens')
      .select('token')
      .limit(1)

    diagnostico.tabela_push_tokens = {
      sucesso: !errPush,
      erro: errPush ? errPush.message : null
    }

    // 6. Testar INSERT simulado (sem realmente inserir)
    // Vamos tentar inserir e depois fazer rollback... na verdade,
    // vamos apenas verificar se conseguimos fazer um SELECT com os campos esperados
    const camposEsperados = [
      'escrevente_nome', 'data', 'horario', 'cep', 'endereco',
      'numero', 'complemento', 'bairro', 'cidade', 'estado',
      'observacoes', 'status'
    ]

    const { data: colunasTeste, error: errColunas } = await supabase
      .from('agendamentos')
      .select(camposEsperados.join(','))
      .limit(0)

    diagnostico.campos_esperados = {
      sucesso: !errColunas,
      erro: errColunas ? errColunas.message : null,
      campos: camposEsperados
    }

    return NextResponse.json(diagnostico)
  } catch (error) {
    diagnostico.erro_geral = error instanceof Error ? error.message : String(error)
    return NextResponse.json(diagnostico, { status: 500 })
  }
}
