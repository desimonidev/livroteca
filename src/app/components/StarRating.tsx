'use client'

import { useState, useTransition } from 'react'
import { setRating } from '@/app/acervo/actions'

export function StarRating({ bookId, initial }: { bookId: string; initial: number | null }) {
  const [value, setValue] = useState<number>(initial ?? 0)
  const [hover, setHover] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const shown = hover ?? value

  function choose(n: number) {
    const previous = value
    const next = n === value ? 0 : n // clicar na nota atual limpa
    setValue(next)
    setError(null)

    startTransition(async () => {
      const res = await setRating(bookId, next === 0 ? null : next)
      if (res.error) {
        setValue(previous)
        setError(res.error)
      }
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((i) => {
            const fill = Math.max(0, Math.min(1, shown - (i - 1)))
            return (
              <span key={i} className="relative inline-block text-2xl leading-none text-zinc-700">
                ★
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-yellow-400"
                  style={{ width: `${fill * 100}%` }}
                >
                  ★
                </span>
                <button
                  type="button"
                  aria-label={`${i - 0.5} estrelas`}
                  onMouseEnter={() => setHover(i - 0.5)}
                  onClick={() => choose(i - 0.5)}
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                />
                <button
                  type="button"
                  aria-label={`${i} estrelas`}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => choose(i)}
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                />
              </span>
            )
          })}
        </div>
        <span className="text-sm text-zinc-400">{value > 0 ? value : 'Sem nota'}</span>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}