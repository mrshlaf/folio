import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import BookCard from '../components/BookCard.jsx'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, l] = await Promise.all([api.get('/users/profile'), api.get('/users/library')])
        setProfile(p.data)
        setLibrary(l.data)
      } catch { }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-64 animate-[folio-fade-in_1s_ease-out]">
        <div className="text-[10px] font-black text-black/20 uppercase tracking-[1em] animate-pulse">IDENTIFYING USER...</div>
        <div className="w-48 h-[1px] bg-black/5 mt-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black animate-[hero-progress_2s_ease-in-out_infinite]" />
        </div>
    </div>
  )

  return (
    <div className="min-h-screen py-12">
      <div className="container-main max-w-4xl">
        <div className="glass-panel rounded-[3rem] p-10 mb-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-black/20 animate-float">
              {profile?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-black uppercase tracking-tighter mb-1 text-gradient">{profile?.fullName}</h1>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{profile?.email}</p>
              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${profile?.role === 'admin' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-black text-white shadow-black/20'}`}>
                {profile?.role === 'admin' ? 'ADMINISTRATOR' : 'MEMBER'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'UMUR', value: profile?.age ? `${profile.age} TAHUN` : '-' },
              { label: 'PEKERJAAN', value: profile?.job || '-' },
              { label: 'NEGARA', value: profile?.country || '-' },
              { label: 'NO. HP', value: profile?.phone || '-' }
            ].map(i => (
              <div key={i.label} className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50 hover:bg-white/80 transition-colors">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{i.label}</p>
                <p className="text-sm font-extrabold text-black uppercase">{i.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[3rem] p-8 mb-10">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200/50 pb-4">
            <h2 className="section-title text-gradient">PERPUSTAKAAN SAYA ({library.length})</h2>
            <Link to="/library" className="text-[10px] text-black font-extrabold uppercase tracking-widest hover:underline">LIHAT SEMUA &rarr;</Link>
          </div>
          {library.length === 0
            ? <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BELUM ADA BUKU. CHECKOUT BUKU UNTUK MULAI MEMBACA!</p>
            : (
              <div className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-4">
                {library.slice(0, 5).map(b => (
                  <div key={b.bookId?._id} className="flex-shrink-0 w-40">
                    <BookCard book={b.bookId || {}} />
                  </div>
                ))}
              </div>
            )}
        </div>

        {profile?.myComments?.length > 0 && (
          <div className="glass-panel rounded-[3rem] p-8">
            <h2 className="section-title mb-6 border-b border-gray-200/50 pb-4 text-gradient">KOMENTAR TERBARU SAYA</h2>
            <div className="space-y-4">
              {profile.myComments.slice(-5).reverse().map((c, i) => (
                <div key={i} className="border-b border-gray-200/50 pb-4 last:border-0">
                  <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">
                    BUKU: <Link to={`/book/${c.bookId}`} className="text-black hover:underline">{c.bookId}</Link>
                  </p>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">{c.text}</p>
                  <p className="text-[9px] font-bold text-gray-300 mt-2 uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
