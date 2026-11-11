'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        {
            name: 'Início',
            href: '/',
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Acervo',
            href: '/acervo',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        }
    ]

    return (
        <aside className="w-20 md:w-64 h-screen sticky top-0 left-0 flex flex-col bg-zinc-950 border-r border-zinc-800 z-50 transition-all">
            {/* Logo (Oculto no mobile) */}
            <div className="h-20 flex items-center justify-center md:justify-start md:px-8 border-b border-zinc-800">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hidden md:block">
                    LivroTeca.
                </Link>
                <span className="text-2xl font-bold text-blue-500 md:hidden">L.</span>
            </div>

            {/* Links de Navegação */}
            <nav className="flex-1 py-8 flex flex-col gap-2 px-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                                }`}
                        >
                            <div className={`${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                {item.icon}
                            </div>
                            <span className="font-medium hidden md:block">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}