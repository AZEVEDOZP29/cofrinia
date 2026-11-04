import { useMemo, useState, type FormEvent } from 'react'
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { parseMoney } from '../lib/finance'
import type { Transaction, TransactionInput, TransactionType } from '../types'

const methods = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Boleto', 'Transferência', 'Outro']
const localDateTime = (date?: string) => {
  const value = date ? new Date(date) : new Date()
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset())
  return value.toISOString().slice(0, 16)
}

export function TransactionModal({ transaction, onClose }: { transaction: Transaction | null, onClose: () => void }) {
  const { accounts, categories, saveTransaction } = useFinance()
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const availableCategories = useMemo(() => categories.filter((item) => item.type === type), [categories, type])
  const [amount, setAmount] = useState(transaction ? (transaction.amountCents / 100).toFixed(2).replace('.', ',') : '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '')
  const [accountId, setAccountId] = useState(transaction?.accountId ?? accounts[0]?.id ?? '')
  const [method, setMethod] = useState(transaction?.paymentMethod ?? 'Pix')
  const [occurredAt, setOccurredAt] = useState(localDateTime(transaction?.occurredAt))
  const [status, setStatus] = useState<TransactionInput['status']>(transaction?.status ?? 'paid')
  const [notes, setNotes] = useState(transaction?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const cents = parseMoney(amount)
    const selectedCategory = categoryId || availableCategories[0]?.id
    if (!cents || !description.trim() || !selectedCategory || !accountId) {
      setMessage('Preencha valor, descrição, categoria e conta.')
      return
    }
    setSaving(true)
    try {
      await saveTransaction({
        amountCents: cents, description: description.trim(), type, categoryId: selectedCategory,
        accountId, paymentMethod: method, occurredAt: new Date(occurredAt).toISOString(), notes: notes.trim(),
        status: status === 'received' && type === 'expense' ? 'paid' : status === 'paid' && type === 'income' ? 'received' : status,
      }, transaction?.id)
      onClose()
    } catch { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-slate-950/60 p-0 sm:place-items-center sm:p-5" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:max-w-xl sm:rounded-3xl sm:p-7">
        <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-600">Movimentação</p><h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{transaction ? 'Editar lançamento' : 'Novo lançamento'}</h2></div><button aria-label="Fechar" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X /></button></div>
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
          <button type="button" onClick={() => { setType('expense'); setCategoryId(''); setStatus('paid') }} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}><ArrowUpRight size={17} /> Despesa</button>
          <button type="button" onClick={() => { setType('income'); setCategoryId(''); setStatus('received') }} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}><ArrowDownLeft size={17} /> Receita</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Valor</label><div className="relative"><span className="absolute left-3.5 top-3 text-sm font-semibold text-slate-400">R$</span><input autoFocus inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="field pl-11 text-lg font-bold" placeholder="0,00" /></div></div>
          <div><label className="label">Descrição</label><input value={description} onChange={(e) => setDescription(e.target.value)} className="field" placeholder={type === 'expense' ? 'Ex.: Almoço' : 'Ex.: Salário'} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Categoria</label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="field"><option value="">Selecione</option>{availableCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
            <div><label className="label">Conta</label><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="field"><option value="">Selecione</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Pagamento</label><select value={method} onChange={(e) => setMethod(e.target.value)} className="field">{methods.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div><label className="label">Situação</label><select value={status} onChange={(e) => setStatus(e.target.value as TransactionInput['status'])} className="field"><option value={type === 'income' ? 'received' : 'paid'}>{type === 'income' ? 'Recebida' : 'Paga'}</option><option value="planned">Prevista</option></select></div>
          </div>
          <div><label className="label">Data e horário</label><input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} className="field" /></div>
          <div><label className="label">Observação <span className="font-normal text-slate-400">(opcional)</span></label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field min-h-20 resize-none" /></div>
          {message && <p className="text-sm text-rose-600">{message}</p>}
          <button disabled={saving} className="primary w-full">{saving ? 'Salvando…' : transaction ? 'Salvar alterações' : `Registrar ${type === 'expense' ? 'despesa' : 'receita'}`}</button>
        </form>
      </div>
    </div>
  )
}
