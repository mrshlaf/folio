import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios.js'
import BookCard from '../components/BookCard.jsx'
import { GENRES } from '../constants/data.js'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [books, setBooks]   = useState([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(1)
  const [loading, setLoading] = useState(false)

  const q     = params.get('q')     || ''
  const genre = params.get('genre') || ''
  const hot   = params.get('hot')   || ''
  const sort  = params.get('sort')  || ''
  const page  = Number(params.get('page') || 1)

  const [query, setQuery]       = useState(q)
  const [selGenre, setSelGenre] = useState(genre)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        if (hot) {
          const { data } = await api.get('/search/hot')
          setBooks(data); setTotal(data.length); setPages(1)
        } else if (sort === 'commented') {
          const { data } = await api.get('/search/most-commented')
          setBooks(data); setTotal(data.length); setPages(1)
        } else if (sort === 'viewed') {
          const { data } = await api.get('/search/most-viewed')
          setBooks(data); setTotal(data.length); setPages(1)
        } else {
          const p = new URLSearchParams()
          if (q)     p.set('q', q)
          if (genre) p.set('genre', genre)
          p.set('page', page)
          p.set('limit', 24)
          const { data } = await api.get(`/search/search?${p}`)
          setBooks(data.books); setTotal(data.total); setPages(data.pages)
        }
      } catch {}
      setLoading(false)
    }
    loadData()
  }, [q, genre, hot, sort, page])

  const applyFilter = () => {
    const p = new URLSearchParams()
    if (query)    p.set('q', query)
    if (selGenre) p.set('genre', selGenre)
    p.set('page', 1)
    setParams(p)
  }

  const goPage = (n) => {
    const p = new URLSearchParams(params)
    p.set('page', n)
    setParams(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageTitle = hot ? 'HOT BOOKS' : sort === 'commented' ? 'DISCUSSED' : sort === 'viewed' ? 'VIEWED' : q ? `RESULTS: "${q}"` : genre ? `GENRE: ${genre}` : 'CATALOG'

  if (loading && books.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen animate-[folio-fade-in_1s_ease-out]">
        <div className="text-[10px] font-black text-black/20 uppercase tracking-[1em] animate-pulse">EXTRACTING METADATA...</div>
        <div className="w-48 h-[1px] bg-black/5 mt-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black animate-[hero-progress_2s_ease-in-out_infinite]" />
        </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-32">
      <div className="container-main">
        {/* Cinematic Massive Header */}
        <div className="pt-20 pb-20 border-b-4 border-black mb-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
            <div>
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.5em] mb-4">ARCHIVE EXPLORATION</p>
              <h1 className="text-6xl md:text-9xl font-black text-black uppercase tracking-tighter leading-none italic">
                {pageTitle}<span className="text-black/10">.</span>
              </h1>
            </div>
            <div className="text-right">
                <p className="text-5xl font-black text-black tracking-tighter">{total}</p>
                <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] mt-2">ENTRIES DISCOVERED</p>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Refined Sidebar Filter */}
          {!hot && !sort && (
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="glass-panel p-10 rounded-[3rem] sticky top-32">
                <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-10 border-b-2 border-black/5 pb-4">FILTERS</h3>
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em]">KEYWORDS</label>
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyFilter()}
                      placeholder="TITLE / AUTHOR"
                      className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-xs placeholder:text-black/20"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em]">CLASSIFICATION</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelGenre('')}
                        className={`text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all border ${!selGenre ? 'bg-black text-white' : 'bg-white text-black/40 border-black/5 hover:bg-black hover:text-white'}`}
                      >ALL GENRES</button>
                      {GENRES.map(g => (
                        <button
                          key={g}
                          onClick={() => setSelGenre(g === selGenre ? '' : g)}
                          className={`text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all border ${selGenre === g ? 'bg-black text-white' : 'bg-white text-black/40 border-black/5 hover:bg-black hover:text-white'}`}
                        >{g}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={applyFilter} className="w-full bg-black text-white font-black uppercase tracking-widest py-5 rounded-full hover:bg-neutral-800 transition-all shadow-2xl shadow-black/20 mt-6">
                    UPDATE RESULTS
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            {books.length === 0 ? (
              <div className="text-center py-40 glass-panel rounded-[4rem]">
                <div className="text-8xl mb-8 animate-float">📭</div>
                <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-4">NO ARCHIVES FOUND</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">TRY ADJUSTING YOUR FILTERS OR KEYWORDS</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                  {books.map(b => (
                    <div key={b._id} className="animate-[folio-sub-in_0.5s_ease-out]">
                      <BookCard book={b} />
                    </div>
                  ))}
                </div>

                {/* Refined Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center items-center gap-10 mt-24 pt-12 border-t-2 border-black/5">
                    <button
                      onClick={() => goPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="text-[10px] font-black uppercase tracking-widest disabled:opacity-20 hover:scale-110 transition-transform"
                    >
                      &larr; PREVIOUS
                    </button>
                    
                    <div className="px-10 py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                      PAGE {page} OF {pages}
                    </div>

                    <button
                      onClick={() => goPage(Math.min(pages, page + 1))}
                      disabled={page === pages}
                      className="text-[10px] font-black uppercase tracking-widest disabled:opacity-20 hover:scale-110 transition-transform"
                    >
                      NEXT &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
