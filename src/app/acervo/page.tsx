import Link from 'next/link'
import { Suspense } from 'react'
import { BookList } from './BookList'

export default function Acervo() {
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Acervo da Comunidade</h1>
          <p className="text-zinc-400">Explore os livros cadastrados por outros leitores.</p>
        </div>

        <Link
          href="/acervo/novo"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 w-fit shadow-lg shadow-blue-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Cadastrar Livro
        </Link>
        <Link
          href="/acervo/buscar"
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors w-fit border border-zinc-700"
        >
          Buscar livro
        </Link>
      </div>

      {/* Suspense com um Skeleton simples enquanto carrega */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 h-72 animate-pulse">
              <div className="aspect-[2/3] bg-zinc-800 rounded-xl mb-4"></div>
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      }>
        <BookList />
      </Suspense>
    </div>
  )
}