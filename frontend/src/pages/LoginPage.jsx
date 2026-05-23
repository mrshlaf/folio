import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [show, setShow] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    const res = await login(email, pass)
    if (res.ok) navigate('/')
    else setErr(res.message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">
        {/* Massive Header */}
        <div className="text-center mb-16">
            <h1 className="text-7xl md:text-8xl font-black text-black uppercase tracking-tighter leading-none italic animate-[folio-fade-in_1s_ease-out]">
                SIGN IN<span className="text-black/10">.</span>
            </h1>
            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.5em] mt-4 animate-[folio-sub-in_1s_ease_0.3s_both]">AUTHENTICATE YOUR IDENTITY</p>
        </div>

        <div className="glass-panel rounded-[4rem] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          {err && (
            <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full px-8 py-4 mb-10 text-center shadow-2xl">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-black/30 uppercase tracking-[0.3em]">EMAIL ADDRESS</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="YOUR@EMAIL.COM" required 
                className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-black/30 uppercase tracking-[0.3em]">PASSWORD</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="••••••••" required 
                  className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20 pr-16"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/40 hover:text-black uppercase tracking-widest transition-colors">
                  {show ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-black text-white font-black uppercase tracking-widest py-6 rounded-full hover:bg-neutral-800 transition-all shadow-2xl shadow-black/20 disabled:opacity-50 mt-12">
              {loading ? 'PROCESSING...' : 'ACCESS ACCOUNT &rarr;'}
            </button>
          </form>

          <div className="mt-12 pt-10 text-center">
            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">
              NEW TO THE SYSTEM?{' '}
              <Link to="/register" className="text-black hover:underline transition-all font-black">CREATE IDENTITY</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
