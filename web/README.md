# Sistema de Diligências - Cartório Beira Rio

Sistema de agendamento de diligências para o 2º Tabelionato de Notas e Protestos de Tubarão.

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT com bcrypt
- **Email**: Resend (opcional)

## Pré-requisitos

- Node.js 18+
- Conta no Supabase (https://supabase.com)

## Instalação

1. **Instalar dependências**
```bash
cd web
npm install
```

2. **Configurar variáveis de ambiente**

Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
JWT_SECRET=um_secret_aleatorio_seguro
```

3. **Configurar banco de dados**

Execute o script SQL em `database/schema.sql` no Supabase SQL Editor.

4. **Executar em desenvolvimento**
```bash
npm run dev
```

Acesse http://localhost:3000

## Credenciais de Acesso

**Senha padrão**: `123`

Para alterar a senha, gere um novo hash bcrypt e configure a variável `AUTH_PASSWORD_HASH`.

## Estrutura do Projeto

```
web/
├── app/
│   ├── api/              # Rotas de API
│   ├── dashboard/        # Página principal
│   ├── login/            # Página de login
│   └── layout.tsx        # Layout global
├── components/
│   ├── ui/               # Componentes reutilizáveis
│   └── dashboard/        # Componentes do dashboard
├── lib/                  # Utilitários e configurações
└── types/                # Definições TypeScript
```

## Funcionalidades

- [x] Login com senha compartilhada
- [x] Calendário mensal com disponibilidade
- [x] Lista de agendamentos com filtros
- [x] Criação de novo agendamento
- [x] Cancelamento de agendamentos
- [x] Visualização de recibos
- [x] Histórico de atividades
- [x] Busca automática de CEP
- [x] Validação de feriados e fins de semana

## Deploy

O projeto está configurado para deploy na Vercel:

```bash
npm run build
```

## Licença

Projeto privado - Todos os direitos reservados.
