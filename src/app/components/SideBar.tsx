import Link from 'next/link'
import { Suspense } from 'react'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="w-20 md:w-64 h-screen sticky top-0 left-0 flex flex-col bg-zinc-950 border-r border-zinc-800 z-50 transition-all">
      {/* Logo */}
      <div className="h-20 flex items-center justify-center md:justify-start md:px-8 border-b border-zinc-800">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hidden md:block">
          LivroTeca.
        </Link>
        <span className="text-2xl font-bold text-blue-500 md:hidden">L.</span>
      </div>

      {/* Navbar protegida pelo Suspense */}
      <Suspense fallback={<div className="flex-1 py-8 px-3"><div className="h-10 bg-zinc-800 animate-pulse rounded-xl"></div></div>}>
        <SidebarNav />
      </Suspense>
    </aside>
  )
}