'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Cadastro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // Se você desativou a confirmação de email no Supabase, pode redirecionar direto:
      // router.push('/')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 backdrop-blur-md bg-black/60"></div>
        </div>
        <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-center space-y-6">
          <h2 className="text-2xl font-bold text-green-400 mb-2">Cadastro realizado!</h2>
          <p className="text-gray-200">Verifique seu e-mail para confirmar a conta (se a confirmação estiver ativada).</p>
          <Link href="/login" className="inline-block w-full px-4 py-2.5 text-white bg-blue-600/80 hover:bg-blue-600 rounded-lg backdrop-blur-sm border border-blue-500/50 transition-all">
            Ir para o Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 backdrop-blur-md bg-black/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-white tracking-wide">Crie sua conta</h1>
        <p className="text-center text-sm text-gray-300">Comece a organizar suas leituras hoje</p>
        
        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 mt-1 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 mt-2 text-white bg-blue-600/80 hover:bg-blue-600 rounded-lg backdrop-blur-sm border border-blue-500/50 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-300">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-white font-semibold hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}