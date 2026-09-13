import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import type { Customer, Transaction } from '../types'
import { initials, money, timestamp } from '../lib/format'
import { Badge, Direction, EmptyState } from './ui'

export function TransactionTable({
  transactions,
  customers,
  onSelect,
  compact = false,
}: {
  transactions: Transaction[]
  customers: Customer[]
  onSelect?: (id: number) => void
  compact?: boolean
}) {
  if (!transactions.length) return <EmptyState />
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">
          {compact ? 'Recent suspicious activity' : 'Transactions'}
        </caption>
        <thead>
          <tr>
            <th>Customer / Transaction</th>
            {!compact && <th>Counterparty</th>}
            <th>Amount</th>
            {!compact && <th>Direction / Type</th>}
            <th>Risk level</th>
            <th>{compact ? 'Signal' : 'Status'}</th>
            <th>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const customer = customers.find((c) => c.id === t.customer_id)
            return (
              <tr key={t.id}>
                <td>
                  <div className="entity-cell">
                    <span className="avatar entity-avatar">
                      {initials(customer?.full_name ?? 'Unknown')}
                    </span>
                    <div>
                      {onSelect ? (
                        <button className="table-primary" onClick={() => onSelect(t.id)}>
                          {customer?.full_name ?? `Customer ${t.customer_id}`}
                        </button>
                      ) : (
                        <Link
                          className="table-primary"
                          to={`/app/transactions?transaction=${t.id}`}
                        >
                          {customer?.full_name ?? `Customer ${t.customer_id}`}
                        </Link>
                      )}
                      <small>
                        TXN-{t.id} <span>·</span> {timestamp(t.occurred_at)}
                      </small>
                    </div>
                  </div>
                </td>
                {!compact && (
                  <td>
                    <strong className="font-normal">{t.counterparty_name}</strong>
                    <small>{t.counterparty_account}</small>
                  </td>
                )}
                <td className="money">
                  {money(t.amount, t.currency)}
                  <small>{t.currency}</small>
                </td>
                {!compact && (
                  <td>
                    <Direction value={t.direction} />
                    <small>{t.transaction_type}</small>
                  </td>
                )}
                <td>
                  {t.risk_level ? (
                    <Badge value={t.risk_level} />
                  ) : (
                    <span className="muted">Not assessed</span>
                  )}
                </td>
                <td>
                  {compact ? (
                    <span className="signal-label">{t.risk_signals?.[0] ?? 'Review required'}</span>
                  ) : (
                    <Badge value={t.status} />
                  )}
                </td>
                <td>
                  {onSelect ? (
                    <button
                      className="icon-link"
                      aria-label={`View transaction ${t.id}`}
                      onClick={() => onSelect(t.id)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  ) : (
                    <Link
                      className="icon-link"
                      aria-label={`View transaction ${t.id}`}
                      to={`/app/transactions?transaction=${t.id}`}
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
