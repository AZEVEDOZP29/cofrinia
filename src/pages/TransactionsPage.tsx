import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../components/AppLayout'
import { useFinance } from '../context/FinanceContext'
import { formatMoney } from '../lib/finance'
import type { TransactionType } from '../types'

const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

export function TransactionsPage() {
  const { transactions, categories, accounts, deleteTransaction } = useFinance()
  const { openTransaction } = useOutletContext<AppOutletContext>()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | TransactionType>('all')
  const filtered = useMemo(() => transactions.filter((item) => {
    const category = categories.find((value) => value.id === item.categoryId)?.name ?? ''
    const haystack = `${item.description} ${category} ${item.paymentMethod} ${dateFormat.format(new Date(item.occurredAt))} ${(item.amountCents / 100).toFixed(2)}`.toLocaleLowerCase('pt-BR')
    return (type === 'all' || item.type === type) && haystack.includes(search.toLocaleLowerCase('pt-BR'))
  }).sort((a,b) => +new Date(b.occurredAt) - +new Date(a.occurredAt)), [categories, search, transactions, type])

  async function remove(id: string) {
    if (window.confirm('Excluir esta movimentação? O saldo será recalculado imediatamente.')) await deleteTransaction(id)
  }

  return (
    <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-500">Histórico financeiro</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">Movimentações</h1></div><button onClick={() => openTransaction()} className="primary"><Plus size={18} /> Novo lançamento</button></div>
      <div className="card mt-7 p-4"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} className="field pl-10" placeholder="Buscar por descrição, categoria ou pagamento" /></div><div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-950">{([['all','Todas'],['income','Receitas'],['expense','Despesas']] as const).map(([value,label]) => <button key={value} onClick={() => setType(value)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${type === value ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500'}`}>{label}</button>)}</div></div></div>
      <div className="card mt-4 overflow-hidden"><div className="hidden grid-cols-[1fr_150px_150px_130px_80px] border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800 md:grid"><span>Descrição</span><span>Categoria</span><span>Conta</span><span>Valor</span><span /></div>{filtered.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map((item) => { const category = categories.find((value) => value.id === item.categoryId); const account = accounts.find((value) => value.id === item.accountId); return <div key={item.id} className="group grid gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 md:grid-cols-[1fr_150px_150px_130px_80px] md:items-center md:px-5"><div className="flex min-w-0 items-center gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-full ${item.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'}`}>{item.type === 'income' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.description}</p><p className="mt-0.5 text-xs text-slate-400">{dateFormat.format(new Date(item.occurredAt))} · {item.paymentMethod} {item.status === 'planned' && '· Prevista'}</p></div></div><span className="text-sm text-slate-500"><i className="mr-2 inline-block size-2 rounded-full" style={{background: category?.color}}/>{category?.name}</span><span className="text-sm text-slate-500">{account?.name}</span><strong className={`text-sm ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.type === 'income' ? '+' : '-'} {formatMoney(item.amountCents)}</strong><div className="flex gap-1"><button aria-label="Editar" onClick={() => openTransaction(item)} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-blue-600 dark:hover:bg-slate-700"><Pencil size={16}/></button><button aria-label="Excluir" onClick={() => void remove(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-rose-600 dark:hover:bg-slate-700"><Trash2 size={16}/></button></div></div>})}</div> : <div className="px-6 py-16 text-center"><p className="font-semibold text-slate-700 dark:text-slate-200">Nenhuma movimentação encontrada</p><p className="mt-2 text-sm text-slate-400">Ajuste os filtros ou registre um novo lançamento.</p></div>}</div>
    </div>
  )
}
