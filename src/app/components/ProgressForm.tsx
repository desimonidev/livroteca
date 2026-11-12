'use client'

import { useState, useTransition } from 'react'
import { updateProgress, setBookStatus } from '@/app/acervo/actions'

export function ProgressForm({
  bookId,
  currentPage,
  totalPages,
}: {
  bookId: string
  currentPage: number
  totalPages: number | null
}) {
  const [page, setPage] = useState(String(currentPage))
  const [total, setTotal] = useState(totalPages ? String(totalPages) : '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const finished = !!totalPages && currentPage >= totalPages

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await updateProgress(bookId, Number(page), Number(total))
      if (res.error) setError(res.error)
      else setSaved(true)
    })
  }

  function finish() {
    startTransition(async () => {
      const res = await setBookStatus(bookId, 'read')
      if (res.error) setError(res.error)
    })
  }

  const inputClass =
    'w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50'

  return (
    <form onSubmit={onSubmit} className="w-full space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">Página atual</label>
          <input
            type="number"
            min={0}
            required
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">Total de páginas</label>
          <input
            type="number"
            min={1}
            required
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        disabled={pending}
        className="w-full bg-white text-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
      >
        {pending ? 'Salvando...' : 'Atualizar progresso'}
      </button>

      {finished && (
        <button
          type="button"
          onClick={finish}
          disabled={pending}
          className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          🎉 Terminei! Marcar como lido
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {saved && !error && <p className="text-xs text-green-400">Progresso salvo.</p>}
    </form>
  )
}