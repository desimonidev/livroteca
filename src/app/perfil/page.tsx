import { Suspense } from 'react'
import { ProfileForm } from './ProfileForm'

export default function MeuPerfil() {
  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto relative z-10">
      <h1 className="text-3xl font-bold text-white mb-8">Meu Perfil</h1>
      
      <Suspense fallback={
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 h-[400px] animate-pulse flex items-center justify-center text-zinc-500">
          Carregando dados do perfil...
        </div>
      }>
        <ProfileForm />
      </Suspense>
    </div>
  )
}