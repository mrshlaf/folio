import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import BookCard from '../components/BookCard.jsx'
import { GENRES } from '../constants/data.js'

export default function HomePage() {
  const [homepage, setHomepage] = useState([])
  const [hot, setHot] = useState([])
  const [commented, setCommented] = useState([])
  const [viewed, setViewed] = useState([])
  const [slide, setSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const sliderRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [h, ho, co, vi] = await Promise.all([
          api.get('/search/homepage'),
          api.get('/search/hot'),
          api.get('/search/most-commented'),
          api.get('/search/most-viewed')
        ])
        setHomepage(h.data)
        setHot(ho.data)
        setCommented(co.data)
        setViewed(vi.data)
      } catch { }
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (homepage.length === 0) return
    const t = setInterval(() => setSlide(s => (s + 1) % homepage.length), 4000)
    return () => clearInterval(t)
  }, [homepage])

  return (
    <div className="min-h-screen">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-64 animate-[folio-fade-in_1s_ease-out]">
          <div className="text-[10px] font-black text-black/20 uppercase tracking-[1em] animate-pulse">SIFTING THROUGH ARCHIVES...</div>
          <div className="w-48 h-[1px] bg-black/5 mt-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-black animate-[hero-progress_2s_ease-in-out_infinite]" />
          </div>
        </div>
      ) : (
        <>
          {homepage.length > 0 && (
            <section className="relative overflow-hidden h-[38rem] sm:h-[45rem] rounded-b-[4rem] mx-2 shadow-2xl shadow-black/10">
              {homepage.map((book, i) => (
                <div
                  key={book._id}
                  className={`absolute inset-0 transition-all duration-1000 transform ${i === slide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-black/20 z-10" />
                  {book.coverImage && (
                    <img
                      src={book.coverImage.replace('1000/1500', '1920/1080')}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover animate-[mesh-pulse_30s_infinite]"
                    />
                  )}
                  <div className="relative container-main h-full flex flex-col md:flex-row items-center justify-between gap-12 z-20">
                    <div className="flex-1 text-left">
                      <div className="flex gap-3 mb-8 animate-float">
                        {book.genre?.slice(0, 3).map(g => (
                          <span key={g} className="bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">{g}</span>
                        ))}
                      </div>
                      <div className="max-w-4xl space-y-6">
                        <div className="overflow-hidden">
                          <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-black text-white leading-[0.85] uppercase tracking-tighter drop-shadow-2xl italic animate-[folio-fade-in_1s_ease-out]">
                            {book.title}
                          </h1>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="h-0.5 flex-1 bg-gradient-to-r from-white to-transparent opacity-50" />
                          <p className="text-white font-black text-sm sm:text-lg uppercase tracking-[0.5em] whitespace-nowrap">{book.author}</p>
                        </div>
                      </div>
                      <div className="mt-12 flex flex-wrap gap-4">
                        <button onClick={() => navigate(`/book/${book._id}`)} className="bg-white text-black font-black uppercase tracking-widest px-12 py-5 rounded-full hover:bg-black hover:text-white hover:scale-105 transition-all duration-500 shadow-2xl shadow-white/10 group">
                          READ NOW <span className="inline-block group-hover:translate-x-2 transition-transform">&rarr;</span>
                        </button>
                        <button onClick={() => navigate('/search')} className="bg-white/5 backdrop-blur-xl border border-white/10 text-white font-black uppercase tracking-widest px-12 py-5 rounded-full hover:bg-white hover:text-black transition-all duration-500">
                          EXPLORE
                        </button>
                      </div>
                    </div>

                    <div className="hidden lg:block flex-shrink-0 relative group perspective-1000">
                      <div className="absolute -inset-10 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-1000" />
                      <div className="relative w-[300px] aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform rotate-y-12 group-hover:rotate-y-0 transition-all duration-1000 border border-white/20">
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                          <p className="text-white font-black text-lg uppercase tracking-tighter">{book.title}</p>
                          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{book.author}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-30">
                <div className="flex gap-4 bg-black/20 backdrop-blur-xl px-6 py-4 rounded-full border border-white/10 relative overflow-hidden">
                  {homepage.map((_, i) => (
                    <button key={i} onClick={() => setSlide(i)} className={`h-2 transition-all duration-500 rounded-full ${i === slide ? 'bg-white w-12' : 'bg-white/30 w-2 hover:bg-white/50'}`} />
                  ))}
                  {/* Progress Bar Line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-white/50 animate-[hero-progress_4s_linear_infinite]" key={slide} />
                </div>
              </div>
            </section>
          )}

          <div className="container-main py-20 space-y-24">
            <section className="glass-panel p-10 sm:p-16 rounded-[4rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-700 group-hover:bg-black/10" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                  <div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-black uppercase tracking-tighter text-gradient leading-none">DISCOVER GENRES</h2>
                    <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-[0.2em]">Explore our vast collection by category</p>
                  </div>
                  <button onClick={() => navigate('/search')} className="text-[10px] font-extrabold uppercase tracking-widest bg-black text-white px-8 py-3 rounded-full hover:bg-neutral-800 transition-all shadow-xl shadow-black/20">VIEW ALL CATALOG</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {GENRES.slice(0, 10).map(g => (
                    <button
                      key={g}
                      onClick={() => navigate(`/search?genre=${g}`)}
                      className="group/pill relative overflow-hidden bg-white border-2 border-gray-100 px-6 py-10 rounded-[2.5rem] text-center transition-all duration-500 hover:border-black hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-3"
                    >
                      <span className="relative z-10 text-[13px] font-black text-black uppercase tracking-[0.2em]">{g}</span>
                      <div className="absolute top-0 left-0 w-full h-2 bg-black scale-x-0 group-hover/pill:scale-x-100 transition-transform duration-500 origin-left" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div id="new-arrivals">
              {homepage.length > 0 && (
                <Section title="NEW ARRIVALS" link="/search" books={homepage} />
              )}
            </div>
            <div id="hot-books">
              {hot.length > 0 && (
                <Section title="HOT BOOKS" link="/search?hot=1" books={hot} />
              )}
            </div>
            <div id="most-discussed">
              {commented.length > 0 && (
                <Section title="MOST DISCUSSED" link="/search?sort=commented" books={commented} />
              )}
            </div>
            <div id="most-viewed">
              {viewed.length > 0 && (
                <Section title="MOST VIEWED" link="/search?sort=viewed" books={viewed} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Section({ title, link, books }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <h2 className="section-title m-0 text-gradient">{title}</h2>
        <Link to={link} className="text-[10px] text-black font-extrabold uppercase tracking-widest hover:underline transition-all py-2 px-4 glass-panel rounded-full">VIEW ALL &rarr;</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
        {books.map(b => <BookCard key={b._id} book={b} />)}
      </div>
    </section>
  )
}
