# App Diligências - Motorista

Aplicativo móvel para o motorista gerenciar diligências do Cartório Beira Rio.

## Tecnologias

- **Framework**: React Native (Expo SDK 51)
- **Navegação**: Expo Router
- **Estilização**: NativeWind (TailwindCSS)
- **Banco de Dados**: Supabase
- **Notificações**: Expo Notifications

## Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Conta no Supabase (mesmo do painel web)
- Android Studio (para emulador) ou dispositivo físico

## Instalação

1. **Instalar dependências**
```bash
cd aplicativo
npm install
```

2. **Configurar variáveis de ambiente**

Crie o arquivo `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

3. **Executar em desenvolvimento**
```bash
npx expo start
```

4. **Testar no dispositivo**
- Escaneie o QR Code com o app Expo Go
- Ou pressione `a` para abrir no emulador Android

## Build APK

Para gerar o APK de produção:

1. Instale o EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure o projeto:
```bash
eas build:configure
```

3. Gere o APK:
```bash
eas build --platform android --profile preview
```

## Estrutura do Projeto

```
aplicativo/
├── app/
│   ├── (tabs)/          # Telas com navegação por tabs
│   │   ├── index.tsx    # Home
│   │   ├── agendamentos.tsx
│   │   ├── indisponivel.tsx
│   │   ├── recibos.tsx
│   │   └── financeiro.tsx
│   └── _layout.tsx      # Layout raiz
├── components/
│   ├── ui/              # Componentes base
│   └── DiligenciaCard.tsx
├── hooks/               # Custom hooks
├── lib/                 # Configurações
├── constants/           # Cores e constantes
└── types/               # Tipos TypeScript
```

## Funcionalidades

- [x] Visualização de diligências (hoje, semana, mês, todos)
- [x] Integração com Google Maps e Waze
- [x] Marcação de dias indisponíveis
- [x] Registro de recibos com valores
- [x] Dashboard financeiro com gráficos
- [x] Exportar relatório financeiro
- [x] Atualização em tempo real (Supabase Realtime)

## Distribuição

O aplicativo é distribuído diretamente via APK para o motorista Bruno Sena, sem necessidade de publicação na Play Store.

## Licença

Projeto privado - Todos os direitos reservados.
