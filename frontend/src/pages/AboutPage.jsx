import React from 'react'

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="container-main">
        {/* Massive Cinematic Header */}
        <div className="pt-20 pb-32 text-center overflow-hidden">
          <div className="relative inline-block">
             <div className="absolute -inset-4 bg-black/5 blur-3xl rounded-full" />
             <h1 className="relative text-7xl md:text-[10rem] font-black text-black leading-[0.8] uppercase tracking-tighter italic animate-[folio-fade-in_1s_ease-out]">
                THE<br/>VISION<span className="text-black/10">.</span>
             </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="glass-panel p-12 md:p-20 rounded-[4rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -mr-16 -mt-16" />
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-8 border-b-2 border-black/5 pb-6">BEYOND A LIBRARY</h2>
            <p className="text-lg md:text-xl font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
              Folio is the next-generation digital ecosystem designed for those who seek knowledge with style. 
              We bridge the gap between classical literature and modern digital aesthetics.
            </p>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group">
            <img 
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" 
                alt="Library"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: 'CURATED CORE', desc: 'Every title in our system is hand-picked for quality and relevance.' },
            { title: 'BOUNDLESS ACCESS', desc: 'Read across any device with zero friction and pure focus.' },
            { title: 'MODERN LITERACY', desc: 'Redefining the reading experience for the digital generation.' }
          ].map(f => (
            <div key={f.title} className="glass-panel p-12 rounded-[3rem] hover:-translate-y-4 transition-all duration-500 group border-2 border-transparent hover:border-black/5">
              <div className="w-12 h-1 bg-black mb-8 group-hover:w-24 transition-all duration-500" />
              <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-4">{f.title}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-loose">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
