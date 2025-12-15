'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Building2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setErro(data.error || 'Erro ao fazer login')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white text-shadow mb-2">
            Sistema de Diligências
          </h1>
          <p className="text-white/70">
            Cartório Beira Rio - Tubarão/SC
          </p>
        </div>

        {/* Card de Login */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="senha" className="label-white flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha de Acesso
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field mt-1"
                placeholder="Digite a senha"
                autoFocus
                required
              />
            </div>

            {erro && (
              <div className="flex items-center gap-2 text-red-300 bg-red-500/20 px-4 py-3 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{erro}</span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              Entrar
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/50 text-sm mt-8">
          2º Tabelionato de Notas e Protestos de Tubarão
        </p>
      </div>
    </div>
  )
}
