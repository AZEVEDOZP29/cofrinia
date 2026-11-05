import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { makeId } from '../lib/finance'
import { supabase } from '../lib/supabase'
import type { Account, AccountInput, Category, CategoryInput, Profile, SubscriptionStatus, Transaction, TransactionInput } from '../types'

interface FinanceData {
  profile: Profile
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
}

interface FinanceContextValue extends FinanceData {
  loading: boolean
  error: string
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  addAccount: (input: AccountInput) => Promise<Account>
  addCategory: (input: CategoryInput) => Promise<Category>
  saveTransaction: (input: TransactionInput, id?: string) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<void>
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export const defaultCategories: CategoryInput[] = [
  { name: 'Salário', type: 'income', color: '#10b981' },
  { name: 'Renda extra', type: 'income', color: '#34d399' },
  { name: 'Alimentação', type: 'expense', color: '#f59e0b' },
  { name: 'Moradia', type: 'expense', color: '#6366f1' },
  { name: 'Transporte', type: 'expense', color: '#3b82f6' },
  { name: 'Saúde', type: 'expense', color: '#ef4444' },
  { name: 'Lazer', type: 'expense', color: '#a855f7' },
  { name: 'Contas domésticas', type: 'expense', color: '#14b8a6' },
  { name: 'Compras', type: 'expense', color: '#ec4899' },
  { name: 'Outros', type: 'expense', color: '#64748b' },
]

function freshProfile(id: string, name = ''): Profile {
  const started = new Date()
  const ends = new Date(started.getTime() + 72 * 60 * 60 * 1000)
  return {
    id,
    name,
    objective: '',
    monthStartDay: 1,
    monthlyIncomeCents: 0,
    onboardingCompleted: false,
    subscriptionStatus: 'trialing',
    trialStartedAt: started.toISOString(),
    trialEndsAt: ends.toISOString(),
    currentPeriodEndsAt: null,
  }
}

function localInitialData(id: string, name: string): FinanceData {
  return {
    profile: freshProfile(id, name),
    accounts: [],
    categories: defaultCategories.map((category) => ({ ...category, id: makeId() })),
    transactions: [],
  }
}

function normalizeLocalData(saved: string | null, id: string, name: string): FinanceData {
  const initial = localInitialData(id, name)
  if (!saved) return initial
  const parsed = JSON.parse(saved) as FinanceData
  return {
    profile: { ...initial.profile, ...parsed.profile },
    accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
    categories: Array.isArray(parsed.categories) ? parsed.categories : initial.categories,
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
  }
}

function messageFrom(cause: unknown) {
  if (cause && typeof cause === 'object' && 'message' in cause && typeof cause.message === 'string') return cause.message
  return 'Não foi possível carregar seus dados financeiros.'
}

const mapProfile = (row: Record<string, unknown>, trial?: Record<string, unknown>): Profile => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  objective: String(row.objective ?? ''),
  monthStartDay: Number(row.month_start_day ?? 1),
  monthlyIncomeCents: Number(row.monthly_income_cents ?? 0),
  onboardingCompleted: Boolean(row.onboarding_completed),
  subscriptionStatus: (trial?.status ?? 'trialing') as SubscriptionStatus,
  trialStartedAt: String(trial?.trial_started_at ?? row.created_at ?? new Date().toISOString()),
  trialEndsAt: String(trial?.trial_ends_at ?? new Date().toISOString()),
  currentPeriodEndsAt: trial?.current_period_ends_at ? String(trial.current_period_ends_at) : null,
})

const mapAccount = (row: Record<string, unknown>): Account => ({
  id: String(row.id), name: String(row.name), type: row.type as Account['type'],
  initialBalanceCents: Number(row.initial_balance_cents), createdAt: String(row.created_at),
})

const mapCategory = (row: Record<string, unknown>): Category => ({
  id: String(row.id), name: String(row.name), type: row.type as Category['type'], color: String(row.color),
})

const mapTransaction = (row: Record<string, unknown>): Transaction => ({
  id: String(row.id), description: String(row.description), amountCents: Number(row.amount_cents),
  type: row.type as Transaction['type'], categoryId: String(row.category_id), accountId: String(row.account_id),
  paymentMethod: String(row.payment_method), occurredAt: String(row.occurred_at), notes: String(row.notes ?? ''),
  status: row.status as Transaction['status'], createdAt: String(row.created_at),
})

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<FinanceData>(() => localInitialData('loading', ''))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const localKey = user ? `meucontrole:data:${user.id}` : ''

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    setError('')
    if (user.isLocal || !supabase) {
      const saved = localStorage.getItem(localKey)
      try {
        setData(normalizeLocalData(saved, user.id, user.name))
      } catch {
        setData(localInitialData(user.id, user.name))
      }
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const [profileResult, accountsResult, categoriesResult, transactionsResult, subscriptionResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('accounts').select('*').order('created_at'),
          supabase.from('categories').select('*').order('name'),
          supabase.from('transactions').select('*').order('occurred_at', { ascending: false }),
          supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        ])
        const firstError = [profileResult, accountsResult, categoriesResult, transactionsResult, subscriptionResult]
          .map((result) => result.error).find(Boolean)
        if (firstError) throw firstError
        if (cancelled) return
        setData({
          profile: mapProfile(profileResult.data as Record<string, unknown>, subscriptionResult.data as Record<string, unknown>),
          accounts: (accountsResult.data ?? []).map((row) => mapAccount(row as Record<string, unknown>)),
          categories: (categoriesResult.data ?? []).map((row) => mapCategory(row as Record<string, unknown>)),
          transactions: (transactionsResult.data ?? []).map((row) => mapTransaction(row as Record<string, unknown>)),
        })
      } catch (cause) {
        if (!cancelled) setError(messageFrom(cause))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [user, localKey])

  useEffect(() => {
    if (user?.isLocal && !loading) localStorage.setItem(localKey, JSON.stringify(data))
  }, [data, loading, localKey, user?.isLocal])

  const reportError = useCallback((message: string) => {
    setError(message)
    window.setTimeout(() => setError(''), 5000)
  }, [])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    const previous = data.profile
    setData((current) => ({ ...current, profile: { ...current.profile, ...updates } }))
    if (user?.isLocal || !supabase) return
    const payload = {
      name: updates.name,
      objective: updates.objective,
      month_start_day: updates.monthStartDay,
      monthly_income_cents: updates.monthlyIncomeCents,
      onboarding_completed: updates.onboardingCompleted,
    }
    const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
    const { data: savedProfile, error: saveError } = await supabase
      .from('profiles').update(cleanPayload).eq('id', user!.id).select('*').single()
    if (saveError) {
      setData((current) => ({ ...current, profile: previous }))
      reportError(saveError.message)
      throw saveError
    }
    const canonical = mapProfile(savedProfile as Record<string, unknown>, {
      status: previous.subscriptionStatus,
      trial_started_at: previous.trialStartedAt,
      trial_ends_at: previous.trialEndsAt,
      current_period_ends_at: previous.currentPeriodEndsAt,
    })
    setData((current) => ({ ...current, profile: { ...current.profile, ...canonical } }))
  }, [data.profile, reportError, user])

  const addAccount = useCallback(async (input: AccountInput) => {
    const account: Account = { ...input, id: makeId(), createdAt: new Date().toISOString() }
    setData((current) => ({ ...current, accounts: [...current.accounts, account] }))
    if (!user?.isLocal && supabase) {
      const { data: savedAccount, error: saveError } = await supabase.from('accounts').insert({
        id: account.id, user_id: user!.id, name: account.name, type: account.type,
        initial_balance_cents: account.initialBalanceCents,
      }).select('*').single()
      if (saveError) {
        setData((current) => ({ ...current, accounts: current.accounts.filter((item) => item.id !== account.id) }))
        reportError(saveError.message)
        throw saveError
      }
      const canonical = mapAccount(savedAccount as Record<string, unknown>)
      setData((current) => ({ ...current, accounts: current.accounts.map((item) => item.id === account.id ? canonical : item) }))
      return canonical
    }
    return account
  }, [reportError, user])

  const addCategory = useCallback(async (input: CategoryInput) => {
    const category: Category = { ...input, id: makeId() }
    setData((current) => ({ ...current, categories: [...current.categories, category] }))
    if (!user?.isLocal && supabase) {
      const { data: savedCategory, error: saveError } = await supabase
        .from('categories').insert({ ...category, user_id: user!.id }).select('*').single()
      if (saveError) {
        setData((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== category.id) }))
        reportError(saveError.message)
        throw saveError
      }
      const canonical = mapCategory(savedCategory as Record<string, unknown>)
      setData((current) => ({ ...current, categories: current.categories.map((item) => item.id === category.id ? canonical : item) }))
      return canonical
    }
    return category
  }, [reportError, user])

  const saveTransaction = useCallback(async (input: TransactionInput, id?: string) => {
    const previous = data.transactions
    const transaction: Transaction = {
      ...input, id: id ?? makeId(), createdAt: id ? previous.find((item) => item.id === id)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
    }
    setData((current) => ({
      ...current,
      transactions: id
        ? current.transactions.map((item) => item.id === id ? transaction : item)
        : [transaction, ...current.transactions],
    }))
    if (!user?.isLocal && supabase) {
      const payload = {
        id: transaction.id, user_id: user!.id, description: transaction.description,
        amount_cents: transaction.amountCents, type: transaction.type, category_id: transaction.categoryId,
        account_id: transaction.accountId, payment_method: transaction.paymentMethod,
        occurred_at: transaction.occurredAt, notes: transaction.notes, status: transaction.status,
      }
      const result = id
        ? await supabase.from('transactions').update(payload).eq('id', id).select('*').single()
        : await supabase.from('transactions').insert(payload).select('*').single()
      if (result.error) {
        setData((current) => ({ ...current, transactions: previous }))
        reportError(result.error.message)
        throw result.error
      }
      const canonical = mapTransaction(result.data as Record<string, unknown>)
      setData((current) => ({
        ...current,
        transactions: current.transactions.map((item) => item.id === transaction.id ? canonical : item),
      }))
      return canonical
    }
    return transaction
  }, [data.transactions, reportError, user])

  const deleteTransaction = useCallback(async (id: string) => {
    const previous = data.transactions
    setData((current) => ({ ...current, transactions: current.transactions.filter((item) => item.id !== id) }))
    if (!user?.isLocal && supabase) {
      const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id).select('id').single()
      if (deleteError) {
        setData((current) => ({ ...current, transactions: previous }))
        reportError(deleteError.message)
        throw deleteError
      }
    }
  }, [data.transactions, reportError, user])

  return (
    <FinanceContext.Provider value={{ ...data, loading, error, updateProfile, addAccount, addCategory, saveTransaction, deleteTransaction }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) throw new Error('useFinance deve ser usado dentro de FinanceProvider')
  return context
}
