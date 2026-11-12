export type ExternalBook = {
  source: 'google' | 'openlibrary'
  externalId: string
  title: string
  author: string
  year: number | null
  publisher: string | null
  description: string | null
  isbn: string | null
  coverUrl: string | null
  language?: string | null
}

export const normalize = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const OL_HEADERS = { 'User-Agent': 'LivroTeca (contato: seu@email.com)' } // troque pelo seu e-mail

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const fixCover = (url?: string) =>
  url ? url.replace('http://', 'https://').replace('&edge=curl', '') : null

const cache = new Map<string, { at: number; data: any }>()
const TTL = 1000 * 60 * 30 // 30 minutos

async function getJson(url: string, headers?: Record<string, string>) {
  const safeUrl = url.split('?')[0] // não loga a chave

  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < TTL) return hit.data

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers })
    if (!res.ok) {
      console.error('[books] HTTP', res.status, safeUrl)
      return null
    }
    const data = await res.json()
    cache.set(url, { at: Date.now(), data })
    return data
  } catch (e) {
    console.error('[books] falha', safeUrl, e)
    return null
  }
}

function pickIsbn(ids: { type: string; identifier: string }[] = []) {
  return (
    ids.find((i) => i.type === 'ISBN_13')?.identifier ??
    ids.find((i) => i.type === 'ISBN_10')?.identifier ??
    null
  )
}

/* ---------------- Busca ---------------- */
const tokens = (s: string) =>
  normalize(s).split(/[^a-z0-9]+/).filter((t) => t.length > 2)

// Fração das palavras digitadas que aparecem no título ou autor (0 a 1)
function relevance(q: string, b: { title: string; author: string }) {
  const qt = tokens(q)
  if (qt.length === 0) return 1
  const hay = normalize(`${b.title} ${b.author}`)
  return qt.filter((t) => hay.includes(t)).length / qt.length
}

async function searchGoogle(q: string): Promise<ExternalBook[]> {
  const key = process.env.GOOGLE_BOOKS_API_KEY
  const digits = q.replace(/[\s-]/g, '')
  const isIsbn = /^\d{10}(\d{3})?$/.test(digits)
  const query = isIsbn ? `isbn:${digits}` : q

  const json = await getJson(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}` +
      `&maxResults=10&printType=books${key ? `&key=${key}` : ''}`
  )
  if (!json) return []

  const books: ExternalBook[] = []

  for (const item of json.items ?? []) {
    const v = item.volumeInfo
    if (!v?.title || !v.authors?.length) continue

    const year = v.publishedDate ? parseInt(String(v.publishedDate).slice(0, 4)) : NaN

    books.push({
      source: 'google',
      externalId: item.id,
      title: v.subtitle ? `${v.title}: ${v.subtitle}` : v.title,
      author: v.authors[0],
      year: Number.isNaN(year) ? null : year,
      publisher: v.publisher ?? null,
      description: v.description ? stripHtml(v.description) : null,
      isbn: pickIsbn(v.industryIdentifiers),
      coverUrl: fixCover(v.imageLinks?.thumbnail),
      language: v.language ?? null,
    })
  }

  // Sem filtrar nada: só coloca as edições em português antes
  return books.sort((a, z) => Number(z.language === 'pt') - Number(a.language === 'pt'))
}

async function searchOpenLibrary(q: string): Promise<ExternalBook[]> {
  const url =
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&language=por&limit=10` +
    `&fields=key,title,author_name,first_publish_year,isbn,cover_i,publisher`

  const json = await getJson(url, OL_HEADERS)
  if (!json) return []

  return (json.docs ?? [])
    .filter((d: any) => d.title && d.author_name?.length)
    .map((d: any): ExternalBook => ({
      source: 'openlibrary',
      externalId: d.key, // ex: /works/OL123W
      title: d.title,
      author: d.author_name[0],
      year: d.first_publish_year ?? null,
      publisher: d.publisher?.[0] ?? null,
      description: null,
      isbn: d.isbn?.[0] ?? null,
      coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    }))
}

export async function searchExternalBooks(q: string): Promise<ExternalBook[]> {
  const [google, openLibrary] = await Promise.all([searchGoogle(q), searchOpenLibrary(q)])

  // Google primeiro; Open Library só entra se não for repetido
  const seen = new Set<string>()
  const result: ExternalBook[] = []

  for (const b of [...google, ...openLibrary]) {
    const key = b.isbn ?? `${normalize(b.title)}|${normalize(b.author)}`
    const alt = `${normalize(b.title)}|${normalize(b.author)}`
    if (seen.has(key) || seen.has(alt)) continue
    seen.add(key)
    seen.add(alt)
    result.push(b)
  }

  return result.slice(0, 15)
}

/* ---------------- Completar dados ---------------- */

type Extra = Partial<Pick<ExternalBook, 'description' | 'publisher' | 'year' | 'coverUrl' | 'isbn'>>

async function googleExtra(book: ExternalBook): Promise<Extra> {
  const key = process.env.GOOGLE_BOOKS_API_KEY
  let v: any = null

  if (book.source === 'google') {
    // Detalhe do volume exato que o usuário escolheu
    const j = await getJson(
      `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(book.externalId)}${key ? `?key=${key}` : ''}`
    )
    v = j?.volumeInfo
  } else {
    const q = book.isbn ? `isbn:${book.isbn}` : `intitle:${book.title} inauthor:${book.author}`
    const j = await getJson(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}` +
        `&maxResults=5&printType=books&langRestrict=pt${key ? `&key=${key}` : ''}`
    )
    const items: any[] = j?.items ?? []
    const match = book.isbn
      ? items[0]
      : items.find((i) => normalize(i.volumeInfo?.title ?? '').includes(normalize(book.title)))
    v = match?.volumeInfo
  }

  if (!v) return {}

  const year = v.publishedDate ? parseInt(String(v.publishedDate).slice(0, 4)) : NaN

  return {
    description: v.description ? stripHtml(v.description) : undefined,
    publisher: v.publisher ?? undefined,
    year: Number.isNaN(year) ? undefined : year,
    isbn: pickIsbn(v.industryIdentifiers) ?? undefined,
    coverUrl: fixCover(v.imageLinks?.thumbnail) ?? undefined,
  }
}

// Só editora e ano: a sinopse do Open Library vem em inglês, então não é usada.
async function openLibraryExtra(book: ExternalBook): Promise<Extra> {
  if (!book.isbn) return {}

  const ed = await getJson(`https://openlibrary.org/isbn/${book.isbn}.json`, OL_HEADERS)
  if (!ed) return {}

  const y = parseInt(String(ed.publish_date ?? '').match(/\d{4}/)?.[0] ?? '')

  return {
    publisher: ed.publishers?.[0],
    year: Number.isNaN(y) ? undefined : y,
  }
}

// Completa só o que estiver faltando, sem sobrescrever o que já veio.
export async function enrichBook(book: ExternalBook): Promise<ExternalBook> {
  if (book.description && book.publisher && book.year && book.coverUrl) return book

  const [g, o] = await Promise.all([googleExtra(book), openLibraryExtra(book)])

  return {
    ...book,
    description: book.description ?? g.description ?? null,
    publisher: book.publisher ?? g.publisher ?? o.publisher ?? null,
    year: book.year ?? g.year ?? o.year ?? null,
    isbn: book.isbn ?? g.isbn ?? null,
    coverUrl: book.coverUrl ?? g.coverUrl ?? null,
  }
}