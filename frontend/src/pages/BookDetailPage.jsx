import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios.js'
import StarRating from '../components/StarRating.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { OPTIONAL_ATTR_TYPES } from '../constants/data.js'

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [book, setBook] = useState(null)
  const [owned, setOwned] = useState(false)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [msg, setMsg] = useState('')
  const [attrModal, setAttrModal] = useState(false)
  const [newAttr, setNewAttr] = useState({ key: '', label: '', type: 'other', value: '' })

  const fetchBook = async () => {
    try {
      const { data } = await api.get(`/books/${id}`)
      setBook(data)
      try { await api.post(`/books/${id}/click`) } catch (err) {}
    } catch { navigate('/') }
    setLoading(false)
  }

  const checkOwned = async () => {
    if (!user) return
    try {
      const { data } = await api.get('/users/library')
      setOwned(data.some(b => b.bookId?._id === id || b.bookId === id))
    } catch {}
  }

  useEffect(() => { fetchBook(); checkOwned() }, [id])

  const handleCheckout = async () => {
    if (!user) return navigate('/login')
    try {
      await api.post(`/books/${id}/checkout`)
      setOwned(true)
      setMsg('Book added to your library!')
    } catch (e) { setMsg(e.response?.data?.message || 'Checkout failed') }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    try {
      await api.post(`/books/${id}/comment`, { text: comment })
      setComment('')
      await fetchBook()
    } catch (e) { setMsg(e.response?.data?.message || 'Failed to post comment') }
  }

  const handleRate = async (score) => {
    if (!user) return navigate('/login')
    try {
      const { data } = await api.post(`/books/${id}/rate`, { score })
      setRating(score)
      setBook(b => ({ ...b, averageRating: data.averageRating, weightedRating: data.weightedRating, totalRatings: data.totalRatings }))
    } catch {}
  }

  const handleAddAttr = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/books/${id}/attribute`, newAttr)
      setAttrModal(false)
      setNewAttr({ key: '', label: '', type: 'other', value: '' })
      await fetchBook()
    } catch (e) { setMsg(e.response?.data?.message || 'Failed to add attribute') }
  }

  const handleArchive = async () => {
    try {
      await api.patch(`/books/${id}/archive`)
      navigate('/')
    } catch (e) { setMsg(e.response?.data?.message || 'Failed to archive book') }
  }

  const handleLike = async (commentId) => {
    if (!user) return navigate('/login')
    try {
      await api.post(`/books/${id}/comment/${commentId}/like`)
      await fetchBook()
    } catch {}
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-mesh-gradient">
      <div className="w-16 h-16 border-4 border-black/10 border-t-black rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Opening Grimoire...</p>
    </div>
  )
  if (!book) return null

  return (
    <div className="min-h-screen bg-white">
      {/* Cinematic Banner */}
      <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={book.coverImage} className="w-full h-full object-cover blur-3xl scale-110 opacity-30" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>
        
        <div className="container-main relative h-full flex flex-col md:flex-row items-center md:items-end justify-center md:justify-start gap-12 pb-20 z-10">
          {/* Main Cover */}
          <div className="w-64 md:w-96 flex-shrink-0 relative group perspective-1000">
            <div className="absolute -inset-6 bg-black/5 rounded-[3rem] blur-2xl group-hover:bg-black/10 transition-all duration-700" />
            <img 
              src={book.coverImage} 
              className="w-full aspect-[2/3] object-cover rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform rotate-y-6 group-hover:rotate-y-0 transition-all duration-1000 border-8 border-white/50 backdrop-blur-xl" 
              alt={book.title} 
            />
            <div className="absolute top-6 left-6 flex flex-col gap-2">
                {book.shelf === 'hot' && <span className="bg-red-500 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl animate-pulse">HOT SHELF</span>}
                <span className={`text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl ${book.accessType === 'free' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    {book.accessType === 'free' ? 'FREE' : 'PREMIUM'}
                </span>
            </div>
          </div>

          <div className="text-center md:text-left flex-1 max-w-4xl">
            <p className="text-[10px] md:text-xs font-black text-black/40 uppercase tracking-[0.5em] mb-4 animate-[folio-sub-in_0.8s_ease]">{book.author}</p>
            <h1 className="text-5xl md:text-8xl font-black text-black uppercase tracking-tighter leading-[0.85] mb-8 animate-[folio-fade-in_1s_ease-out]">
              {book.title}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                <div className="bg-black/5 backdrop-blur-xl border border-black/5 rounded-full px-6 py-3">
                    <StarRating score={book.averageRating || 0} total={book.totalRatings || 0} size="lg" />
                </div>
                <div className="flex gap-2">
                    {book.genre?.slice(0, 3).map(g => (
                        <span key={g} className="bg-white border border-black/5 shadow-sm text-[9px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest">{g}</span>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main -mt-10 relative z-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-16">
            <div className="glass-panel p-10 md:p-16 rounded-[4rem]">
              <h2 className="text-2xl font-black text-black uppercase tracking-tighter mb-8 border-b-2 border-black/5 pb-6">SPECIFICATIONS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {[
                  { label: 'PUBLISHER', value: book.publisher },
                  { label: 'YEAR', value: book.releaseYear },
                  { label: 'PAGES', value: `${book.pageCount} HLM` },
                  { label: 'ISBN', value: book.isbn },
                  { label: 'VIEWS', value: `${book.uniqueViewers || 0} READERS` },
                  { label: 'TIER', value: book.shelf === 'hot' ? 'HOT' : 'COLD' }
                ].map(a => (
                  <div key={a.label}>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{a.label}</p>
                    <p className="text-sm font-extrabold text-black uppercase tracking-tight">{a.value || '-'}</p>
                  </div>
                ))}
                {book.optionalAttributes?.map(a => (
                  <div key={a.key}>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{a.label}</p>
                    <p className="text-sm font-extrabold text-black uppercase tracking-tight">{String(a.value || '-')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-10 md:p-16 rounded-[4rem]">
              <div className="flex items-center justify-between mb-12 border-b-2 border-black/5 pb-6">
                <h2 className="text-2xl font-black text-black uppercase tracking-tighter">READER REVIEWS</h2>
                <div className="flex items-center gap-4">
                  {[1,2,3,4,5].map(s => (
                    <button 
                      key={s} 
                      onMouseEnter={() => setHoverRating(s)} 
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRate(s)}
                      className={`text-xl transition-all duration-300 ${s <= (hoverRating || rating) ? 'text-black scale-125' : 'text-black/10'}`}
                    >★</button>
                  ))}
                </div>
              </div>

              {user && (
                <form onSubmit={handleComment} className="mb-16">
                    <div className="relative group">
                        <textarea 
                            value={comment} 
                            onChange={e => setComment(e.target.value)} 
                            placeholder="YOUR THOUGHTS..."
                            rows={3} 
                            className="w-full bg-black/5 border-2 border-transparent rounded-[2rem] px-8 py-6 text-sm font-black outline-none focus:bg-white focus:border-black/5 focus:shadow-2xl transition-all uppercase placeholder:text-black/20"
                        />
                        <button type="submit" className="absolute right-4 bottom-4 bg-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">POST</button>
                    </div>
                </form>
              )}

              <div className="space-y-12">
                {book.embeddedComments?.length === 0 ? (
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center py-10">No reviews yet. Be the first.</p>
                ) : (
                  book.embeddedComments.slice().reverse().map(c => (
                    <div key={c._id} className="group relative pl-10 border-l-2 border-black/5 py-2">
                        <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-black group-hover:scale-150 transition-transform" />
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black text-black uppercase tracking-widest">{c.userName}</p>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${c.sentiment === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {c.sentiment}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase leading-relaxed mb-4 italic">"{c.text}"</p>
                        <button onClick={() => handleLike(c._id)} className="text-[9px] font-black text-black/40 hover:text-black uppercase tracking-widest transition-colors flex items-center gap-2">
                            <span>❤️</span> {c.likes?.length || 0} APPRECIATION
                        </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-8">
            <div className="glass-panel p-10 rounded-[3rem] sticky top-32">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">ACCESS TIER</p>
              <h3 className="text-4xl font-black text-black tracking-tighter mb-10">
                {book.accessType === 'free' ? 'FREE' : `Rp ${book.price?.toLocaleString('id-ID')}`}
              </h3>
              
              <div className="space-y-4">
                <button 
                  onClick={() => window.open(book.driveLink || 'https://drive.google.com/file/d/1Gs2lkAelCje1xCGzRpcgSO12ZGHhe-17/view?usp=sharing', '_blank')} 
                  className="w-full bg-black text-white font-black uppercase tracking-widest py-6 rounded-full hover:bg-neutral-800 transition-all shadow-2xl shadow-black/20"
                >
                  START READING &rarr;
                </button>
                {owned ? (
                  <Link to="/library" className="block w-full text-center border-2 border-black text-black font-black uppercase tracking-widest py-6 rounded-full hover:bg-black hover:text-white transition-all">
                    IN YOUR LIBRARY
                  </Link>
                ) : (
                  <button onClick={handleCheckout} className="w-full border-2 border-black text-black font-black uppercase tracking-widest py-6 rounded-full hover:bg-black hover:text-white transition-all">
                    {book.accessType === 'free' ? 'CLAIM FREE' : 'CHECKOUT BOOK'}
                  </button>
                )}
              </div>

              <div className="mt-12 pt-8 border-t-2 border-black/5 space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">AVAILABILITY</p>
                    <p className="text-[10px] font-black text-green-500 uppercase">INSTANT ACCESS</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">DRM STATUS</p>
                    <p className="text-[10px] font-black text-black uppercase tracking-tighter">SECURED</p>
                </div>
              </div>
            </div>

            {isAdmin && (
                <div className="glass-panel p-10 rounded-[3rem] border-2 border-red-500/10">
                    <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-6">ADMIN CONTROLS</h4>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => setAttrModal(true)} className="w-full bg-black/5 text-black font-black text-[10px] py-4 rounded-2xl hover:bg-black hover:text-white transition-all uppercase">+ ATTR</button>
                        <button onClick={handleArchive} className="w-full bg-red-500 text-white font-black text-[10px] py-4 rounded-2xl hover:bg-red-600 transition-all uppercase">ARCHIVE</button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {attrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[200] p-6">
          <div className="glass-panel p-12 rounded-[3rem] w-full max-w-lg">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">ADD ATTRIBUTE</h2>
            <form onSubmit={handleAddAttr} className="space-y-6">
              <input value={newAttr.key} onChange={e => setNewAttr(a => ({...a, key: e.target.value}))} placeholder="KEY ID" className="w-full bg-black/5 border-2 border-transparent rounded-2xl px-6 py-4 font-black uppercase text-xs" />
              <input value={newAttr.label} onChange={e => setNewAttr(a => ({...a, label: e.target.value}))} placeholder="DISPLAY LABEL" className="w-full bg-black/5 border-2 border-transparent rounded-2xl px-6 py-4 font-black uppercase text-xs" />
              <select value={newAttr.type} onChange={e => setNewAttr(a => ({...a, type: e.target.value}))} className="w-full bg-black/5 border-2 border-transparent rounded-2xl px-6 py-4 font-black uppercase text-xs">
                {OPTIONAL_ATTR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input value={newAttr.value} onChange={e => setNewAttr(a => ({...a, value: e.target.value}))} placeholder="VALUE" className="w-full bg-black/5 border-2 border-transparent rounded-2xl px-6 py-4 font-black uppercase text-xs" />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-black text-white font-black py-5 rounded-full uppercase tracking-widest shadow-xl">ADD</button>
                <button type="button" onClick={() => setAttrModal(false)} className="flex-1 border-2 border-black text-black font-black py-5 rounded-full uppercase tracking-widest">CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
