// src/app/usuarios/[id]/page.tsx
import { Suspense } from 'react'
import { ProfileData } from './ProfileData'

export default function PerfilUsuario({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto relative z-10">
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      <Suspense fallback={<div className="animate-pulse text-zinc-500">Carregando perfil...</div>}>
        {/* Passamos a Promise do params inteira para o componente */}
        <ProfileData params={params} />
      </Suspense>
    </div>
  )
}