'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/') // redirect to home
            router.refresh()
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* FUNDO: Imagem de livros (via Unsplash) com Blur e overlay escuro */}
      <div 
        className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat"
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/50"></div>
      </div>

      {/* CARD PRINCIPAL (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        
        {/* Ícone/Logo */}
        <div className="flex justify-center">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm border border-white/30 shadow-inner">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white tracking-wide">Bem-vindo de volta</h1>
        <p className="text-center text-sm text-gray-300">Entre para continuar sua jornada literária</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full px-4 py-2 mt-1 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Lembrar de mim & Esqueci a senha */}
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-black/20" />
              Lembrar de mim
            </label>
            <Link href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Esqueceu a senha?
            </Link>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 mt-2 text-white bg-blue-600/80 hover:bg-blue-600 rounded-lg backdrop-blur-sm border border-blue-500/50 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-300">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="text-white font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}