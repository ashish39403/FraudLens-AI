import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowUpRight, Building2, UserRound, Users } from 'lucide-react'
import { useData } from '../app/DataContext'
import {
  Badge,
  DetailField,
  EmptyState,
  Filter,
  PageHeader,
  Pagination,
  SearchInput,
} from '../components/ui'
import { Drawer } from '../components/Drawer'
import { initials, label, money, timestamp } from '../lib/format'

export default function Customers() {
  const { data } = useData()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [risk, setRisk] = useState('ALL')
  const [kyc, setKyc] = useState('ALL')
  const [page, setPage] = useState(1)
  if (!data) return null
  const filtered = data.customers.filter(
    (c) =>
      `${c.full_name} ${c.external_customer_id} ${c.country}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (risk === 'ALL' || c.risk_level === risk) &&
      (kyc === 'ALL' || c.kyc_status === kyc),
  )
  const selected = data.customers.find((c) => c.id === Number(params.get('customer')))
  const customerTransactions = selected
    ? data.transactions.filter((t) => t.customer_id === selected.id)
    : []
  return (
    <>
      <PageHeader
        eyebrow="KNOW THE CUSTOMER"
        title="Customers"
        description="The context behind every account and transaction."
      >
        <span className="count-label">
          <Users size={14} />
          {data.customers.length} customer profiles
        </span>
      </PageHeader>
      <div className="summary-strip">
        <span>
          <i className="legend-dot risk-low" />
          {data.customers.filter((c) => c.kyc_status === 'VERIFIED').length} verified profiles
        </span>
        <span>
          <i className="legend-dot risk-medium" />
          {data.customers.filter((c) => c.kyc_status === 'PENDING').length} pending verification
        </span>
        <span>
          <i className="legend-dot risk-high" />
          {data.customers.filter((c) => c.risk_level === 'HIGH').length} high risk
        </span>
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            placeholder="Search customers, IDs, or countries…"
          />
          <div className="flex flex-wrap gap-2">
            <Filter
              label="Risk levels"
              value={risk}
              onChange={(v) => {
                setRisk(v)
                setPage(1)
              }}
              options={['LOW', 'MEDIUM', 'HIGH']}
            />
            <Filter
              label="KYC statuses"
              value={kyc}
              onChange={(v) => {
                setKyc(v)
                setPage(1)
              }}
              options={['VERIFIED', 'PENDING', 'REJECTED']}
            />
          </div>
        </div>
        {filtered.length ? (
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Customer profiles</caption>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Country</th>
                  <th>KYC status</th>
                  <th>Risk level</th>
                  <th>
                    <span className="sr-only">View profile</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * 10, page * 10).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="entity-cell">
                        <span className="avatar entity-avatar">{initials(c.full_name)}</span>
                        <div>
                          <button
                            className="table-primary"
                            onClick={() => setParams({ customer: String(c.id) })}
                          >
                            {c.full_name}
                          </button>
                          <small>{c.external_customer_id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-2 muted">
                        {c.customer_type === 'BUSINESS' ? (
                          <Building2 size={14} />
                        ) : (
                          <UserRound size={14} />
                        )}
                        {label(c.customer_type)}
                      </span>
                    </td>
                    <td>{c.country}</td>
                    <td>
                      <Badge value={c.kyc_status} />
                    </td>
                    <td>
                      <Badge value={c.risk_level} />
                    </td>
                    <td>
                      <button
                        className="icon-link"
                        aria-label={`View ${c.full_name}`}
                        onClick={() => setParams({ customer: String(c.id) })}
                      >
                        <ArrowUpRight size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
        <Pagination page={page} total={filtered.length} size={10} onChange={setPage} />
      </section>
      {selected && (
        <Drawer
          title={selected.full_name}
          subtitle={selected.external_customer_id}
          onClose={() => setParams({})}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="avatar profile-avatar">{initials(selected.full_name)}</span>
            <Badge value={selected.risk_level} />
            <Badge value={selected.kyc_status} />
          </div>
          <dl className="detail-grid">
            <DetailField label="Customer type">{label(selected.customer_type)}</DetailField>
            <DetailField label="Country">{selected.country}</DetailField>
            <DetailField label="Created">{timestamp(selected.created_at)} UTC</DetailField>
            <DetailField label="Last updated">{timestamp(selected.updated_at)} UTC</DetailField>
          </dl>
          <div className="section-heading">
            <h3>Recent transactions</h3>
            <span className="count-label">{customerTransactions.length}</span>
          </div>
          {customerTransactions.slice(0, 5).map((t) => (
            <Link
              className="detail-list-link"
              to={`/app/transactions?transaction=${t.id}`}
              key={t.id}
            >
              <div>
                <strong>{t.counterparty_name}</strong>
                <small>
                  TXN-{t.id} · {t.currency}
                </small>
              </div>
              <span>{money(t.amount, t.currency)}</span>
              <ArrowUpRight size={15} />
            </Link>
          ))}
          {!customerTransactions.length && (
            <EmptyState
              title="No transactions yet"
              description="Customer activity will appear here."
            />
          )}
          <Link
            className="btn btn-secondary w-full mt-6"
            to={`/app/transactions?customer=${selected.id}`}
          >
            View all customer transactions <ArrowUpRight size={15} />
          </Link>
        </Drawer>
      )}
    </>
  )
}
