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
    return [...values.entries()].map(([id, value]) => ({ name: categories.find((item) => item.id === id)?.name ?? 'Outros', value, color: categories.find((item) => item.id === id)?.color ?? '#64748b' })).sort((a, b) => b.value - a.value)
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
    { label: 'Saldo disponível', value: totalBalance, icon: Wallet, tone: 'text-slate-950 dark:text-white', surface: 'bg-slate-950 text-white dark:bg-slate-800', note: `${accounts.length} ${accounts.length === 1 ? 'conta' : 'contas'}` },
    { label: 'Receitas do mês', value: totals.income, icon: ArrowDownRight, tone: 'text-emerald-600', surface: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50', note: 'Valores recebidos' },
    { label: 'Despesas do mês', value: totals.expenses, icon: ArrowUpRight, tone: 'text-rose-600', surface: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50', note: 'Valores pagos' },
    { label: 'Resultado mensal', value: settledResult, icon: TrendingUp, tone: settledResult >= 0 ? 'text-emerald-600' : 'text-rose-600', surface: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50', note: 'Receitas menos despesas' },
  ]

  return (
    <div><div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-500">Olá, {profile.name.split(' ')[0] || 'bem-vindo'} 👋</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Sua visão financeira</h1></div><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium capitalize text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><CalendarDays size={17} />{fullMonthLabel.format(now)}</div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone, surface, note }, index) => <div key={label} className={`card p-5 ${index === 0 ? '!border-slate-950 !bg-[#071426]' : ''}`}><div className="flex items-start justify-between"><div><p className={`text-xs font-medium ${index === 0 ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p><p className={`mt-3 text-2xl font-bold ${index === 0 ? 'text-white' : tone}`}>{formatMoney(value)}</p></div><span className={`grid size-10 place-items-center rounded-xl ${surface}`}><Icon size={20} /></span></div><p className={`mt-4 text-xs ${index === 0 ? 'text-slate-400' : 'text-slate-400'}`}>{note}</p></div>)}</div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3"><div className="card flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40"><CircleDollarSign /></span><div><p className="text-xs text-slate-400">Despesas previstas</p><p className="mt-1 font-bold">{formatMoney(totals.plannedExpenses)}</p></div></div><div className="card flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40"><Landmark /></span><div><p className="text-xs text-slate-400">Renda comprometida</p><p className="mt-1 font-bold">{commitment}%</p></div></div><div className="card flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><PiggyBank /></span><div><p className="text-xs text-slate-400">Economizado no mês</p><p className="mt-1 font-bold">{formatMoney(Math.max(0, settledResult))}</p></div></div></div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]"><div className="card p-5 sm:p-6"><div><h2 className="font-bold text-slate-950 dark:text-white">Receitas e despesas</h2><p className="mt-1 text-xs text-slate-400">Comparativo dos últimos seis meses</p></div><div className="mt-6 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={sixMonths} barGap={6}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} /><YAxis axisLine={false} tickLine={false} fontSize={11} tickFormatter={(value) => `R$${value / 1000}k`} /><Tooltip formatter={(value) => formatMoney(Number(value) * 100)} /><Bar dataKey="receitas" name="Receitas" fill="#34d399" radius={[5,5,0,0]} /><Bar dataKey="despesas" name="Despesas" fill="#fb7185" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="card p-5 sm:p-6"><h2 className="font-bold text-slate-950 dark:text-white">Gastos por categoria</h2><p className="mt-1 text-xs text-slate-400">Somente despesas pagas neste mês</p>{categoryData.length ? <><div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={3}>{categoryData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => formatMoney(Number(value))} /></PieChart></ResponsiveContainer></div><div className="space-y-2">{categoryData.slice(0, 4).map((item) => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><i className="size-2.5 rounded-full" style={{ background: item.color }} />{item.name}</span><strong>{formatMoney(item.value)}</strong></div>)}</div></> : <EmptyChart text="Registre sua primeira despesa para ver a distribuição." />}</div></div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]"><div className="card p-5 sm:p-6"><h2 className="font-bold text-slate-950 dark:text-white">Evolução do saldo</h2><p className="mt-1 text-xs text-slate-400">Últimas movimentações liquidadas</p>{balanceEvolution.length ? <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={balanceEvolution}><defs><linearGradient id="saldo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity=".35"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={11}/><YAxis hide/><Tooltip formatter={(value) => formatMoney(Number(value) * 100)} /><Area dataKey="saldo" type="monotone" stroke="#10b981" fill="url(#saldo)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div> : <EmptyChart text="A evolução aparecerá após seus primeiros lançamentos." />}</div>
        <div className="card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950 dark:text-white">Movimentações recentes</h2><p className="mt-1 text-xs text-slate-400">Seus últimos registros</p></div><Link to="/movimentacoes" className="text-emerald-600"><ChevronRight /></Link></div>{transactions.length ? <div className="mt-5 space-y-4">{transactions.slice(0, 5).map((item) => <button onClick={() => openTransaction(item)} key={item.id} className="flex w-full items-center gap-3 text-left"><span className={`grid size-9 place-items-center rounded-full ${item.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'}`}>{item.type === 'income' ? <ArrowDownRight size={17}/> : <ArrowUpRight size={17}/>}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.description}</span><span className="block text-xs text-slate-400">{categories.find((category) => category.id === item.categoryId)?.name ?? 'Sem categoria'}</span></span><strong className={`text-sm ${item.type === 'income' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>{item.type === 'income' ? '+' : '-'}{formatMoney(item.amountCents)}</strong></button>)}</div> : <div className="py-10 text-center"><p className="text-sm text-slate-500">Seu histórico começa aqui.</p><button onClick={() => openTransaction()} className="primary mt-4">Registrar agora</button></div>}</div></div>
    </div>
  )
}

function EmptyChart({ text }: { text: string }) { return <div className="grid h-52 place-items-center px-8 text-center text-sm text-slate-400">{text}</div> }
