import { useEffect, useState } from 'react'
import { CircleDollarSign, CreditCard, LayoutDashboard, LogOut, Menu, Plus, Settings, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'
import type { Transaction } from '../types'
import { Brand } from './Brand'
import { TransactionModal } from './TransactionModal'

export interface AppOutletContext {
  openTransaction: (transaction?: Transaction) => void
}

const navigation = [
  { to: '/app', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/movimentacoes', label: 'Movimentações', icon: CircleDollarSign },
  { to: '/planos', label: 'Plano', icon: CreditCard },
  { to: '/perfil', label: 'Configurações', icon: Settings },
]

export function AppLayout() {
  const { user, signOut } = useAuth()
  const { profile, loading, error } = useFinance()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [transaction, setTransaction] = useState<Transaction | null | undefined>(undefined)

  useEffect(() => setMenuOpen(false), [location.pathname])

  const openTransaction = (item?: Transaction) => setTransaction(item ?? null)
  if (loading) return <div className="grid min-h-screen place-items-center bg-obsidian text-sm text-fog">Preparando seu espaço financeiro…</div>

  const nav = (
    <>
      <div className="border-b border-graphite px-5 py-6"><Brand light /></div>
      <div className="px-5 pb-3 pt-7"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-ash">Navegação</p></div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `relative flex items-center gap-3 rounded-[2px] border px-3.5 py-3 text-sm font-medium ${isActive ? 'border-graphite bg-carbon text-white' : 'border-transparent text-fog hover:border-graphite hover:text-white'}`}>
            <Icon size={18} strokeWidth={1.5} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-graphite p-4">
        <p className="truncate text-sm font-medium text-white">{profile.name || user?.name}</p>
        <p className="mt-1 truncate text-xs text-ash">{user?.isLocal ? 'Dados neste dispositivo' : user?.email}</p>
        <button onClick={() => void signOut()} className="mt-5 flex items-center gap-2 text-sm text-fog hover:text-white"><LogOut size={15} strokeWidth={1.5} /> Sair</button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-obsidian text-bone">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-graphite bg-onyx lg:flex">{nav}</aside>
      {menuOpen && <button aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-graphite bg-onyx transition-transform lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="absolute right-4 top-5 grid size-9 place-items-center rounded-full border border-graphite text-fog hover:text-white"><X size={17} /></button>{nav}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-graphite bg-obsidian/95 px-4 backdrop-blur sm:px-7">
          <button aria-label="Abrir menu" onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-full border border-graphite text-fog lg:hidden"><Menu size={18} /></button>
          <div className="hidden lg:block"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-copper">MeuControle</p><p className="mt-1 text-sm text-fog">Seu dinheiro, com clareza</p></div>
          {location.pathname !== '/onboarding' && <button onClick={() => openTransaction()} className="primary ml-auto hidden sm:inline-flex"><Plus size={16} />Registrar gasto</button>}
        </header>
        {error && <div className="mx-4 mt-4 rounded-[10px] border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-200">{error}</div>}
        <main className="mx-auto max-w-[1216px] p-4 pb-24 sm:p-7 lg:p-10"><Outlet context={{ openTransaction } satisfies AppOutletContext} /></main>
      </div>

      {location.pathname !== '/onboarding' && <button aria-label="Registrar gasto" onClick={() => openTransaction()} className="fixed bottom-20 right-5 z-30 grid size-14 place-items-center rounded-full border border-white bg-white text-black sm:hidden"><Plus /></button>}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-graphite bg-onyx lg:hidden">
        {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-16 flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-white' : 'text-ash'}`}><Icon size={18} strokeWidth={1.5} />{label === 'Movimentações' ? 'Registros' : label}</NavLink>)}
      </nav>
      {transaction !== undefined && <TransactionModal transaction={transaction} onClose={() => setTransaction(undefined)} />}
    </div>
  )
}
