import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  ArrowUpRight,
  FileSearch,
  FolderOpen,
  LayoutGrid,
  List,
  MessageSquare,
  Send,
} from 'lucide-react'
import { useData } from '../app/DataContext'
import { useAuth } from '../app/AuthContext'
import { useAction } from '../hooks/useAction'
import { repository } from '../services/repository'
import { Badge, Button, EmptyState, Feedback, PageHeader, SearchInput } from '../components/ui'
import { Drawer } from '../components/Drawer'
import { initials, label, timestamp } from '../lib/format'
import type { Case, CaseStatus } from '../types'

const statuses: CaseStatus[] = ['OPEN', 'IN_REVIEW', 'ESCALATED', 'CLOSED']
function CaseDetail({ item, onClose }: { item: Case; onClose: () => void }) {
  const { session } = useAuth()
  const { refresh } = useData()
  const action = useAction()
  const [note, setNote] = useState('')
  const [status, setStatus] = useState(item.status)
  return (
    <Drawer title={item.title} subtitle={`CASE-${item.id}`} onClose={onClose}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Badge value={item.priority} />
        <Badge value={item.status} />
        <span className="muted text-sm">Assigned to {item.assignee}</span>
      </div>
      <Link className="linked-report" to={`/app/investigations?report=${item.report_id}`}>
        <FileSearch size={21} />
        <div>
          <strong>AI investigation report</strong>
          <small>RPT-{item.report_id} · View supporting evidence</small>
        </div>
        <ArrowUpRight size={17} />
      </Link>
      <Link className="text-link mt-4" to={`/app/customers?customer=${item.customer_id}`}>
        View customer profile <ArrowUpRight size={14} />
      </Link>
      <div className="section-heading">
        <h3>Case status</h3>
      </div>
      <div className="flex gap-3">
        <label className="form-field flex-1">
          <span className="sr-only">Case status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as CaseStatus)}>
            {statuses.map((s) => (
              <option value={s} key={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </label>
        <Button
          busy={action.pending}
          disabled={status === item.status}
          onClick={() =>
            void action.run(async () => {
              await repository.updateCase(item.id, status, session!.user.full_name)
              await refresh()
            }, 'Case status updated.')
          }
        >
          Update
        </Button>
      </div>
      <div className="section-heading">
        <h3>Notes & evidence timeline</h3>
        <span className="count-label">{item.notes.length}</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void action.run(async () => {
            await repository.addNote(item.id, note, session!.user.full_name)
            setNote('')
            await refresh()
          }, 'Note added to the case timeline.')
        }}
      >
        <label className="form-field">
          <span className="sr-only">Case note</span>
          <textarea
            aria-label="Case note"
            placeholder="Document a finding, evidence, or decision rationale…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={4000}
            rows={4}
            required
          />
        </label>
        <div className="flex items-center justify-between mt-3">
          <small className="muted">{note.length}/4,000 characters</small>
          <Button type="submit" variant="primary" busy={action.pending} disabled={!note.trim()}>
            <Send size={14} />
            Add note
          </Button>
        </div>
      </form>
      <Feedback error={action.error} success={action.success} />
      <ol className="notes-timeline">
        {item.notes.map((n) => (
          <li key={n.id}>
            <span className="timeline-dot">
              <MessageSquare size={13} />
            </span>
            <div>
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{n.actor}</strong>
                <time>{timestamp(n.created_at)} UTC</time>
              </div>
              <p>{n.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Drawer>
  )
}
export default function Cases() {
  const { data } = useData()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'board' | 'list'>('board')
  if (!data) return null
  const cases = data.cases.filter((c) =>
    `${c.id} ${c.title} ${c.assignee} ${data.customers.find((customer) => customer.id === c.customer_id)?.full_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  const selected = data.cases.find((c) => c.id === Number(params.get('case')))
  const open = (id: number) => setParams({ case: String(id) })
  return (
    <>
      <PageHeader
        eyebrow="FROM INSIGHT TO OUTCOME"
        title="Case workspace"
        description="Build the evidence. Document the decision. Close the loop."
      >
        <Link className="btn btn-primary" to="/app/investigations">
          <FolderOpen size={16} />
          Create case from report
        </Link>
      </PageHeader>
      <div className="case-toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search cases, customers, or assignees…"
        />
        <div className="segmented" aria-label="Case view">
          <button aria-pressed={view === 'board'} onClick={() => setView('board')}>
            <LayoutGrid size={15} />
            Board
          </button>
          <button aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <List size={15} />
            List
          </button>
        </div>
      </div>
      {view === 'board' ? (
        <div className="case-board">
          {statuses.map((status) => (
            <section className="case-column" key={status}>
              <div className="case-column-header">
                <span>
                  <i className={`legend-dot status-${status.toLowerCase()}`} />
                  {label(status)}
                </span>
                <span className="count-label">
                  {cases.filter((c) => c.status === status).length}
                </span>
              </div>
              {cases
                .filter((c) => c.status === status)
                .map((c) => (
                  <button className="case-card" key={c.id} onClick={() => open(c.id)}>
                    <div className="flex justify-between items-center">
                      <span className="mono muted">CASE-{c.id}</span>
                      <ArrowUpRight size={15} className="muted" />
                    </div>
                    <h3>{c.title}</h3>
                    <p>
                      {data.customers.find((customer) => customer.id === c.customer_id)?.full_name}
                    </p>
                    <Badge value={c.priority} />
                    <div className="case-card-footer">
                      <span className="queue-assignee">
                        <span className="tiny-avatar">{initials(c.assignee)}</span>
                        {c.assignee.split(' ')[0]}
                      </span>
                      <span>
                        <MessageSquare size={13} />
                        {c.notes.length}
                      </span>
                    </div>
                  </button>
                ))}
              {!cases.some((c) => c.status === status) && (
                <div className="column-empty">No {label(status).toLowerCase()} cases</div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <section className="panel">
          {cases.length ? (
            <div className="table-scroll">
              <table>
                <caption className="sr-only">Investigation cases</caption>
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <button className="table-primary" onClick={() => open(c.id)}>
                          {c.title}
                        </button>
                        <small>CASE-{c.id}</small>
                      </td>
                      <td>
                        <Badge value={c.priority} />
                      </td>
                      <td>
                        <Badge value={c.status} />
                      </td>
                      <td>{c.assignee}</td>
                      <td>
                        {c.report_id ? (
                          <Link
                            className="text-link"
                            to={`/app/investigations?report=${c.report_id}`}
                          >
                            RPT-{c.report_id}
                            <ArrowUpRight size={13} />
                          </Link>
                        ) : (
                          <span className="muted">No report linked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      )}
      <div className="case-guidance">
        <ShieldNote />
        Cases are created from investigation reports, keeping the evidence connected from the start.
      </div>
      {selected && <CaseDetail key={selected.id} item={selected} onClose={() => setParams({})} />}
    </>
  )
}
function ShieldNote() {
  return <FileSearch size={15} />
}
