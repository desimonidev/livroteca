import Link from 'next/link'
import { Suspense } from 'react'
import { BookTable } from './BookTable'

export default function AdminPanel() {
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto relative z-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Painel de Moderação</h1>
          <p className="text-zinc-400">Aprove livros pendentes e gerencie o acervo.</p>
        </div>
        <Link href="/acervo" className="text-blue-400 hover:text-blue-300 transition-colors">Voltar ao Acervo</Link>
      </div>

      <Suspense fallback={
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex justify-center animate-pulse">
          <p className="text-zinc-500">Carregando painel de moderação...</p>
        </div>
      }>
        <BookTable />
      </Suspense>
    </div>
  )
}