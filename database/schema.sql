-- =============================================
-- SCHEMA DO BANCO DE DADOS - SISTEMA DE DILIGÊNCIAS
-- Cartório Beira Rio - Tubarão/SC
-- =============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: agendamentos
-- Armazena todas as diligências agendadas
-- =============================================
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrevente_nome VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    horario VARCHAR(5) NOT NULL CHECK (horario IN ('09:15', '15:00')),
    cep VARCHAR(9) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL DEFAULT 'SC',
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'concluido', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by VARCHAR(100),

    -- Constraint única: apenas um agendamento por data/horário
    CONSTRAINT unique_data_horario UNIQUE (data, horario)
);

-- Índices para performance
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_data_status ON agendamentos(data, status);
CREATE INDEX idx_agendamentos_escrevente ON agendamentos(escrevente_nome);

-- =============================================
-- TABELA: motorista_indisponibilidades
-- Dias em que o motorista não está disponível
-- =============================================
CREATE TABLE motorista_indisponibilidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data DATE NOT NULL UNIQUE,
    motivo VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por data
CREATE INDEX idx_indisponibilidades_data ON motorista_indisponibilidades(data);

-- =============================================
-- TABELA: recibos
-- Recibos de pagamento das diligências
-- =============================================
CREATE TABLE recibos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Um recibo por agendamento
    CONSTRAINT unique_recibo_agendamento UNIQUE (agendamento_id)
);

-- Índice para busca por agendamento
CREATE INDEX idx_recibos_agendamento ON recibos(agendamento_id);

-- =============================================
-- TABELA: logs
-- Histórico de ações do sistema
-- =============================================
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    acao VARCHAR(50) NOT NULL CHECK (acao IN ('agendamento_criado', 'agendamento_cancelado')),
    escrevente_nome VARCHAR(100) NOT NULL,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
    detalhes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca
CREATE INDEX idx_logs_acao ON logs(acao);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX idx_logs_agendamento ON logs(agendamento_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Proteção de acesso aos dados
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE motorista_indisponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Políticas para agendamentos
CREATE POLICY "Permitir leitura pública de agendamentos" ON agendamentos
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de agendamentos" ON agendamentos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de agendamentos" ON agendamentos
    FOR UPDATE USING (true);

-- Políticas para indisponibilidades
CREATE POLICY "Permitir leitura pública de indisponibilidades" ON motorista_indisponibilidades
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de indisponibilidades" ON motorista_indisponibilidades
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir exclusão de indisponibilidades" ON motorista_indisponibilidades
    FOR DELETE USING (true);

-- Políticas para recibos
CREATE POLICY "Permitir leitura pública de recibos" ON recibos
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de recibos" ON recibos
    FOR INSERT WITH CHECK (true);

-- Políticas para logs
CREATE POLICY "Permitir leitura pública de logs" ON logs
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de logs" ON logs
    FOR INSERT WITH CHECK (true);

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para atualizar status do agendamento quando recibo é criado
CREATE OR REPLACE FUNCTION atualizar_status_agendamento_concluido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agendamentos
    SET status = 'concluido'
    WHERE id = NEW.agendamento_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para marcar agendamento como concluído quando recibo é inserido
CREATE TRIGGER trigger_recibo_concluido
    AFTER INSERT ON recibos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_status_agendamento_concluido();

-- Função para criar log automaticamente ao criar agendamento
CREATE OR REPLACE FUNCTION criar_log_agendamento_criado()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logs (acao, escrevente_nome, agendamento_id, detalhes)
    VALUES (
        'agendamento_criado',
        NEW.escrevente_nome,
        NEW.id,
        'Agendamento criado para ' || NEW.data || ' às ' || NEW.horario
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log de criação de agendamento
CREATE TRIGGER trigger_log_agendamento_criado
    AFTER INSERT ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION criar_log_agendamento_criado();

-- Função para criar log automaticamente ao cancelar agendamento
CREATE OR REPLACE FUNCTION criar_log_agendamento_cancelado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'cancelado' AND NEW.status = 'cancelado' THEN
        INSERT INTO logs (acao, escrevente_nome, agendamento_id, detalhes)
        VALUES (
            'agendamento_cancelado',
            COALESCE(NEW.cancelled_by, 'Sistema'),
            NEW.id,
            'Agendamento de ' || NEW.data || ' às ' || NEW.horario || ' cancelado'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log de cancelamento de agendamento
CREATE TRIGGER trigger_log_agendamento_cancelado
    AFTER UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION criar_log_agendamento_cancelado();

-- =============================================
-- DADOS INICIAIS (para testes)
-- =============================================

-- Comentado para produção - descomentar se necessário para testes
/*
INSERT INTO motorista_indisponibilidades (data, motivo) VALUES
    ('2024-12-25', 'Natal'),
    ('2024-12-31', 'Véspera de Ano Novo'),
    ('2025-01-01', 'Ano Novo');
*/
