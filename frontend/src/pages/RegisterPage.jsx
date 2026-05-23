import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { JOBS, COUNTRIES } from '../constants/data.js'

const reqs = [
  { id: 'len',   label: 'MIN 10 CHARACTERS',            test: v => v.length >= 10 },
  { id: 'upper', label: 'UPPERCASE (A-Z)',              test: v => /[A-Z]/.test(v) },
  { id: 'lower', label: 'LOWERCASE (a-z)',              test: v => /[a-z]/.test(v) },
  { id: 'num',   label: 'NUMBERS (0-9)',                test: v => /\d/.test(v) },
  { id: 'sym',   label: 'SPECIAL CHARACTER',           test: v => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) }
]

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName:'', phone:'', email:'', password:'', age:'', job:'', country:'', customJob:'' })
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      password: form.password,
      age: Number(form.age),
      job: form.job === 'Other' ? form.customJob : form.job,
      country: form.country
    }
    const res = await register(payload)
    if (res.ok) navigate('/')
    else setErr(res.message)
  }

  const metPass = reqs.map(r => r.test(form.password))

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-32">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-16">
            <h1 className="text-7xl md:text-8xl font-black text-black uppercase tracking-tighter leading-none italic animate-[folio-fade-in_1s_ease-out]">
                CREATE<br/>IDENTITY<span className="text-black/10">.</span>
            </h1>
            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.5em] mt-4">JOIN THE NEXT-GEN LIBRARY</p>
        </div>

        <div className="glass-panel rounded-[4rem] p-10 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          {err && (
            <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full px-8 py-4 mb-10 text-center shadow-2xl">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Field label="FULL NAME" required>
                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="ENTER NAME" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
                </Field>
                <Field label="PHONE NUMBER" required>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="08XXXXXXXXXX" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
                </Field>
                <Field label="AGE" required>
                    <input type="number" min={1} max={120} value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
                </Field>
                <Field label="GMAIL ACCOUNT" required>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="EMAIL@GMAIL.COM" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20" />
                </Field>
            </div>

            <Field label="PASSWORD ARCHITECTURE" required>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="CREATE STRONG KEY" required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20 pr-20"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/40 hover:text-black uppercase tracking-widest transition-colors">
                  {show ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4 p-6 bg-black/5 rounded-[2rem]">
                  {reqs.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${metPass[i] ? 'bg-black text-white' : 'bg-black/5 text-black/20'}`}>
                        {metPass[i] ? '✓' : ''}
                      </div>
                      <span className={`text-[9px] font-black tracking-widest ${metPass[i] ? 'text-black' : 'text-black/20'}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Field label="OCCUPATION" required>
                <select value={form.job} onChange={e => set('job', e.target.value)} required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm text-black/40 focus:text-black appearance-none">
                    <option value="">SELECT JOB...</option>
                    {JOBS.map(j => <option key={j} value={j}>{j.toUpperCase()}</option>)}
                </select>
                </Field>

                <Field label="LOCATION" required>
                <select value={form.country} onChange={e => set('country', e.target.value)} required className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm text-black/40 focus:text-black appearance-none">
                    <option value="">SELECT COUNTRY...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
                </Field>
            </div>

            {form.job === 'Other' && (
              <Field label="SPECIFY OCCUPATION" required>
                <input
                  value={form.customJob} onChange={e => set('customJob', e.target.value)}
                  placeholder="WHAT IS YOUR WORK?" required
                  className="w-full bg-black/5 border-2 border-transparent focus:border-black/10 focus:bg-white px-8 py-4 rounded-2xl outline-none transition-all uppercase font-black text-sm placeholder:text-black/20"
                />
              </Field>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white font-black uppercase tracking-widest py-6 rounded-full hover:bg-neutral-800 transition-all shadow-2xl shadow-black/20 disabled:opacity-50 mt-12">
              {loading ? 'REGISTERING...' : 'INITIALIZE ACCOUNT &rarr;'}
            </button>
          </form>

          <div className="mt-12 pt-10 text-center">
            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">
                ALREADY REGISTERED?{' '}
                <Link to="/login" className="text-black hover:underline transition-all font-black">SIGN IN HERE</Link>
            </p>
          </div>
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
