import { Suspense } from 'react'
import Link from 'next/link'
import { EditForm } from './EditForm'

export default function EditarLivro({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto relative z-10">
      <div className="mb-4">
        <Link href="/admin" className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar para o Painel
        </Link>
      </div>

      {/* Passamos o params INTEIRO (a Promise) para dentro do Suspense */}
      <Suspense fallback={
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex justify-center animate-pulse h-[600px] mt-8 items-center">
          <p className="text-zinc-500">Carregando informações do livro...</p>
        </div>
      }>
        <EditForm params={params} />
      </Suspense>
    </div>
  )
}