import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, FileSearch, Users, ArrowLeftRight } from 'lucide-react'
import { useData } from '../app/DataContext'
import { Drawer } from './Drawer'
import { EmptyState, SearchInput } from './ui'

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const { data } = useData()
  const all = [
    ...(data?.customers.map((c) => ({
      title: c.full_name,
      detail: c.external_customer_id,
      url: `/app/customers?customer=${c.id}`,
      Icon: Users,
    })) ?? []),
    ...(data?.transactions.map((t) => ({
      title: `TXN-${t.id}`,
      detail: t.counterparty_name,
      url: `/app/transactions?transaction=${t.id}`,
      Icon: ArrowLeftRight,
    })) ?? []),
    ...(data?.investigations.map((r) => ({
      title: `RPT-${r.id}`,
      detail: r.summary,
      url: `/app/investigations?report=${r.id}`,
      Icon: FileSearch,
    })) ?? []),
  ]
  const results = query.trim()
    ? all
        .filter((r) => `${r.title} ${r.detail}`.toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 12)
    : []
  return (
    <Drawer title="Search your workspace" subtitle="FIND THE CONNECTION" onClose={onClose}>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search customers, transactions, reports…"
      />
      <div className="search-results">
        {results.map((r) => (
          <Link key={r.url} to={r.url} onClick={onClose}>
            <r.Icon size={18} />
            <div>
              <strong>{r.title}</strong>
              <p>{r.detail}</p>
            </div>
            <ArrowUpRight size={15} />
          </Link>
        ))}
      </div>
      {!results.length && (
        <EmptyState
          title={query ? 'No matching records' : 'Every investigation starts somewhere'}
          description={
            query
              ? 'Try a customer name, transaction ID, or report keyword.'
              : 'Search names, counterparties, or record IDs across your workspace.'
          }
        />
      )}
    </Drawer>
  )
}
