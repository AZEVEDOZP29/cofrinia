export type TransactionType = 'income' | 'expense'
export type TransactionStatus = 'paid' | 'received' | 'planned'

export interface Profile {
  id: string
  name: string
  objective: string
  monthStartDay: number
  monthlyIncomeCents: number
  onboardingCompleted: boolean
  trialStartedAt: string
  trialEndsAt: string
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'cash' | 'wallet' | 'investment'
  initialBalanceCents: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  color: string
}

export interface Transaction {
  id: string
  description: string
  amountCents: number
  type: TransactionType
  categoryId: string
  accountId: string
  paymentMethod: string
  occurredAt: string
  notes: string
  status: TransactionStatus
  createdAt: string
}

export interface TransactionInput extends Omit<Transaction, 'id' | 'createdAt'> {}
export interface AccountInput extends Omit<Account, 'id' | 'createdAt'> {}
export interface CategoryInput extends Omit<Category, 'id'> {}
