const mockBook = {
  title: "A Última Carta",
  author: "Rebecca Yarros",
  coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
  totalPages: 350,
  currentPage: 210,
  synopsis: "Uma história emocionante sobre amor, perda e as cartas que ficaram para trás. Quando Beckett encontra uma carta não enviada de sua esposa falecida, ele embarca em uma jornada para descobrir o verdadeiro significado das palavras que ela deixou.",
  reviews: [
    { id: 1, user: "Maria S.", text: "Chorei do início ao fim. Impossível não se apegar aos personagens", rating: 5 },
    { id: 2, user: "João P.", text: "A escrita é poética, mas o ritmo no meio do livro fica um pouco lento.", rating: 4 },
  ]
};

export default function Home() {
  const percentage = Math.round((mockBook.currentPage / mockBook.totalPages) * 100);

  return (
    <div className="relative overflow-hidden min-h-full">
      {/* Efeito de luz no fundo (futurista) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 p-6 md:p-12">
        {/* Título da Seção */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-blue-400 tracking-widest uppercase bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
            Livro Atual
          </span>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: Capa e Progresso */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center backdrop-blur-sm">
            <div className="w-48 h-72 rounded-xl overflow-hidden shadow-2xl shadow-blue-900/20 mb-6 relative group">
              <img
                src={mockBook.coverUrl}
                alt={mockBook.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 border border-white/10 rounded-xl"></div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-1 text-white">{mockBook.title}</h2>
            <p className="text-zinc-400 text-sm mb-8">{mockBook.author}</p>

            {/* Gráfico de Barra Redonda */}
            <div className="relative w-32 h-32 flex items-center justify-center text-white">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="transparent"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{percentage}%</span>
              </div>
            </div>

            <p className="text-sm text-zinc-400 mt-4">
              Página <strong className="text-white">{mockBook.currentPage}</strong> de {mockBook.totalPages}
            </p>
          </div>

          {/* Coluna 2 e 3: Sinopse e Comentários */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Sinopse */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 text-zinc-200">Sinopse</h3>
              <p className="text-zinc-400 leading-relaxed">
                {mockBook.synopsis}
              </p>
            </div>

            {/* Comentários */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm flex-1">
              <h3 className="text-lg font-semibold mb-6 text-zinc-200">O que as pessoas disseram</h3>

              <div className="space-y-6">
                {mockBook.reviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {review.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-zinc-300">{review.user}</span>
                        <div className="flex text-yellow-500 text-xs">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400">{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800/50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="O que você achou deste livro?"
                    className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-zinc-600"
                  />
                  <button className="bg-white text-black px-6 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}