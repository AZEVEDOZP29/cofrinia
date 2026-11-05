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
    <div>
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[.08em] text-[#cc9166]">Histórico financeiro</p>
          <h1 className="font-display mt-2 text-4xl font-normal tracking-[.01em] text-white sm:text-5xl">Movimentações</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#9194a1]">Consulte, edite e organize cada entrada e saída em um único registro contínuo.</p>
        </div>
        <button onClick={() => openTransaction()} className="primary shrink-0"><Plus size={17} /> Novo lançamento</button>
      </div>

      <div className="card mt-8 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-[#777a88]" size={17}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="field !pl-11" placeholder="Buscar descrição, categoria, data ou valor" />
          </div>
          <div className="flex rounded-full border border-[#1c1d22] bg-[#121317] p-1">
            {([['all','Todas'],['income','Receitas'],['expense','Despesas']] as const).map(([value,label]) => (
              <button key={value} onClick={() => setType(value)} className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${type === value ? 'bg-[#2e3038] text-white' : 'text-[#9194a1] hover:text-white'}`}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="hidden grid-cols-[1fr_150px_150px_130px_80px] border-b border-[#1c1d22] px-6 py-4 text-[11px] font-semibold uppercase tracking-[.1em] text-[#777a88] md:grid">
          <span>Descrição</span><span>Categoria</span><span>Conta</span><span>Valor</span><span />
        </div>
        {filtered.length ? (
          <div className="divide-y divide-[#1c1d22]">
            {filtered.map((item) => {
              const category = categories.find((value) => value.id === item.categoryId)
              const account = accounts.find((value) => value.id === item.accountId)
              return (
                <div key={item.id} className="group grid gap-3 px-4 py-4 transition-colors hover:bg-[#121317] md:grid-cols-[1fr_150px_150px_130px_80px] md:items-center md:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#2e3038] text-[#c7c9d1]">
                      {item.type === 'income' ? <ArrowDownLeft size={17}/> : <ArrowUpRight size={17}/>}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#e2e3e9]">{item.description}</p>
                      <p className="mt-1 text-xs text-[#777a88]">{dateFormat.format(new Date(item.occurredAt))} · {item.paymentMethod}</p>
                    </div>
                  </div>
                  <span className="text-sm text-[#acafb9]"><i className="mr-2 inline-block size-1.5 rounded-full bg-[#cc9166]"/>{category?.name}</span>
                  <span className="text-sm text-[#9194a1]">{account?.name}</span>
                  <div>
                    <strong className="text-sm font-medium text-[#e2e3e9]">{item.type === 'income' ? '+' : '−'} {formatMoney(item.amountCents)}</strong>
                    {item.status === 'planned' && <span className="mt-1 block w-fit rounded-full border border-[#777a88] px-2 py-0.5 text-[10px] font-medium text-[#acafb9]">Prevista</span>}
                  </div>
                  <div className="flex gap-1">
                    <button aria-label="Editar" onClick={() => openTransaction(item)} className="grid size-9 place-items-center rounded-full border border-transparent text-[#777a88] hover:border-[#2e3038] hover:text-white"><Pencil size={15}/></button>
                    <button aria-label="Excluir" onClick={() => void remove(item.id)} className="grid size-9 place-items-center rounded-full border border-transparent text-[#777a88] hover:border-[#2e3038] hover:text-[#e2e3e9]"><Trash2 size={15}/></button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-20 text-center">
            <p className="font-display text-3xl font-normal text-white">Nenhum registro encontrado</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#9194a1]">Ajuste os filtros ou registre uma nova movimentação para começar seu histórico.</p>
          </div>
        )}
      </div>
    </div>
  )
}
