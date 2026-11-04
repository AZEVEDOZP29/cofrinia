import { useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { useAuth } from '../context/AuthContext'

export function AuthPage({ mode }: { mode: 'signin' | 'signup' | 'reset' }) {
  const { user, configured, signIn, signUp, resetPassword, continueLocally } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (user) return <Navigate to="/app" replace />

  const title = mode === 'signin' ? 'Que bom ter você de volta' : mode === 'signup' ? 'Comece a organizar sua vida financeira' : 'Recupere seu acesso'
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(''); setMessage('')
    try {
      if (mode === 'signup') setMessage(await signUp(name, email, password))
      else if (mode === 'signin') { await signIn(email, password); navigate('/app') }
      else { await resetPassword(email); setMessage('Enviamos as instruções para seu e-mail.') }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível concluir. Tente novamente.') }
    finally { setLoading(false) }
  }

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[.8fr_1.2fr]">
      <aside className="relative hidden overflow-hidden bg-[#071426] p-12 text-white lg:flex lg:flex-col"><div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-emerald-400/10 blur-3xl" /><Brand light /><div className="relative my-auto max-w-md"><p className="text-4xl font-bold leading-tight">Dinheiro organizado traz espaço para o que importa.</p><p className="mt-5 leading-7 text-slate-300">Tenha uma visão clara da sua realidade financeira, sem julgamentos e sem complicação.</p><div className="mt-8 flex items-center gap-3 text-sm text-slate-300"><span className="grid size-10 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><ShieldCheck size={20} /></span>Autenticação segura e dados isolados por usuário</div></div></aside>
      <main className="flex min-h-screen items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md"><div className="mb-10 flex items-center justify-between lg:hidden"><Brand /><Link to="/" className="text-slate-400"><ArrowLeft /></Link></div><Link to="/" className="mb-8 hidden items-center gap-2 text-sm text-slate-500 lg:inline-flex"><ArrowLeft size={16} /> Voltar ao início</Link><p className="text-sm font-semibold text-emerald-600">{mode === 'signin' ? 'Acesse sua conta' : mode === 'signup' ? '3 dias grátis' : 'Esqueci minha senha'}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{mode === 'reset' ? 'Digite seu e-mail para receber um link seguro de redefinição.' : 'Use seus dados para continuar.'}</p>
        {!configured && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><strong>Supabase ainda não configurado.</strong> O modo local permite validar o produto neste dispositivo; cadastro e login reais exigem as variáveis do projeto.</div>}
        <form onSubmit={submit} className="mt-7 space-y-4">{mode === 'signup' && <div><label className="label">Seu nome</label><input required value={name} onChange={(e) => setName(e.target.value)} className="field" autoComplete="name" /></div>}<div><label className="label">E-mail</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" /></div>{mode !== 'reset' && <div><div className="flex items-center justify-between"><label className="label">Senha</label>{mode === 'signin' && <Link to="/recuperar" className="mb-1.5 text-xs font-semibold text-emerald-600">Esqueci a senha</Link>}</div><div className="relative"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="field pr-11" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /><button type="button" aria-label="Mostrar senha" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{mode === 'signup' && <p className="mt-1.5 text-xs text-slate-400">Use pelo menos 8 caracteres.</p>}</div>}{error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<button disabled={loading || !configured} className="primary w-full">{loading ? 'Aguarde…' : mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar minha conta' : 'Enviar instruções'}</button></form>
        {!configured && <button onClick={() => { continueLocally(); navigate('/onboarding') }} className="secondary mt-3 w-full">Explorar em modo local</button>}
        <p className="mt-7 text-center text-sm text-slate-500">{mode === 'signin' ? <>Ainda não tem conta? <Link to="/cadastro" className="font-semibold text-emerald-600">Comece grátis</Link></> : mode === 'signup' ? <>Já tem conta? <Link to="/entrar" className="font-semibold text-emerald-600">Entrar</Link></> : <Link to="/entrar" className="font-semibold text-emerald-600">Voltar para o login</Link>}</p>
      </div></main>
    </div>
  )
}
