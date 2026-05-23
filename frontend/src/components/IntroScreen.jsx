import React, { useEffect, useState } from 'react'

export default function IntroScreen({ onDone }) {
  const [leaving, setLeaving]   = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const step = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(step); return 100 }
        return p + 2
      })
    }, 20)

    const exitTimer = setTimeout(() => setLeaving(true), 2400)
    const doneTimer = setTimeout(() => onDone(), 3200)

    return () => {
      clearInterval(step)
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)] ${leaving ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="absolute inset-0 bg-mesh-gradient opacity-10 mix-blend-overlay pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="overflow-hidden mb-4">
          <h1 className="text-white text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none animate-[folio-fade-in_1s_ease-out]">
            FOLIO<span className="text-white/20">.</span>
          </h1>
        </div>
        
        <div className="overflow-hidden">
          <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-[0.6em] mb-12 animate-[folio-sub-in_1s_ease-out_0.3s_both]">
            THE BOOKS SHOULD HAVE FOUND YOU SO
          </p>
        </div>

        <div className="w-64 md:w-96 h-[1px] bg-white/10 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="mt-4 flex justify-between w-64 md:w-96">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">EST. 2026</span>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{Math.round(progress)}%</span>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">LOADING</span>
        </div>
      </div>

      <div className="absolute bottom-12 left-12 flex flex-col gap-2 opacity-20">
        <div className="w-12 h-0.5 bg-white" />
        <div className="w-8 h-0.5 bg-white" />
        <div className="w-16 h-0.5 bg-white" />
      </div>
    </div>
  )
}
