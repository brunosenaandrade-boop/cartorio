'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  ClipboardList,
  Receipt,
  History,
  LogOut,
  Plus,
  Building2
} from 'lucide-react'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { CalendarioTab } from '@/components/dashboard/CalendarioTab'
import { AgendamentosTab } from '@/components/dashboard/AgendamentosTab'
import { RecibosTab } from '@/components/dashboard/RecibosTab'
import { HistoricoTab } from '@/components/dashboard/HistoricoTab'

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('calendario')

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleNovoAgendamento = () => {
    router.push('/dashboard/novo')
  }

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Sistema de Diligências
                </h1>
                <p className="text-xs text-white/60">Cartório Beira Rio</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleNovoAgendamento}
                className="hidden sm:flex btn-pulse"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile FAB */}
      <button
        onClick={handleNovoAgendamento}
        className="sm:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors btn-pulse"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card-solid p-6">
          <Tabs
            defaultValue="calendario"
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-4 gap-1">
              <TabsTrigger value="calendario" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Calendário</span>
              </TabsTrigger>
              <TabsTrigger value="agendamentos" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Agendamentos</span>
              </TabsTrigger>
              <TabsTrigger value="recibos" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Recibos</span>
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendario">
              <CalendarioTab />
            </TabsContent>

            <TabsContent value="agendamentos">
              <AgendamentosTab />
            </TabsContent>

            <TabsContent value="recibos">
              <RecibosTab />
            </TabsContent>

            <TabsContent value="historico">
              <HistoricoTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
