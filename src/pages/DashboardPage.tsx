import { useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChevronRight, CircleDollarSign, Landmark, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import { Navigate, Link, useOutletContext } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AppOutletContext } from '../components/AppLayout'
import { useFinance } from '../context/FinanceContext'
import { accountBalance, formatMoney, monthKey, monthTotals } from '../lib/finance'

const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const fullMonthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const dateLabel = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
const chartPalette = ['#cc9166', '#e2e3e9', '#9194a1', '#5e616e', '#2e3038']

export function DashboardPage() {
  const { profile, accounts, categories, transactions } = useFinance()
  const { openTransaction } = useOutletContext<AppOutletContext>()
  const now = new Date()
  const totals = useMemo(() => monthTotals(transactions, now), [transactions])
  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + accountBalance(account, transactions), 0), [accounts, transactions])
  const current = useMemo(() => transactions.filter((item) => monthKey(item.occurredAt) === monthKey(now)), [transactions])
  const settledResult = totals.income - totals.expenses
  const commitment = profile.monthlyIncomeCents > 0 ? Math.min(999, Math.round(((totals.expenses + totals.plannedExpenses) / profile.monthlyIncomeCents) * 100)) : 0

  const categoryData = useMemo(() => {
    const values = new Map<string, number>()
    current.filter((item) => item.type === 'expense' && item.status !== 'planned').forEach((item) => values.set(item.categoryId, (values.get(item.categoryId) ?? 0) + item.amountCents))
    return [...values.entries()].map(([id, value]) => ({ name: categories.find((item) => item.id === id)?.name ?? 'Outros', value })).sort((a, b) => b.value - a.value)
  }, [categories, current])

  const sixMonths = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    const value = monthTotals(transactions, date)
    return { name: monthLabel.format(date).replace('.', ''), receitas: value.income / 100, despesas: value.expenses / 100 }
  }), [transactions])

  const balanceEvolution = useMemo(() => {
    let balance = accounts.reduce((sum, account) => sum + account.initialBalanceCents, 0)
    return transactions.filter((item) => item.status !== 'planned').sort((a, b) => +new Date(a.occurredAt) - +new Date(b.occurredAt)).map((item) => {
      balance += item.type === 'income' ? item.amountCents : -item.amountCents
      return { date: dateLabel.format(new Date(item.occurredAt)), saldo: balance / 100 }
    }).slice(-30)
  }, [accounts, transactions])

  if (!profile.onboardingCompleted) return <Navigate to="/onboarding" replace />

  const cards = [
    { label: 'Saldo disponível', value: totalBalance, icon: Wallet, note: `${accounts.length} ${accounts.length === 1 ? 'conta vinculada' : 'contas vinculadas'}` },
    { label: 'Receitas do mês', value: totals.income, icon: ArrowDownRight, note: 'Valores recebidos' },
    { label: 'Despesas do mês', value: totals.expenses, icon: ArrowUpRight, note: 'Valores pagos' },
    { label: 'Resultado mensal', value: settledResult, icon: TrendingUp, note: 'Receitas menos despesas' },
  ]

  return (
    <div>
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-graphite pb-8 sm:flex-row sm:items-end">
        <div><p className="eyebrow">VISÃO GERAL</p><h1 className="font-display mt-3 text-[38px] leading-[1.1] text-white sm:text-[48px]">Olá, {profile.name.split(' ')[0] || 'bem-vindo'}.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-fog">Uma leitura objetiva do seu mês, construída apenas com os lançamentos que você registrou.</p></div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-slate bg-carbon px-4 py-2 text-sm font-medium capitalize text-mist"><CalendarDays size={16} strokeWidth={1.5} />{fullMonthLabel.format(now)}</div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-[10px] border border-graphite bg-graphite sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, note }) => <div key={label} className="bg-onyx p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-fog">{label}</p><p className="font-display mt-4 text-[28px] leading-none text-white">{formatMoney(value)}</p></div><span className="grid size-9 place-items-center rounded-full border border-slate text-mist"><Icon size={17} strokeWidth={1.4} /></span></div><p className="mt-5 text-xs text-ash">{note}</p></div>)}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <SmallMetric icon={CircleDollarSign} label="Despesas previstas" value={formatMoney(totals.plannedExpenses)} />
        <SmallMetric icon={Landmark} label="Renda comprometida" value={`${commitment}%`} />
        <SmallMetric icon={PiggyBank} label="Economizado no mês" value={formatMoney(Math.max(0, settledResult))} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="card p-6"><SectionHeading title="Receitas e despesas" detail="Comparativo dos últimos seis meses" /><div className="mt-7 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={sixMonths} barGap={6}><CartesianGrid vertical={false} stroke="#1c1d22" /><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#777a88" /><YAxis axisLine={false} tickLine={false} fontSize={11} stroke="#777a88" tickFormatter={(value) => `R$${value / 1000}k`} /><Tooltip cursor={{ fill: '#121317' }} formatter={(value) => formatMoney(Number(value) * 100)} /><Bar dataKey="receitas" name="Receitas" fill="#e2e3e9" radius={[2,2,0,0]} /><Bar dataKey="despesas" name="Despesas" fill="#5e616e" radius={[2,2,0,0]} /></BarChart></ResponsiveContainer></div></section>
        <section className="card p-6"><SectionHeading title="Gastos por categoria" detail="Despesas pagas neste mês" />{categoryData.length ? <><div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={2}>{categoryData.map((item, index) => <Cell key={item.name} fill={chartPalette[index % chartPalette.length]} />)}</Pie><Tooltip formatter={(value) => formatMoney(Number(value))} /></PieChart></ResponsiveContainer></div><div className="space-y-2.5">{categoryData.slice(0, 4).map((item, index) => <div key={item.name} className="flex items-center justify-between border-b border-graphite pb-2.5 text-sm last:border-0"><span className="flex items-center gap-2 text-mist"><i className="size-2 rounded-full" style={{ background: chartPalette[index % chartPalette.length] }} />{item.name}</span><strong className="font-medium text-bone">{formatMoney(item.value)}</strong></div>)}</div></> : <EmptyChart text="Registre sua primeira despesa para ver a distribuição." />}</section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="card p-6"><SectionHeading title="Evolução do saldo" detail="Últimas movimentações liquidadas" />{balanceEvolution.length ? <div className="mt-5 h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={balanceEvolution}><defs><linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cc9166" stopOpacity=".22"/><stop offset="100%" stopColor="#cc9166" stopOpacity="0"/></linearGradient><linearGradient id="balanceStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ae9357"/><stop offset="40%" stopColor="#fff0cc"/><stop offset="100%" stopColor="#ae9357"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#1c1d22"/><XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={11} stroke="#777a88"/><YAxis hide/><Tooltip formatter={(value) => formatMoney(Number(value) * 100)} /><Area dataKey="saldo" type="monotone" stroke="url(#balanceStroke)" fill="url(#balanceFill)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div> : <EmptyChart text="A evolução aparecerá após seus primeiros lançamentos." />}</section>
        <section className="card p-6"><div className="flex items-center justify-between"><SectionHeading title="Movimentações recentes" detail="Seus últimos registros" /><Link aria-label="Ver todas as movimentações" to="/movimentacoes" className="grid size-9 place-items-center rounded-full border border-slate text-fog hover:text-white"><ChevronRight size={17} /></Link></div>{transactions.length ? <div className="mt-6 divide-y divide-graphite">{transactions.slice(0, 5).map((item) => <button onClick={() => openTransaction(item)} key={item.id} className="flex w-full items-center gap-3 py-3.5 text-left"><span className="grid size-9 place-items-center rounded-full border border-slate text-mist">{item.type === 'income' ? <ArrowDownRight size={16}/> : <ArrowUpRight size={16}/>}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-bone">{item.description}</span><span className="block text-xs text-ash">{categories.find((category) => category.id === item.categoryId)?.name ?? 'Sem categoria'}</span></span><strong className={`text-sm font-medium ${item.type === 'income' ? 'text-white' : 'text-mist'}`}>{item.type === 'income' ? '+' : '-'}{formatMoney(item.amountCents)}</strong></button>)}</div> : <div className="py-10 text-center"><p className="text-sm text-fog">Seu histórico começa aqui.</p><button onClick={() => openTransaction()} className="secondary mt-4">Registrar agora</button></div>}</section>
      </div>
    </div>
  )
}

function SmallMetric({ icon: Icon, label, value }: { icon: typeof Wallet, label: string, value: string }) {
  return <div className="card flex items-center gap-4 p-5"><span className="grid size-10 place-items-center rounded-full border border-slate text-fog"><Icon size={17} strokeWidth={1.4} /></span><div><p className="text-xs text-ash">{label}</p><p className="mt-1 font-medium text-bone">{value}</p></div></div>
}

function SectionHeading({ title, detail }: { title: string, detail: string }) {
  return <div><h2 className="text-base font-medium text-white">{title}</h2><p className="mt-1 text-xs text-ash">{detail}</p></div>
}

function EmptyChart({ text }: { text: string }) { return <div className="grid h-52 place-items-center px-8 text-center text-sm leading-6 text-ash">{text}</div> }
