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
    <div className="fixed inset-0 z-[70] grid place-items-end bg-black/80 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="transaction-title" className="max-h-[95vh] w-full overflow-y-auto rounded-t-[10px] border border-[#2e3038] bg-[#040406] p-5 sm:max-w-xl sm:rounded-[10px] sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div><p className="text-[13px] font-semibold uppercase tracking-[.08em] text-[#cc9166]">Movimentação</p><h2 id="transaction-title" className="font-display mt-2 text-3xl font-normal tracking-[.01em] text-white">{transaction ? 'Editar lançamento' : 'Novo lançamento'}</h2></div>
          <button aria-label="Fechar" onClick={onClose} className="grid size-9 place-items-center rounded-full border border-[#2e3038] text-[#9194a1] hover:text-white"><X size={17}/></button>
        </div>
        <div className="mb-5 grid grid-cols-2 rounded-full border border-[#1c1d22] bg-[#121317] p-1">
          <button type="button" onClick={() => { setType('expense'); setCategoryId(''); setStatus('paid') }} className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium ${type === 'expense' ? 'bg-[#2e3038] text-white' : 'text-[#777a88] hover:text-[#e2e3e9]'}`}><ArrowUpRight size={16} /> Despesa</button>
          <button type="button" onClick={() => { setType('income'); setCategoryId(''); setStatus('received') }} className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium ${type === 'income' ? 'bg-[#2e3038] text-white' : 'text-[#777a88] hover:text-[#e2e3e9]'}`}><ArrowDownLeft size={16} /> Receita</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Valor</label><div className="relative"><span className="absolute left-4 top-3 text-sm font-medium text-[#777a88]">R$</span><input autoFocus inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="field !pl-12 text-base font-medium" placeholder="0,00" /></div></div>
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
          <div><label className="label">Observação <span className="font-normal text-[#777a88]">(opcional)</span></label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field min-h-20 resize-none !rounded-[10px]" /></div>
          {message && <p role="alert" className="text-sm text-[#e1a18f]">{message}</p>}
          <button disabled={saving} className="primary w-full">{saving ? 'Salvando…' : transaction ? 'Salvar alterações' : `Registrar ${type === 'expense' ? 'despesa' : 'receita'}`}</button>
        </form>
      </div>
    </div>
  )
}
