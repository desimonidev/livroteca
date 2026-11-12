import Link from 'next/link'
import { Suspense } from 'react'
import { Results } from './Results'

export default function Buscar({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto relative z-10">
      <Link href="/acervo" className="text-zinc-400 hover:text-white text-sm transition-colors">
        ← Voltar para o Acervo
      </Link>
      <h1 className="text-3xl font-bold text-white mt-4 mb-6">Buscar livro</h1>

      <form action="/acervo/buscar" method="get" className="flex gap-3 mb-10">
        <input
          name="q"
          required
          placeholder="Título, autor ou ISBN"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-medium transition-colors">
          Buscar
        </button>
      </form>

      <Suspense fallback={<p className="text-zinc-500">Buscando...</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  )
}