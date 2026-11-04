import type { Account, Transaction } from '../types'

export const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const formatMoney = (cents: number) => currency.format(cents / 100)

export function parseMoney(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(/R\$/i, '').replace(/\./g, '').replace(',', '.')
  const number = Number(normalized)
  return Number.isFinite(number) ? Math.round(number * 100) : 0
}

export const isSettled = (transaction: Transaction) => transaction.status !== 'planned'

export function accountBalance(account: Account, transactions: Transaction[]): number {
  return transactions
    .filter((item) => item.accountId === account.id && isSettled(item))
    .reduce(
      (balance, item) => balance + (item.type === 'income' ? item.amountCents : -item.amountCents),
      account.initialBalanceCents,
    )
}

export function monthKey(date: Date | string): string {
  const parsed = typeof date === 'string' ? new Date(date) : date
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`
}

export function transactionsForMonth(transactions: Transaction[], date: Date): Transaction[] {
  const key = monthKey(date)
  return transactions.filter((item) => monthKey(item.occurredAt) === key)
}

export function monthTotals(transactions: Transaction[], date: Date) {
  return transactionsForMonth(transactions, date).reduce(
    (totals, item) => {
      if (item.status === 'planned') {
        if (item.type === 'expense') totals.plannedExpenses += item.amountCents
      } else if (item.type === 'income') totals.income += item.amountCents
      else totals.expenses += item.amountCents
      return totals
    },
    { income: 0, expenses: 0, plannedExpenses: 0 },
  )
}

export function makeId(): string {
  return crypto.randomUUID()
}
