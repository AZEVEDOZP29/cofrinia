import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useFinance } from '../context/FinanceContext'
import { parseMoney } from '../lib/finance'

const objectives = ['Controlar gastos', 'Economizar dinheiro', 'Criar reserva de emergência', 'Sair das dívidas', 'Organizar cartões', 'Realizar um sonho financeiro']

export function OnboardingPage() {
  const { profile, accounts, updateProfile, addAccount } = useFinance()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(profile.name)
  const [objective, setObjective] = useState(profile.objective || objectives[0])
  const [monthStartDay, setMonthStartDay] = useState(profile.monthStartDay)
  const [monthlyIncome, setMonthlyIncome] = useState(profile.monthlyIncomeCents ? String(profile.monthlyIncomeCents / 100) : '')
  const [accountName, setAccountName] = useState('Conta principal')
  const [balance, setBalance] = useState('')
  const [saving, setSaving] = useState(false)
  if (profile.onboardingCompleted) return <Navigate to="/app" replace />

  async function finish(event: FormEvent) {
    event.preventDefault(); setSaving(true)
    try {
      if (!accounts.length) await addAccount({ name: accountName.trim() || 'Conta principal', type: 'checking', initialBalanceCents: parseMoney(balance) })
      await updateProfile({ name: name.trim(), objective, monthStartDay, monthlyIncomeCents: parseMoney(monthlyIncome), onboardingCompleted: true })
      navigate('/app')
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-3xl py-3 sm:py-8"><div className="mb-8"><p className="text-sm font-semibold text-emerald-600">Primeiros passos · {step} de 3</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${step * 33.33}%` }} /></div></div><div className="card p-6 sm:p-10"><div className="mb-8"><h1 className="text-3xl font-bold text-slate-950 dark:text-white">{step === 1 ? 'Vamos conhecer você' : step === 2 ? 'Qual é seu ponto de partida?' : 'Tudo pronto para começar'}</h1><p className="mt-3 leading-7 text-slate-500">{step === 1 ? 'Use estas informações para personalizar sua experiência.' : step === 2 ? 'O saldo inicial compõe sua conta sem inventar uma movimentação.' : 'Revise os dados e abra seu painel financeiro.'}</p></div>
        {step === 1 && <div className="space-y-5"><div><label className="label">Como podemos chamar você?</label><input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Seu nome" /></div><div><label className="label">Principal objetivo</label><div className="grid gap-2 sm:grid-cols-2">{objectives.map((item) => <button key={item} onClick={() => setObjective(item)} className={`rounded-xl border p-3 text-left text-sm font-medium ${objective === item ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700'}`}>{item}</button>)}</div></div><div><label className="label">Dia de início do mês financeiro</label><input type="number" min="1" max="28" value={monthStartDay} onChange={(e) => setMonthStartDay(Number(e.target.value))} className="field max-w-32" /></div><button disabled={!name.trim()} onClick={() => setStep(2)} className="primary w-full">Continuar <ArrowRight size={17} /></button></div>}
        {step === 2 && <div className="space-y-5"><div><label className="label">Renda mensal aproximada <span className="font-normal text-slate-400">(opcional)</span></label><input inputMode="decimal" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className="field" placeholder="R$ 0,00" /><p className="mt-1.5 text-xs text-slate-400">Usada como referência de planejamento; não será lançada como receita recebida.</p></div><div><label className="label">Nome da sua primeira conta</label><input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="field" /></div><div><label className="label">Saldo disponível hoje</label><input inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} className="field" placeholder="R$ 0,00" /></div><div className="flex gap-3"><button onClick={() => setStep(1)} className="secondary flex-1">Voltar</button><button onClick={() => setStep(3)} className="primary flex-1">Revisar <ArrowRight size={17} /></button></div></div>}
        {step === 3 && <form onSubmit={finish}><div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950"><div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" /><div><p className="font-bold text-slate-950 dark:text-white">Seu espaço está pronto</p><p className="text-sm text-slate-500">Você poderá alterar tudo nas configurações.</p></div></div><dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5 text-sm dark:border-slate-800 sm:grid-cols-2"><div><dt className="text-slate-400">Nome</dt><dd className="mt-1 font-semibold">{name}</dd></div><div><dt className="text-slate-400">Objetivo</dt><dd className="mt-1 font-semibold">{objective}</dd></div><div><dt className="text-slate-400">Conta</dt><dd className="mt-1 font-semibold">{accountName}</dd></div><div><dt className="text-slate-400">Saldo inicial</dt><dd className="mt-1 font-semibold">R$ {balance || '0,00'}</dd></div></dl></div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setStep(2)} className="secondary flex-1">Voltar</button><button disabled={saving} className="primary flex-1">{saving ? 'Preparando…' : 'Abrir meu painel'}</button></div></form>}
      </div></div>
  )
}
