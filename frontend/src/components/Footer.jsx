import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-12 mt-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container-main relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link to="/" className="inline-block">
              <span className="font-black text-4xl tracking-tighter uppercase leading-none">FOLIO<span className="text-white/40">.</span></span>
            </Link>
            <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] leading-relaxed max-w-xs">
              The ultimate digital library for the next generation of readers. Curated, cinematic, and boundless.
            </p>
            <div className="flex gap-4">
              {['FB', 'TW', 'IG', 'YT'].map(s => (
                <div key={s} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black hover:bg-white hover:text-black transition-all cursor-pointer">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-xs text-white mb-8 uppercase tracking-[0.3em]">EXPLORE</h4>
            <ul className="space-y-4">
              {[
                { to: '/', label: 'HOME' },
                { to: '/search', label: 'CATALOG' },
                { to: '/search?hot=1', label: 'HOT BOOKS' },
                { to: '/search?sort=commented', label: 'MOST DISCUSSED' }
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-[0.2em] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs text-white mb-8 uppercase tracking-[0.3em]">ACCOUNT</h4>
            <ul className="space-y-4">
              {[
                { to: '/login', label: 'SIGN IN' },
                { to: '/register', label: 'REGISTER' },
                { to: '/profile', label: 'MY PROFILE' },
                { to: '/library', label: 'MY LIBRARY' }
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-[0.2em] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-black text-xs text-white mb-8 uppercase tracking-[0.3em]">NEWSLETTER</h4>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Join the folio club for exclusive updates.</p>
            <div className="relative group">
              <input 
                placeholder="YOUR EMAIL" 
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-xs font-black outline-none focus:border-white/40 transition-all text-white placeholder:text-white/20"
              />
              <button className="absolute right-2 top-2 bg-white text-black px-4 py-2 rounded-full text-[10px] font-black hover:bg-neutral-200 transition-colors uppercase">JOIN</button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">© 2026 FOLIO CATALOG SYSTEM. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <Link to="/about" className="text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.3em]">ABOUT</Link>
            <Link to="/contact" className="text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.3em]">CONTACT</Link>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">PRIVACY</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
