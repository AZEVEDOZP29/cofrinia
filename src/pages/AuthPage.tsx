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
    <div className="grid min-h-screen bg-[#08080a] text-[#e2e3e9] lg:grid-cols-[.92fr_1.08fr]">
      <aside className="hidden min-h-screen flex-col border-r border-[#1c1d22] bg-[#040406] p-12 lg:flex xl:p-16">
        <Brand light />
        <div className="my-auto max-w-lg">
          <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-[#cc9166]">Controle financeiro pessoal</p>
          <h2 className="font-display mt-6 text-[clamp(44px,5vw,72px)] font-normal leading-[1.02] tracking-[.01em] text-white">Dinheiro organizado traz espaço para o que importa.</h2>
          <p className="mt-7 max-w-md text-base leading-7 text-[#9194a1]">Tenha uma visão clara da sua realidade financeira, sem julgamentos e sem complicação.</p>
          <div className="mt-12 border-t border-[#1c1d22] pt-6">
            <div className="flex items-start gap-4 text-sm leading-6 text-[#c7c9d1]">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#2e3038] text-[#e2e3e9]"><ShieldCheck size={18} strokeWidth={1.5} /></span>
              <span><strong className="block font-medium text-white">Privacidade por padrão</strong>Autenticação segura e dados isolados por usuário.</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#5e616e]">MeuControle · gestão financeira inteligente</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center p-5 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center justify-between lg:hidden"><Brand light /><Link to="/" aria-label="Voltar ao início" className="grid size-10 place-items-center rounded-full border border-[#2e3038] text-[#9194a1] hover:border-[#777a88] hover:text-white"><ArrowLeft size={17} /></Link></div>
          <Link to="/" className="mb-10 hidden items-center gap-2 text-sm text-[#9194a1] hover:text-white lg:inline-flex"><ArrowLeft size={15} /> Voltar ao início</Link>
          <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#cc9166]">{mode === 'signin' ? 'Acesse sua conta' : mode === 'signup' ? '3 dias grátis' : 'Esqueci minha senha'}</p>
          <h1 className="font-display mt-4 text-[clamp(36px,5vw,52px)] font-normal leading-[1.08] tracking-[.01em] text-white">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-[#9194a1]">{mode === 'reset' ? 'Digite seu e-mail para receber um link seguro de redefinição.' : 'Use seus dados para continuar.'}</p>

          {!configured && <div className="mt-7 rounded-[10px] border border-[#5f4635] bg-[#12100e] p-4 text-sm leading-6 text-[#c7c9d1]"><strong className="font-medium text-[#cc9166]">Supabase ainda não configurado.</strong> O modo local permite validar o produto neste dispositivo; cadastro e login reais exigem as variáveis do projeto.</div>}

          <form onSubmit={submit} className="mt-8 space-y-5">
            {mode === 'signup' && <div><label className="label">Seu nome</label><input required value={name} onChange={(e) => setName(e.target.value)} className="field" autoComplete="name" /></div>}
            <div><label className="label">E-mail</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" /></div>
            {mode !== 'reset' && <div><div className="flex items-center justify-between"><label className="label">Senha</label>{mode === 'signin' && <Link to="/recuperar" className="mb-1.5 text-xs font-medium text-[#cc9166] hover:text-white">Esqueci a senha</Link>}</div><div className="relative"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="field !pr-12" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-3 text-[#777a88] hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{mode === 'signup' && <p className="mt-2 text-xs text-[#777a88]">Use pelo menos 8 caracteres.</p>}</div>}
            {error && <p className="rounded-[10px] border border-[#5a2b2b] bg-[#1a0e10] p-3 text-sm text-[#e5a2a2]">{error}</p>}
            {message && <p className="rounded-[10px] border border-[#355248] bg-[#0c1713] p-3 text-sm text-[#a9cbbd]">{message}</p>}
            <button disabled={loading || !configured} className="primary w-full">{loading ? 'Aguarde…' : mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar minha conta' : 'Enviar instruções'}</button>
          </form>

          {!configured && <button onClick={() => { continueLocally(); navigate('/onboarding') }} className="secondary mt-3 w-full">Explorar em modo local</button>}
          <p className="mt-8 text-center text-sm text-[#777a88]">{mode === 'signin' ? <>Ainda não tem conta? <Link to="/cadastro" className="font-medium text-[#cc9166] hover:text-white">Comece grátis</Link></> : mode === 'signup' ? <>Já tem conta? <Link to="/entrar" className="font-medium text-[#cc9166] hover:text-white">Entrar</Link></> : <Link to="/entrar" className="font-medium text-[#cc9166] hover:text-white">Voltar para o login</Link>}</p>
        </div>
      </main>
    </div>
  )
}
