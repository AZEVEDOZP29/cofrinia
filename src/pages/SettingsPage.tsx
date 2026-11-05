import { useState, type FormEvent } from 'react'
import { Landmark, Plus, ShieldCheck, Tags, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'
import { accountBalance, formatMoney, parseMoney } from '../lib/finance'

export function SettingsPage() {
  const { user } = useAuth()
  const { profile, accounts, categories, transactions, updateProfile, addAccount, addCategory } = useFinance()
  const [name, setName] = useState(profile.name)
  const [accountName, setAccountName] = useState('')
  const [accountBalanceValue, setAccountBalanceValue] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense')
  const [saved, setSaved] = useState('')

  async function saveProfile(event: FormEvent) { event.preventDefault(); await updateProfile({ name: name.trim() }); setSaved('Perfil atualizado.'); window.setTimeout(() => setSaved(''), 2500) }
  async function createAccount(event: FormEvent) { event.preventDefault(); if (!accountName.trim()) return; await addAccount({ name: accountName.trim(), type: 'checking', initialBalanceCents: parseMoney(accountBalanceValue) }); setAccountName(''); setAccountBalanceValue('') }
  async function createCategory(event: FormEvent) { event.preventDefault(); if (!categoryName.trim()) return; await addCategory({ name: categoryName.trim(), type: categoryType, color: categoryType === 'income' ? '#e2e3e9' : '#cc9166' }); setCategoryName('') }

  return (
    <div>
      <p className="text-[13px] font-semibold uppercase tracking-[.08em] text-[#cc9166]">Conta e personalização</p>
      <h1 className="font-display mt-2 text-4xl font-normal tracking-[.01em] text-white sm:text-5xl">Configurações</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#9194a1]">Ajuste seu perfil, contas e categorias sem perder a continuidade do seu histórico.</p>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-[#2e3038] text-[#c7c9d1]"><UserRound size={18}/></span>
            <div><h2 className="text-base font-medium text-white">Perfil</h2><p className="mt-0.5 text-xs text-[#777a88]">Informações da sua conta</p></div>
          </div>
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <div><label className="label">Nome</label><input value={name} onChange={(e) => setName(e.target.value)} className="field" /></div>
            <div><label className="label">E-mail</label><input disabled value={user?.email || 'Modo local'} className="field disabled:cursor-not-allowed disabled:border-[#1c1d22] disabled:text-[#5e616e]" /></div>
            {saved && <p role="status" className="text-sm text-[#cc9166]">{saved}</p>}
            <button className="primary">Salvar perfil</button>
          </form>
        </section>

        <section className="card p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-[#2e3038] text-[#c7c9d1]"><Landmark size={18}/></span>
            <div><h2 className="text-base font-medium text-white">Minhas contas</h2><p className="mt-0.5 text-xs text-[#777a88]">Saldos calculados pelos lançamentos</p></div>
          </div>
          <div className="mt-5 divide-y divide-[#1c1d22] border-y border-[#1c1d22]">
            {accounts.map((account) => <div key={account.id} className="flex items-center justify-between py-3.5"><span className="text-sm text-[#c7c9d1]">{account.name}</span><strong className="text-sm font-medium text-white">{formatMoney(accountBalance(account, transactions))}</strong></div>)}
          </div>
          <form onSubmit={createAccount} className="mt-5 grid gap-3 sm:grid-cols-[1fr_140px_auto]">
            <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="field" placeholder="Nome da conta"/>
            <input value={accountBalanceValue} onChange={(e) => setAccountBalanceValue(e.target.value)} className="field" placeholder="Saldo inicial"/>
            <button aria-label="Adicionar conta" className="secondary px-4"><Plus size={17}/></button>
          </form>
        </section>

        <section className="card p-6 xl:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-[#2e3038] text-[#c7c9d1]"><Tags size={18}/></span>
            <div><h2 className="text-base font-medium text-white">Categorias</h2><p className="mt-0.5 text-xs text-[#777a88]">Organize receitas e despesas do seu jeito</p></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => <span key={category.id} className="inline-flex items-center gap-2 rounded-full border border-[#2e3038] px-3 py-1.5 text-xs font-medium text-[#c7c9d1]"><i className="size-1.5 rounded-full bg-[#cc9166]"/>{category.name}<span className="text-[#777a88]">· {category.type === 'income' ? 'receita' : 'despesa'}</span></span>)}
          </div>
          <form onSubmit={createCategory} className="mt-6 grid gap-3 sm:grid-cols-[1fr_150px_auto]">
            <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="field" placeholder="Nova categoria"/>
            <select value={categoryType} onChange={(e) => setCategoryType(e.target.value as 'income'|'expense')} className="field"><option value="expense">Despesa</option><option value="income">Receita</option></select>
            <button className="secondary"><Plus size={17}/> Adicionar</button>
          </form>
        </section>

        <section className="card p-6 xl:col-span-2">
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#2e3038] text-[#c7c9d1]"><ShieldCheck size={18}/></span>
            <div><h2 className="text-base font-medium text-white">Privacidade e segurança</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#9194a1]">Com o Supabase configurado, cada registro é protegido por políticas de Row Level Security vinculadas à sua identidade. O modo local mantém os dados somente neste navegador e é indicado para avaliação do produto.</p></div>
          </div>
        </section>
      </div>
    </div>
  )
}
