import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProgressForm } from '@/app/components/ProgressForm'

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ livro?: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-6 md:p-12">
          <div className="h-96 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
        </div>
      }
    >
      <CurrentReading searchParams={searchParams} />
    </Suspense>
  )
}

async function CurrentReading({ searchParams }: { searchParams: Promise<{ livro?: string }> }) {
  await connection()

  const { livro } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12 text-zinc-400">
        <Link href="/login" className="text-blue-400 hover:underline">Entre</Link> para ver o que você está lendo.
      </div>
    )
  }

  const { data: reading, error } = await supabase
    .from('user_books')
    .select('current_page, total_pages, books(id, title, cover_url, description, authors(name))')
    .eq('user_id', user.id)
    .eq('status', 'reading')
    .order('updated_at', { ascending: false })

  if (error) console.error('Erro ao buscar leitura atual:', error.message)

  const list = (reading ?? []) as any[]

  if (list.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-3xl text-center">
          <h2 className="text-xl font-medium text-zinc-300 mb-2">Você não está lendo nada agora</h2>
          <p className="text-zinc-500 mb-6">Escolha um livro e marque como "Lendo" para acompanhar o progresso aqui.</p>
          <Link
            href="/acervo/buscar"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Buscar um livro
          </Link>
        </div>
      </div>
    )
  }

  const selected = list.find((r) => r.books?.id === livro) ?? list[0]
  const book = selected.books
  const currentPage: number = selected.current_page ?? 0
  const totalPages: number | null = selected.total_pages ?? null

  const percentage = totalPages
    ? Math.min(100, Math.round((currentPage / totalPages) * 100))
    : 0
  const pagesLeft = totalPages ? Math.max(0, totalPages - currentPage) : null
  const circumference = 2 * Math.PI * 45

  return (
    <div className="relative overflow-hidden min-h-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 p-6 md:p-12">
        <div className="mb-8">
          <span className="text-xs font-semibold text-blue-400 tracking-widest uppercase bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
            Livro Atual
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: capa, progresso e formulário */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center backdrop-blur-sm">
            <div className="w-48 h-72 rounded-xl overflow-hidden shadow-2xl shadow-blue-900/20 mb-6 relative group bg-zinc-800 flex items-center justify-center">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <span className="text-zinc-600 text-sm">Sem capa</span>
              )}
              <div className="absolute inset-0 border border-white/10 rounded-xl"></div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-1 text-white">{book.title}</h2>
            <p className="text-zinc-400 text-sm mb-8">{book.authors?.name}</p>

            <div className="relative w-32 h-32 flex items-center justify-center text-white">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="transparent"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - percentage / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{percentage}%</span>
              </div>
            </div>

            <p className="text-sm text-zinc-400 mt-4 mb-6 text-center">
              {totalPages ? (
                <>
                  Página <strong className="text-white">{currentPage}</strong> de {totalPages}
                  <br />
                  <span className="text-zinc-500">
                    {pagesLeft === 0 ? 'Você chegou ao fim!' : `Faltam ${pagesLeft} páginas`}
                  </span>
                </>
              ) : (
                'Informe o total de páginas para calcular o progresso.'
              )}
            </p>

            <ProgressForm
              key={`${book.id}-${currentPage}-${totalPages}`}
              bookId={book.id}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>

          {/* Coluna 2 e 3 */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 text-zinc-200">Sinopse</h3>
              <p className="text-zinc-400 leading-relaxed">
                {book.description || 'Este livro ainda não tem sinopse.'}
              </p>
            </div>

            {list.length > 1 && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4 text-zinc-200">Outros que você está lendo</h3>
                <div className="flex flex-wrap gap-3">
                  {list
                    .filter((r) => r.books?.id !== book.id)
                    .map((r) => (
                      <Link
                        key={r.books.id}
                        href={`/?livro=${r.books.id}`}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-zinc-200 transition-colors"
                      >
                        {r.books.title}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}