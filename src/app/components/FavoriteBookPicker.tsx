'use client'

import { useState, useTransition } from 'react'
import { setFavoriteBook } from '@/app/acervo/actions'

export function FavoriteBookPicker({
  options,
  currentId,
}: {
  options: { id: string; title: string }[]
  currentId: string | null
}) {
  const [value, setValue] = useState(currentId ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value || null
    const previous = value
    setValue(next ?? '')
    setError(null)

    startTransition(async () => {
      const res = await setFavoriteBook(next)
      if (res.error) {
        setValue(previous)
        setError(res.error)
      }
    })
  }

  return (
    <div>
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <option value="">{options.length ? 'Escolher favorito...' : 'Marque um livro como lido primeiro'}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.title}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}