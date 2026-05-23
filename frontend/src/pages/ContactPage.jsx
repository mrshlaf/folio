import React from 'react'

export default function ContactPage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="container-main">
        <div className="pt-20 pb-32">
          <h1 className="text-7xl md:text-[9rem] font-black text-black leading-[0.8] uppercase tracking-tighter text-center italic animate-[folio-fade-in_1s_ease-out]">
            LET'S<br/>CONNECT<span className="text-black/10">.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-12">
            <div className="glass-panel p-12 rounded-[3rem]">
              <h2 className="text-2xl font-black text-black uppercase tracking-tighter mb-8 border-b-2 border-black/5 pb-6">OUR HEADQUARTERS</h2>
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">LOCATION</p>
                  <p className="text-sm font-extrabold text-black uppercase">Jalan Sudirman No. 45, Jakarta Selatan, Indonesia</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">EMAIL</p>
                  <p className="text-sm font-extrabold text-black uppercase">HELLO@FOLIO.SYSTEM</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">PHONE</p>
                  <p className="text-sm font-extrabold text-black uppercase">+62 812 3456 7890</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {['INSTAGRAM', 'TWITTER', 'LINKEDIN'].map(s => (
                <div key={s} className="flex-1 glass-panel py-8 rounded-3xl text-center cursor-pointer hover:bg-black hover:text-white transition-all duration-500">
                  <p className="text-[9px] font-black uppercase tracking-widest">{s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-12 md:p-20 rounded-[4rem] bg-black text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-12 relative z-10">DROP A MESSAGE</h2>
            <form className="space-y-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">FULL NAME</label>
                <input className="w-full bg-white/5 border-b-2 border-white/10 py-4 outline-none focus:border-white transition-all text-white uppercase font-bold text-sm" placeholder="YOUR NAME" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">EMAIL ADDRESS</label>
                <input className="w-full bg-white/5 border-b-2 border-white/10 py-4 outline-none focus:border-white transition-all text-white uppercase font-bold text-sm" placeholder="EMAIL@EXAMPLE.COM" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">MESSAGE</label>
                <textarea rows={4} className="w-full bg-white/5 border-b-2 border-white/10 py-4 outline-none focus:border-white transition-all text-white uppercase font-bold text-sm" placeholder="HOW CAN WE HELP?" />
              </div>
              <button className="w-full bg-white text-black font-black uppercase tracking-widest py-6 rounded-full hover:bg-neutral-200 transition-all shadow-2xl shadow-white/10 mt-10">
                SEND MESSAGE &rarr;
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
