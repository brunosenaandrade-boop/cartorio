import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema de Diligências - Cartório Beira Rio',
  description: 'Sistema de agendamento de diligências do 2º Tabelionato de Notas e Protestos de Tubarão',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
