import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowUpRight, Bell, Radar } from 'lucide-react'
import { useData } from '../app/DataContext'
import { useAuth } from '../app/AuthContext'
import { useAction } from '../hooks/useAction'
import { repository } from '../services/repository'
import { isDemo } from '../services/client'
import {
  Badge,
  Button,
  DetailField,
  EmptyState,
  Feedback,
  Filter,
  PageHeader,
  SearchInput,
} from '../components/ui'
import { Drawer } from '../components/Drawer'
import { label, timestamp } from '../lib/format'
import type { Alert, AlertStatus } from '../types'

function AlertDetail({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const { data, refresh } = useData()
  const { session } = useAuth()
  const action = useAction()
  const [status, setStatus] = useState<AlertStatus>(alert.status)
  return (
    <Drawer title={alert.rule_name} subtitle={`ALT-${alert.id}`} onClose={onClose}>
      <div className="flex gap-2 mb-5">
        <Badge value={alert.severity} />
        <Badge value={alert.status} />
      </div>
      <p className="detail-description">{alert.description}</p>
      <dl className="detail-grid mt-6">
        <DetailField label="Customer">
          <Link className="text-link" to={`/app/customers?customer=${alert.customer_id}`}>
            {data?.customers.find((c) => c.id === alert.customer_id)?.full_name}
            <ArrowUpRight size={13} />
          </Link>
        </DetailField>
        <DetailField label="Transaction">
          <Link className="text-link" to={`/app/transactions?transaction=${alert.transaction_id}`}>
            TXN-{alert.transaction_id}
            <ArrowUpRight size={13} />
          </Link>
        </DetailField>
        <DetailField label="Detected at">{timestamp(alert.created_at)} UTC</DetailField>
        <DetailField label="Detection method">Rule-based monitoring</DetailField>
      </dl>
      <div className="section-heading">
        <h3>Update alert status</h3>
      </div>
      <label className="form-field">
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value as AlertStatus)}>
          {(['NEW', 'IN_REVIEW', 'RESOLVED'] as const).map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      </label>
      <Button
        className="w-full mt-4"
        variant="primary"
        busy={action.pending}
        disabled={status === alert.status}
        onClick={() =>
          void action.run(async () => {
            await repository.updateAlert(alert.id, status, session!.user.full_name)
            await refresh()
          }, 'Alert status updated. An audit entry has been recorded.')
        }
      >
        Save status
      </Button>
      <Feedback error={action.error} success={action.success} />
      <div className="detail-note">
        <Radar size={17} />
        Review the linked transaction and customer context before resolving a signal.
      </div>
    </Drawer>
  )
}
export default function Alerts() {
  const { data } = useData()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  if (!data) return null
  const alerts = data.alerts.filter(
    (a) =>
      `${a.id} ${a.rule_name} ${data.customers.find((c) => c.id === a.customer_id)?.full_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (severity === 'ALL' || a.severity === severity) &&
      (status === 'ALL' || a.status === status),
  )
  const selected = data.alerts.find((a) => a.id === Number(params.get('alert')))
  return (
    <>
      <PageHeader
        eyebrow="SIGNALS THAT MATTER"
        title="Alerts"
        description="Prioritize the unusual. Investigate what matters."
      >
        <span className="count-label">
          <Bell size={14} />
          {data.alerts.filter((a) => a.status === 'NEW').length} awaiting review
        </span>
      </PageHeader>
      {!isDemo && (
        <div className="ai-notice">
          The alerts API is planned. Alert workflows are available in demo mode.
        </div>
      )}
      <div className="summary-strip">
        <span>
          <i className="legend-dot risk-high" />
          {data.alerts.filter((a) => a.severity === 'HIGH' && a.status !== 'RESOLVED').length}{' '}
          high-risk unresolved
        </span>
        <span>
          <i className="legend-dot risk-medium" />
          {data.alerts.filter((a) => a.status === 'IN_REVIEW').length} in review
        </span>
        <span>
          <i className="legend-dot risk-low" />
          {data.alerts.filter((a) => a.status === 'RESOLVED').length} resolved
        </span>
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search rules, customers, or alert IDs…"
          />
          <div className="flex flex-wrap gap-2">
            <Filter
              label="Severities"
              value={severity}
              onChange={setSeverity}
              options={['HIGH', 'MEDIUM', 'LOW']}
            />
            <Filter
              label="Statuses"
              value={status}
              onChange={setStatus}
              options={['NEW', 'IN_REVIEW', 'RESOLVED']}
            />
          </div>
        </div>
        {alerts.length ? (
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Risk alerts</caption>
              <thead>
                <tr>
                  <th>Alert / Rule</th>
                  <th>Customer</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Detected · UTC</th>
                  <th>
                    <span className="sr-only">Review alert</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="entity-cell">
                        <span className={`alert-icon alert-${a.severity.toLowerCase()}`}>
                          <Radar size={18} />
                        </span>
                        <div>
                          <button
                            className="table-primary"
                            onClick={() => setParams({ alert: String(a.id) })}
                          >
                            {a.rule_name}
                          </button>
                          <small>
                            ALT-{a.id} · TXN-{a.transaction_id}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Link
                        className="table-primary"
                        to={`/app/customers?customer=${a.customer_id}`}
                      >
                        {data.customers.find((c) => c.id === a.customer_id)?.full_name}
                      </Link>
                    </td>
                    <td>
                      <Badge value={a.severity} />
                    </td>
                    <td>
                      <Badge value={a.status} />
                    </td>
                    <td className="muted">{timestamp(a.created_at)}</td>
                    <td>
                      <button
                        className="icon-link"
                        aria-label={`Review alert ${a.id}`}
                        onClick={() => setParams({ alert: String(a.id) })}
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
          <EmptyState
            title="No alerts to show"
            description="Adjust your filters or return when new activity is detected."
          />
        )}
        <div className="panel-footnote">
          {alerts.length} alerts · Status updates are recorded in the audit log.
        </div>
      </section>
      {selected && <AlertDetail key={selected.id} alert={selected} onClose={() => setParams({})} />}
    </>
  )
}
