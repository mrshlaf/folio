import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import BookCard from '../components/BookCard.jsx'

export default function LibraryPage() {
  const navigate = useNavigate()
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/library')
      .then(r => { setLibrary(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-mesh-gradient">
      <div className="w-16 h-16 border-4 border-black/10 border-t-black rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Opening Vault...</p>
    </div>
  )

  return (
    <div className="min-h-screen pb-32">
      <div className="container-main">
        {/* Cinematic Header */}
        <div className="pt-20 pb-20">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 border-b-4 border-black pb-12">
            <div>
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.5em] mb-4">PERSONAL COLLECTION</p>
              <h1 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter leading-none italic">
                MY LIBRARY<span className="text-black/10">.</span>
              </h1>
            </div>
            <div className="glass-panel px-10 py-6 rounded-3xl text-center">
                <p className="text-4xl font-black text-black leading-none">{library.length}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">TITLES ACQUIRED</p>
            </div>
          </div>
        </div>
        
        {library.length === 0 ? (
          <div className="text-center py-40 glass-panel rounded-[4rem]">
            <div className="text-8xl mb-8 animate-float">📚</div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-4">YOUR VAULT IS EMPTY</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">BEGIN YOUR JOURNEY BY EXPLORING THE CATALOG</p>
            <button onClick={() => navigate('/search')} className="bg-black text-white px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-105 transition-transform">
                EXPLORE CATALOG &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {library.map(b => b.bookId && (
                <div key={b.bookId._id} className="animate-[folio-sub-in_0.5s_ease-out]">
                    <BookCard book={b.bookId} />
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
