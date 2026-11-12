'use client'

import { useState, useTransition } from 'react'
import { setBookStatus, type ReadingStatus } from '@/app/acervo/actions'
import { StarRating } from './StarRating'

const OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: 'want_to_read', label: '📌 Quero ler' },
  { value: 'reading', label: '📖 Lendo' },
  { value: 'read', label: '✅ Lido' },
  { value: 'dropped', label: '🚫 Dropado' },
]

export function BookStatusSelect({
  bookId,
  current,
  rating = null,
}: {
  bookId: string
  current: ReadingStatus | null
  rating?: number | null
}) {
  const [value, setValue] = useState<ReadingStatus | ''>(current ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = (e.target.value || null) as ReadingStatus | null
    const previous = value
    setValue(next ?? '')
    setError(null)

    startTransition(async () => {
      const res = await setBookStatus(bookId, next)
      if (res.error) {
        setValue(previous)
        setError(res.error)
      }
    })
  }

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <option value="">Adicionar à estante...</option>
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {value === 'read' && <StarRating bookId={bookId} initial={rating} />}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}