import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowUpRight, FileSearch, ShieldCheck } from 'lucide-react'
import { useData } from '../app/DataContext'
import { useAuth } from '../app/AuthContext'
import { useAction } from '../hooks/useAction'
import { repository } from '../services/repository'
import { isDemo } from '../services/client'
import {
  Badge,
  Button,
  DetailField,
  Direction,
  Feedback,
  Filter,
  PageHeader,
  Pagination,
  SearchInput,
} from '../components/ui'
import { Drawer } from '../components/Drawer'
import { TransactionTable } from '../components/TransactionTable'
import { label, money, timestamp } from '../lib/format'

export default function Transactions() {
  const { data, refresh, addReport } = useData()
  const { session } = useAuth()
  const action = useAction()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [direction, setDirection] = useState('ALL')
  const [page, setPage] = useState(1)
  const risk = params.get('risk') ?? 'ALL'
  if (!data) return null
  const selected = data.transactions.find((t) => t.id === Number(params.get('transaction')))
  const customer = data.customers.find((c) => c.id === selected?.customer_id)
  const filtered = data.transactions.filter(
    (t) =>
      `${t.id} ${t.counterparty_name} ${data.customers.find((c) => c.id === t.customer_id)?.full_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (risk === 'ALL' || t.risk_level === risk) &&
      (status === 'ALL' || t.status === status) &&
      (direction === 'ALL' || t.direction === direction) &&
      (!params.get('customer') || t.customer_id === Number(params.get('customer'))),
  )
  const select = (id: number) => {
    const next = new URLSearchParams(params)
    next.set('transaction', String(id))
    setParams(next)
  }
  const close = () => {
    const next = new URLSearchParams(params)
    next.delete('transaction')
    setParams(next)
  }
  return (
    <>
      <PageHeader
        eyebrow="FOLLOW THE MONEY"
        title="Transactions"
        description="Trace activity, identify signals, and investigate with context."
      >
        <span className="count-label">{data.transactions.length} total transactions</span>
      </PageHeader>
      {params.get('customer') && (
        <div className="summary-strip">
          Filtered to{' '}
          {data.customers.find((c) => c.id === Number(params.get('customer')))?.full_name ??
            'customer'}
          <Button
            variant="ghost"
            onClick={() => {
              setParams({})
              setPage(1)
            }}
          >
            Clear customer filter
          </Button>
        </div>
      )}
      <section className="panel">
        <div className="table-toolbar">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            placeholder="Search transactions or counterparties…"
          />
          <div className="flex flex-wrap gap-2">
            <Filter
              label="Risk levels"
              value={risk}
              onChange={(v) => {
                const next = new URLSearchParams(params)
                if (v === 'ALL') next.delete('risk')
                else next.set('risk', v)
                setParams(next)
                setPage(1)
              }}
              options={['LOW', 'MEDIUM', 'HIGH']}
            />
            <Filter
              label="Statuses"
              value={status}
              onChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
              options={['SUCCESS', 'PENDING', 'FAILED']}
            />
            <Filter
              label="Directions"
              value={direction}
              onChange={(v) => {
                setDirection(v)
                setPage(1)
              }}
              options={['INBOUND', 'OUTBOUND']}
            />
          </div>
        </div>
        <TransactionTable
          transactions={filtered.slice((page - 1) * 10, page * 10)}
          customers={data.customers}
          onSelect={select}
        />
        <Pagination page={page} total={filtered.length} size={10} onChange={setPage} />
      </section>
      {selected && (
        <Drawer title="Transaction details" subtitle={`TXN-${selected.id}`} onClose={close}>
          <div className="transaction-amount">
            <span>{money(selected.amount, selected.currency)}</span>
            <Badge value={selected.status} />
          </div>
          <p className="muted mb-6">{timestamp(selected.occurred_at)} UTC</p>
          <dl className="detail-grid">
            <DetailField label="Customer">
              <Link className="text-link" to={`/app/customers?customer=${customer?.id}`}>
                {customer?.full_name ?? 'Unknown'}
                <ArrowUpRight size={13} />
              </Link>
            </DetailField>
            <DetailField label="Direction">
              <Direction value={selected.direction} />
            </DetailField>
            <DetailField label="Counterparty">{selected.counterparty_name}</DetailField>
            <DetailField label="Counterparty account">{selected.counterparty_account}</DetailField>
            <DetailField label="Transaction type">{label(selected.transaction_type)}</DetailField>
            <DetailField label="Currency">{selected.currency}</DetailField>
          </dl>
          <div className="section-heading">
            <h3>Risk signals</h3>
            {selected.risk_level && <Badge value={selected.risk_level} />}
          </div>
          {selected.risk_signals?.length ? (
            <ul className="evidence-list">
              {selected.risk_signals.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="muted text-sm">
              {selected.risk_level
                ? 'No elevated risk signals in the available data.'
                : 'Run an investigation to assess this transaction.'}
            </p>
          )}
          <div className="investigate-callout">
            <FileSearch size={23} />
            <h3>Put the signals in context.</h3>
            <p>Review an evidence-based summary, potential patterns, and recommended next steps.</p>
            <Button
              variant="primary"
              busy={action.pending}
              onClick={() =>
                void action.run(async () => {
                  const report = await repository.investigate(selected.id, session!.user.full_name)
                  addReport(report)
                  await refresh()
                  navigate(`/app/investigations?report=${report.id}`)
                })
              }
            >
              {action.pending ? 'Analyzing transaction…' : 'Run AI Investigation'}
              {!action.pending && <ArrowUpRight size={16} />}
            </Button>
            <Feedback error={action.error} />
            <small>
              <ShieldCheck size={12} />
              {isDemo
                ? 'Simulated analysis · Human review required'
                : 'AI-assisted analysis · Human review required'}
            </small>
          </div>
        </Drawer>
      )}
    </>
  )
}
