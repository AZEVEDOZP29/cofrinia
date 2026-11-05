import { useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { useAuth } from '../context/AuthContext'

export function PasswordRecoveryPage() {
  const { user, loading, configured, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError('As senhas precisam ser iguais.')
      return
    }
    setSaving(true)
    try {
      await updatePassword(password)
      navigate('/app', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível alterar a senha. Solicite um novo link.')
    } finally {
      setSaving(false)
    }
  }

  const unavailable = !configured || (!loading && !user)

  return (
    <div className="grid min-h-screen bg-[#08080a] text-[#e2e3e9] lg:grid-cols-[.92fr_1.08fr]">
      <aside className="hidden min-h-screen flex-col border-r border-[#1c1d22] bg-[#040406] p-12 lg:flex xl:p-16">
        <Brand light />
        <div className="my-auto max-w-lg">
          <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-[#cc9166]">Acesso protegido</p>
          <h2 className="font-display mt-6 text-[clamp(44px,5vw,72px)] font-normal leading-[1.02] tracking-[.01em] text-white">Uma nova senha para continuar com segurança.</h2>
          <p className="mt-7 max-w-md text-base leading-7 text-[#9194a1]">O link recebido por e-mail cria uma sessão temporária e segura para esta alteração.</p>
        </div>
        <p className="text-xs text-[#5e616e]">MeuControle · gestão financeira inteligente</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center p-5 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center justify-between lg:hidden"><Brand light /><Link to="/" aria-label="Voltar ao início" className="grid size-10 place-items-center rounded-full border border-[#2e3038] text-[#9194a1] hover:border-[#777a88] hover:text-white"><ArrowLeft size={17} /></Link></div>
          <Link to="/entrar" className="mb-10 hidden items-center gap-2 text-sm text-[#9194a1] hover:text-white lg:inline-flex"><ArrowLeft size={15} /> Voltar para o login</Link>
          <span className="grid size-11 place-items-center rounded-full border border-[#2e3038] text-[#e2e3e9]"><KeyRound size={19} strokeWidth={1.5} /></span>
          <p className="mt-7 text-[13px] font-semibold uppercase tracking-[.12em] text-[#cc9166]">Redefinição de senha</p>
          <h1 className="font-display mt-4 text-[clamp(36px,5vw,52px)] font-normal leading-[1.08] tracking-[.01em] text-white">Crie sua nova senha</h1>
          <p className="mt-4 text-sm leading-6 text-[#9194a1]">Use pelo menos 8 caracteres e confirme antes de salvar.</p>

          {loading && <p className="mt-8 rounded-[10px] border border-[#2e3038] bg-[#121317] p-4 text-sm text-[#c7c9d1]">Validando seu link seguro…</p>}
          {!loading && unavailable && <div className="mt-8 rounded-[10px] border border-[#5a2b2b] bg-[#1a0e10] p-4 text-sm leading-6 text-[#e5a2a2]">Este link é inválido ou expirou. <Link to="/recuperar" className="font-medium underline">Solicite um novo e-mail</Link>.</div>}

          {!loading && !unavailable && <form onSubmit={submit} className="mt-8 space-y-5">
            <div><label className="label">Nova senha</label><div className="relative"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="field !pr-12" autoComplete="new-password" /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-3 text-[#777a88] hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            <div><label className="label">Confirmar nova senha</label><input required minLength={8} type={showPassword ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="field" autoComplete="new-password" /></div>
            {error && <p className="rounded-[10px] border border-[#5a2b2b] bg-[#1a0e10] p-3 text-sm text-[#e5a2a2]">{error}</p>}
            <button disabled={saving} className="primary w-full">{saving ? 'Salvando…' : 'Salvar nova senha'}</button>
          </form>}
        </div>
      </main>
    </div>
  )
}
