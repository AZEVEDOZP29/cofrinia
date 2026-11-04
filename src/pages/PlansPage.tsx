import { Check, Clock3, CreditCard, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'

export function PlansPage() {
  const { user } = useAuth()
  const { profile } = useFinance()
  const remaining = Math.max(0, +new Date(profile.trialEndsAt) - Date.now())
  const hours = Math.ceil(remaining / 3_600_000)
  return (
    <div><p className="text-sm text-slate-500">Assinatura</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">Seu plano</h1><div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.2fr]"><section className="card p-6"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><Clock3 /></span><h2 className="mt-5 text-xl font-bold">{user?.isLocal ? 'Modo local de avaliação' : remaining > 0 ? 'Período gratuito' : 'Período gratuito encerrado'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{user?.isLocal ? 'Conecte um projeto Supabase para iniciar um teste controlado pelo servidor.' : remaining > 0 ? `Restam aproximadamente ${hours} horas do seu acesso gratuito.` : 'Escolha o Premium quando a cobrança estiver integrada.'}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full bg-emerald-400" style={{width: user?.isLocal ? '0%' : `${Math.min(100, (remaining / (72*3_600_000))*100)}%`}} /></div></section><section className="rounded-3xl bg-[#071426] p-7 text-white"><div className="flex justify-between"><div><p className="text-sm font-semibold text-emerald-300">MeuControle Premium</p><p className="mt-3"><span className="text-4xl font-bold">R$ 19,90</span><span className="text-slate-400">/mês</span></p></div><CreditCard className="text-emerald-300" /></div><ul className="mt-7 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">{['Dashboard completo','Registros ilimitados','Contas e categorias','Histórico protegido','Orçamentos e metas','Relatórios e exportação'].map((item) => <li className="flex items-center gap-2" key={item}><Check size={15} className="text-emerald-400"/>{item}</li>)}</ul><button disabled className="primary mt-7 w-full">Assinatura em preparação</button><p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400"><ShieldAlert size={15} className="mt-0.5 shrink-0"/>A cobrança só será habilitada após integração de gateway e confirmação por webhook. Nenhum acesso é liberado por uma simulação visual.</p></section></div></div>
  )
}
