import { describe, expect, it } from 'vitest'
import { accountBalance, monthTotals, parseMoney } from './finance'
import type { Account, Transaction } from '../types'

const account: Account = {
  id: 'account-1', name: 'Conta', type: 'checking', initialBalanceCents: 100_00, createdAt: '2026-11-01',
}

const transaction = (overrides: Partial<Transaction>): Transaction => ({
  id: crypto.randomUUID(), description: 'Item', amountCents: 0, type: 'expense', categoryId: 'cat',
  accountId: account.id, paymentMethod: 'Pix', occurredAt: '2026-11-04T12:00:00.000Z', notes: '',
  status: 'paid', createdAt: '2026-11-04T12:00:00.000Z', ...overrides,
})

describe('regras financeiras', () => {
  it('converte valores brasileiros para centavos sem erro de ponto flutuante', () => {
    expect(parseMoney('R$ 1.234,56')).toBe(123456)
    expect(parseMoney('38,90')).toBe(3890)
  })

  it('calcula saldo apenas com movimentações liquidadas', () => {
    const items = [
      transaction({ type: 'income', amountCents: 50_00, status: 'received' }),
      transaction({ amountCents: 20_00 }),
      transaction({ amountCents: 80_00, status: 'planned' }),
    ]
    expect(accountBalance(account, items)).toBe(130_00)
  })

  it('separa despesas previstas do resultado realizado', () => {
    const totals = monthTotals([
      transaction({ type: 'income', amountCents: 500_00, status: 'received' }),
      transaction({ amountCents: 120_00 }),
      transaction({ amountCents: 70_00, status: 'planned' }),
    ], new Date('2026-11-12T12:00:00'))
    expect(totals).toEqual({ income: 500_00, expenses: 120_00, plannedExpenses: 70_00 })
  })
})
