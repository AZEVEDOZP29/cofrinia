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
    <div className="mx-auto max-w-3xl py-3 sm:py-10">
      <div className="mb-8 px-1">
        <div className="flex items-center justify-between"><p className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#cc9166]">Configuração inicial</p><p className="text-xs text-[#777a88]">{step} de 3</p></div>
        <div className="mt-4 h-px overflow-hidden bg-[#1c1d22]"><div className="h-full bg-white transition-all duration-300" style={{ width: `${step * 33.33}%` }} /></div>
      </div>

      <div className="card p-6 sm:p-10">
        <div className="mb-10 border-b border-[#1c1d22] pb-8">
          <h1 className="font-display text-[clamp(36px,6vw,52px)] font-normal leading-[1.08] tracking-[.01em] text-white">{step === 1 ? 'Vamos conhecer você' : step === 2 ? 'Qual é seu ponto de partida?' : 'Tudo pronto para começar'}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#9194a1]">{step === 1 ? 'Use estas informações para personalizar sua experiência.' : step === 2 ? 'O saldo inicial compõe sua conta sem inventar uma movimentação.' : 'Revise os dados e abra seu painel financeiro.'}</p>
        </div>

        {step === 1 && <div className="space-y-6"><div><label className="label">Como podemos chamar você?</label><input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Seu nome" /></div><div><label className="label">Principal objetivo</label><div className="grid gap-2.5 sm:grid-cols-2">{objectives.map((item) => <button key={item} onClick={() => setObjective(item)} className={`rounded-[10px] border p-3.5 text-left text-sm font-medium transition-colors ${objective === item ? 'border-[#cc9166] bg-[#121317] text-white' : 'border-[#2e3038] text-[#9194a1] hover:border-[#777a88] hover:text-[#e2e3e9]'}`}>{item}</button>)}</div></div><div><label className="label">Dia de início do mês financeiro</label><input type="number" min="1" max="28" value={monthStartDay} onChange={(e) => setMonthStartDay(Number(e.target.value))} className="field max-w-36" /></div><button disabled={!name.trim()} onClick={() => setStep(2)} className="primary w-full">Continuar <ArrowRight size={17} /></button></div>}

        {step === 2 && <div className="space-y-6"><div><label className="label">Renda mensal aproximada <span className="font-normal text-[#777a88]">(opcional)</span></label><input inputMode="decimal" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className="field" placeholder="R$ 0,00" /><p className="mt-2 text-xs leading-5 text-[#777a88]">Usada como referência de planejamento; não será lançada como receita recebida.</p></div><div><label className="label">Nome da sua primeira conta</label><input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="field" /></div><div><label className="label">Saldo disponível hoje</label><input inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} className="field" placeholder="R$ 0,00" /></div><div className="flex gap-3"><button onClick={() => setStep(1)} className="secondary flex-1">Voltar</button><button onClick={() => setStep(3)} className="primary flex-1">Revisar <ArrowRight size={17} /></button></div></div>}

        {step === 3 && <form onSubmit={finish}><div className="rounded-[10px] border border-[#2e3038] bg-[#121317] p-5 sm:p-6"><div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#464853] text-white"><CheckCircle2 size={19} strokeWidth={1.5} /></span><div><p className="font-medium text-white">Seu espaço está pronto</p><p className="mt-1 text-sm text-[#9194a1]">Você poderá alterar tudo nas configurações.</p></div></div><dl className="mt-6 grid gap-5 border-t border-[#2e3038] pt-6 text-sm sm:grid-cols-2"><div><dt className="text-[#777a88]">Nome</dt><dd className="mt-1.5 font-medium text-[#e2e3e9]">{name}</dd></div><div><dt className="text-[#777a88]">Objetivo</dt><dd className="mt-1.5 font-medium text-[#e2e3e9]">{objective}</dd></div><div><dt className="text-[#777a88]">Conta</dt><dd className="mt-1.5 font-medium text-[#e2e3e9]">{accountName}</dd></div><div><dt className="text-[#777a88]">Saldo inicial</dt><dd className="mt-1.5 font-medium text-[#e2e3e9]">R$ {balance || '0,00'}</dd></div></dl></div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setStep(2)} className="secondary flex-1">Voltar</button><button disabled={saving} className="primary flex-1">{saving ? 'Preparando…' : 'Abrir meu painel'}</button></div></form>}
      </div>
    </div>
  )
}
