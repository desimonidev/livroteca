import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import { UserProfile } from './components/UserProfile'
import { Sidebar } from './components/SideBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LivroTeca',
  description: 'Sua estante virtual e rede social de leitura.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 flex min-h-screen`}>
        
        {/* A Sidebar fica fixa na esquerda */}
        <Sidebar />

        {/* O conteúdo da página fica à direita */}
        <main className="flex-1 flex flex-col min-h-screen relative bg-zinc-950">
          {/* Header Global com o Perfil do Usuário */}
          <header className="h-20 flex items-center justify-end px-6 md:px-12 border-b border-zinc-800/50 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40">
            <Suspense fallback={<div className="h-10 w-32 bg-zinc-800 animate-pulse rounded-full"></div>}>
              <UserProfile />
            </Suspense>
          </header>

          {/* Aqui é onde as páginas (Home, Acervo, etc) são renderizadas */}
          <div className="flex-1">
            {children}
          </div>
        </main>

      </body>
    </html>
  )
}