import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const navLinks = [
    { to: '/', label: 'HOME' },
    { to: '/search', label: 'CATALOG' },
    { to: '/search?hot=1', label: 'HOT BOOKS' },
    { to: '/search?sort=commented', label: 'DISCUSSED' },
    { to: '/search?sort=viewed', label: 'VIEWED' }
  ]

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-2' : 'py-6'}`}>
      {/* Top Utility Bar */}
      {!scrolled && (
        <div className="container-main flex justify-end gap-6 mb-4 animate-[folio-sub-in_0.5s_ease]">
          {['PROMO', 'ABOUT', 'CONTACT'].map(label => (
            <Link key={label} to={label === 'PROMO' ? '/search?genre=Promo' : `/${label.toLowerCase()}`} className="text-[9px] font-black text-black/40 hover:text-black uppercase tracking-[0.3em] transition-colors">{label}</Link>
          ))}
        </div>
      )}

      <div className={`container-main transition-all duration-500 ${scrolled ? 'max-w-6xl' : ''}`}>
        <div className={`glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-4 border-2 transition-all duration-500 ${scrolled ? 'bg-white/90 shadow-2xl border-black/5' : 'bg-white/40 border-transparent shadow-xl shadow-black/5'}`}>
          
          <Link to="/" className="flex items-center gap-1 group px-2">
            <span className="font-black text-2xl tracking-tighter uppercase transition-transform group-hover:scale-105">FOLIO<span className="text-black/40">.</span></span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:block relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <SearchIcon />
            </div>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="SEARCH CATALOG..."
              className="w-full bg-black/5 border-2 border-transparent rounded-full pl-12 pr-6 py-2.5 text-[11px] font-black outline-none focus:bg-white focus:border-black/10 focus:shadow-xl transition-all uppercase tracking-widest placeholder:text-black/40 text-black"
            />
          </form>

          <nav className="hidden lg:flex items-center gap-8 px-4">
            {navLinks.map(link => (
              <Link 
                key={link.label} 
                to={link.to} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-black hover:scale-110 ${location.pathname === link.to ? 'text-black border-b-2 border-black' : 'text-black/40'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-full hover:scale-105 transition-transform shadow-xl shadow-black/20"
                >
                  <UserIcon />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{user.fullName.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-4 w-56 glass-panel rounded-3xl overflow-hidden shadow-2xl border-2 border-black/5 p-2 animate-[folio-sub-in_0.3s_ease]">
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-6 py-4 text-[10px] font-black text-black/40 hover:text-black hover:bg-black/5 rounded-2xl transition-all uppercase tracking-widest">MY PROFILE</Link>
                    <Link to="/library" onClick={() => setMenuOpen(false)} className="block px-6 py-4 text-[10px] font-black text-black/40 hover:text-black hover:bg-black/5 rounded-2xl transition-all uppercase tracking-widest">MY LIBRARY</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-6 py-4 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest">ADMIN PANEL</Link>}
                    <button onClick={() => { logout(); setMenuOpen(false) }} className="w-full text-left px-6 py-4 mt-2 text-[10px] font-black bg-black text-white rounded-2xl hover:bg-neutral-800 shadow-xl transition-all uppercase tracking-widest">LOGOUT</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors text-black/40">LOGIN</Link>
                <Link to="/register" className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-105 transition-transform">JOIN</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
