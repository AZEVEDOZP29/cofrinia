import { useEffect, useState } from 'react'
import { BarChart3, CircleDollarSign, CreditCard, LayoutDashboard, LogOut, Menu, Moon, Plus, Settings, Sun, WalletCards, X } from 'lucide-react'
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
  const [dark, setDark] = useState(() => localStorage.getItem('meucontrole:theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('meucontrole:theme', dark ? 'dark' : 'light')
  }, [dark])
  useEffect(() => setMenuOpen(false), [location.pathname])

  const openTransaction = (item?: Transaction) => setTransaction(item ?? null)
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-emerald-400">Preparando seu espaço financeiro…</div>

  const nav = (
    <>
      <div className="px-5 py-6"><Brand light /></div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium ${isActive ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}>
            <Icon size={19} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium text-white">{profile.name || user?.name}</p>
        <p className="mt-0.5 text-xs text-slate-400">{user?.isLocal ? 'Dados neste dispositivo' : user?.email}</p>
        <button onClick={() => void signOut()} className="mt-4 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><LogOut size={16} /> Sair</button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#07111f]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#071426] lg:flex">{nav}</aside>
      {menuOpen && <div className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#071426] transition-transform lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="absolute right-4 top-5 text-slate-400"><X /></button>{nav}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-7">
          <button aria-label="Abrir menu" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 lg:hidden"><Menu /></button>
          <div className="hidden lg:block"><p className="text-xs font-medium uppercase tracking-[.18em] text-slate-400">MeuControle</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Seu dinheiro, com clareza</p></div>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Alternar tema" onClick={() => setDark((value) => !value)} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            {location.pathname !== '/onboarding' && <button onClick={() => openTransaction()} className="primary"><Plus size={18} /><span className="hidden sm:inline">Registrar gasto</span></button>}
          </div>
        </header>
        {error && <div className="mx-4 mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
        <main className="mx-auto max-w-[1500px] p-4 pb-24 sm:p-7"><Outlet context={{ openTransaction } satisfies AppOutletContext} /></main>
      </div>

      {location.pathname !== '/onboarding' && <button aria-label="Registrar gasto" onClick={() => openTransaction()} className="fixed bottom-20 right-5 z-30 grid size-14 place-items-center rounded-full bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-950/20 sm:hidden"><Plus /></button>}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:hidden">
        {navigation.slice(0, 4).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-16 flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}><Icon size={20} />{label === 'Movimentações' ? 'Registros' : label}</NavLink>)}
      </nav>
      {transaction !== undefined && <TransactionModal transaction={transaction} onClose={() => setTransaction(undefined)} />}
    </div>
  )
}
