import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { GENRES } from '../constants/data.js'

export default function AdminPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title:'', author:'', releaseYear:'', isbn:'', accessType:'free',
    price:'', pageCount:'', publisher:'', genre:[], coverImage:''
  })
  const [msg, setMsg]   = useState('')
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleGenre = (g) => {
    setForm(f => ({
      ...f,
      genre: f.genre.includes(g) ? f.genre.filter(x => x !== g) : [...f.genre, g]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setMsg(''); setLoading(true)
    try {
      const payload = {
        ...form,
        releaseYear: Number(form.releaseYear),
        pageCount:   Number(form.pageCount),
        price:       form.accessType === 'sale' ? Number(form.price) : 0
      }
      const { data } = await api.post('/books/add', payload)
      setMsg(`BUKU "${data.title}" BERHASIL DITAMBAHKAN!`)
      setForm({ title:'', author:'', releaseYear:'', isbn:'', accessType:'free', price:'', pageCount:'', publisher:'', genre:[], coverImage:'' })
    } catch (e) {
      setErr(e.response?.data?.message || 'GAGAL MENAMBAHKAN BUKU')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="container-main max-w-4xl">
        <div className="pt-20 pb-20">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 border-b-4 border-black pb-12">
            <div>
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.5em] mb-4">SYSTEM ARCHITECT</p>
              <h1 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter leading-none italic">
                CONTROL<br/>CENTER<span className="text-black/10">.</span>
              </h1>
            </div>
            <div className="glass-panel px-10 py-6 rounded-3xl text-center">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black text-black uppercase tracking-widest">LIVE STATUS</p>
                </div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">SYNCED TO FOLIO DATABASE</p>
            </div>
          </div>
        </div>

        {msg && <div className="bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full px-8 py-4 mb-10 shadow-2xl animate-[folio-fade-in_0.5s_ease]">{msg}</div>}
        {err && <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full px-8 py-4 mb-10 shadow-2xl animate-[folio-fade-in_0.5s_ease]">{err}</div>}

        <div className="glass-panel rounded-[4rem] p-12 md:p-20">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Field label="BOOK TITLE" required>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="ENTER TITLE" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
              </Field>
              <Field label="AUTHOR" required>
                <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="ENTER AUTHOR" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
              </Field>
              <Field label="RELEASE YEAR" required>
                <input type="number" value={form.releaseYear} onChange={e => set('releaseYear', e.target.value)} placeholder="2024" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
              </Field>
              <Field label="PAGE COUNT" required>
                <input type="number" value={form.pageCount} onChange={e => set('pageCount', e.target.value)} placeholder="300" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
              </Field>
              <Field label="ISBN-13" required>
                <input value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-XXXXX" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
              </Field>
              <Field label="PUBLISHER" required>
                <input value={form.publisher} onChange={e => set('publisher', e.target.value)} placeholder="ENTER PUBLISHER" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
              </Field>
            </div>

            <Field label="IMAGE ARCHIVE URL" required>
              <input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="HTTPS://IMAGE-HOST.COM/COVER.JPG" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
              {form.coverImage && (
                <div className="mt-8 relative w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <img src={form.coverImage} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
                </div>
              )}
            </Field>

            <Field label="ACCESS ARCHITECTURE" required>
              <div className="flex gap-10">
                {['free','sale'].map(t => (
                  <label key={t} className="flex items-center gap-4 cursor-pointer group">
                    <input type="radio" name="accessType" value={t} checked={form.accessType === t}
                      onChange={() => set('accessType', t)} className="w-5 h-5 accent-black" />
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${form.accessType === t ? 'text-black' : 'text-black/20'}`}>
                      {t === 'free' ? 'PUBLIC DOMAIN' : 'PREMIUM ASSET'}
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            {form.accessType === 'sale' && (
              <Field label="VALUATION (RP)" required>
                <input type="number" min={0} value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="0" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
              </Field>
            )}

            <Field label="GENRE CLASSIFICATION (MIN 1)" required>
              <div className="flex flex-wrap gap-3 p-8 bg-black/5 rounded-[3rem]">
                {GENRES.map(g => (
                  <button type="button" key={g} onClick={() => toggleGenre(g)}
                    className={`text-[9px] font-black px-6 py-3 rounded-full uppercase tracking-widest transition-all ${form.genre.includes(g) ? 'bg-black text-white shadow-2xl' : 'bg-white text-black/40 hover:bg-black hover:text-white shadow-sm'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </Field>

            <div className="flex flex-col sm:flex-row gap-6 pt-10">
              <button type="submit" disabled={loading} className="flex-1 bg-black text-white font-black uppercase tracking-widest py-6 rounded-full hover:bg-neutral-800 transition-all shadow-2xl shadow-black/20 disabled:opacity-50">
                {loading ? 'ARCHIVING...' : 'DEPLOY TO CATALOG'}
              </button>
              <button type="button" onClick={() => navigate('/')} className="px-12 py-6 border-2 border-black text-black font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all">CANCEL</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-4">
      <label className="block text-[10px] font-black text-black/30 uppercase tracking-[0.3em]">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
