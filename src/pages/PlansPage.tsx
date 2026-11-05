import { Check, Clock3, CreditCard, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'

export function PlansPage() {
  const { user } = useAuth()
  const { profile } = useFinance()
  const remaining = Math.max(0, +new Date(profile.trialEndsAt) - Date.now())
  const hours = Math.ceil(remaining / 3_600_000)
  return (
    <div>
      <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#cc9166]">Assinatura</p>
      <h1 className="font-display mt-3 text-[clamp(40px,6vw,64px)] font-normal leading-none tracking-[.01em] text-white">Seu plano</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[#9194a1]">Acompanhe seu período de avaliação e veja o que estará incluído no plano mensal.</p>

      <div className="mt-10 grid gap-5 lg:grid-cols-[.86fr_1.14fr]">
        <section className="card p-6 sm:p-8">
          <span className="grid size-11 place-items-center rounded-full border border-[#2e3038] text-[#e2e3e9]"><Clock3 size={20} strokeWidth={1.5} /></span>
          <p className="mt-8 text-[13px] font-semibold uppercase tracking-[.1em] text-[#777a88]">Status atual</p>
          <h2 className="font-display mt-3 text-[30px] font-normal leading-tight text-white">{user?.isLocal ? 'Modo local de avaliação' : remaining > 0 ? 'Período gratuito' : 'Período gratuito encerrado'}</h2>
          <p className="mt-4 text-sm leading-6 text-[#9194a1]">{user?.isLocal ? 'Conecte um projeto Supabase para iniciar um teste controlado pelo servidor.' : remaining > 0 ? `Restam aproximadamente ${hours} horas do seu acesso gratuito.` : 'Escolha o Premium quando a cobrança estiver integrada.'}</p>
          <div className="mt-8 h-px overflow-hidden bg-[#2e3038]"><div className="h-full bg-white" style={{width: user?.isLocal ? '0%' : `${Math.min(100, (remaining / (72*3_600_000))*100)}%`}} /></div>
          <p className="mt-3 text-xs text-[#5e616e]">Período total: 72 horas</p>
        </section>

        <section className="rounded-[10px] border border-[#2e3038] bg-[#040406] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5"><div><p className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#cc9166]">MeuControle Premium</p><p className="mt-5"><span className="font-display text-5xl font-normal tracking-[.01em] text-white">R$ 19,90</span><span className="ml-1 text-sm text-[#777a88]">/mês</span></p></div><span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#2e3038] text-[#e2e3e9]"><CreditCard size={19} strokeWidth={1.5} /></span></div>
          <div className="my-8 h-px bg-[#1c1d22]" />
          <ul className="grid gap-x-6 gap-y-4 text-sm text-[#c7c9d1] sm:grid-cols-2">{['Dashboard completo','Registros ilimitados','Contas e categorias','Histórico protegido','Orçamentos e metas','Relatórios e exportação'].map((item) => <li className="flex items-center gap-2.5" key={item}><span className="grid size-5 place-items-center rounded-full border border-[#464853] text-white"><Check size={12}/></span>{item}</li>)}</ul>
          <button disabled className="primary mt-8 w-full">Assinatura em preparação</button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#777a88]"><ShieldAlert size={15} className="mt-0.5 shrink-0"/>A cobrança só será habilitada após integração de gateway e confirmação por webhook. Nenhum acesso é liberado por uma simulação visual.</p>
        </section>
      </div>
    </div>
  )
}
