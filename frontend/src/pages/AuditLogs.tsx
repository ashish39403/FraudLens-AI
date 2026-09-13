import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, FileClock, ShieldCheck } from 'lucide-react'
import { useData } from '../app/DataContext'
import { isDemo } from '../services/client'
import { EmptyState, Filter, PageHeader, Pagination, SearchInput } from '../components/ui'
import { initials, timestamp } from '../lib/format'

function resourceLink(resource: string) {
  const [kind, id] = resource.split('-')
  return kind === 'CASE'
    ? `/app/cases?case=${id}`
    : kind === 'RPT'
      ? `/app/investigations?report=${id}`
      : kind === 'ALT'
        ? `/app/alerts?alert=${id}`
        : null
}
export default function AuditLogs() {
  const { data } = useData()
  const [search, setSearch] = useState('')
  const [actor, setActor] = useState('ALL')
  const [page, setPage] = useState(1)
  if (!data) return null
  const logs = data.auditLogs.filter(
    (log) =>
      `${log.actor} ${log.action} ${log.resource}`.toLowerCase().includes(search.toLowerCase()) &&
      (actor === 'ALL' || log.actor === actor),
  )
  return (
    <>
      <PageHeader
        eyebrow="ACCOUNTABILITY AT EVERY STEP"
        title="Audit logs"
        description="A chronological record of actions across your workspace."
      >
        <span className="count-label">
          <FileClock size={14} />
          {data.auditLogs.length} events
        </span>
      </PageHeader>
      <div className="ai-notice">
        <ShieldCheck size={16} />
        {isDemo
          ? 'Demo activity history is stored locally in your browser. Production audit storage will be enforced by the backend.'
          : 'The audit log API is planned. No server audit history is available yet.'}
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            placeholder="Search actors, actions, or resources…"
          />
          <Filter
            label="Actors"
            value={actor}
            onChange={(v) => {
              setActor(v)
              setPage(1)
            }}
            options={[...new Set(data.auditLogs.map((log) => log.actor))]}
          />
        </div>
        {logs.length ? (
          <ol className="audit-timeline">
            {logs.slice((page - 1) * 12, page * 12).map((log) => {
              const to = resourceLink(log.resource)
              return (
                <li key={log.id}>
                  <span className="avatar entity-avatar">{initials(log.actor)}</span>
                  <div className="audit-main">
                    <div>
                      <strong>{log.actor}</strong>
                      <span className="muted">{log.action}</span>
                    </div>
                    {to ? (
                      <Link className="resource-pill" to={to}>
                        {log.resource}
                        <ArrowUpRight size={12} />
                      </Link>
                    ) : (
                      <span className="resource-pill">{log.resource}</span>
                    )}
                  </div>
                  <time dateTime={log.created_at}>
                    {timestamp(log.created_at)}
                    <small>UTC</small>
                  </time>
                </li>
              )
            })}
          </ol>
        ) : (
          <EmptyState
            title="No activity found"
            description="Matching workspace actions will appear in this timeline."
          />
        )}
        <Pagination page={page} total={logs.length} size={12} onChange={setPage} />
      </section>
    </>
  )
}
