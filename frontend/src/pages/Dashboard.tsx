import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronRight,
  FileSearch,
  FolderOpen,
  Radar,
} from 'lucide-react'
import { useData } from '../app/DataContext'
import { DEMO_NOW } from '../data/seed'
import { isDemo } from '../services/client'
import { Badge, EmptyState, PageHeader, Panel } from '../components/ui'
import { MetricSparkline } from '../components/MetricSparkline'
import { ActivityChart } from '../components/ActivityChart'
import { TransactionTable } from '../components/TransactionTable'
import { initials } from '../lib/format'

export default function Dashboard() {
  const { data } = useData()
  const [days, setDays] = useState(7)
  if (!data) return null
  const endDate = isDemo ? DEMO_NOW : new Date().toISOString()
  const cutoff = new Date(endDate)
  cutoff.setUTCHours(0, 0, 0, 0)
  cutoff.setUTCDate(cutoff.getUTCDate() - days + 1)
  const transactions = data.transactions.filter((t) => new Date(t.occurred_at) >= cutoff)
  const highAlerts = data.alerts.filter((a) => a.severity === 'HIGH' && a.status !== 'RESOLVED')
  const openCases = data.cases.filter((c) => c.status !== 'CLOSED')
  const metrics = [
    {
      label: 'Total transactions',
      value: transactions.length,
      Icon: ArrowLeftRight,
      detail: `Across ${new Set(transactions.map((t) => t.customer_id)).size} customer profiles`,
      tone: 'neutral',
      to: 'transactions',
      dates: transactions.map((t) => t.occurred_at),
    },
    {
      label: 'High-risk alerts',
      value: highAlerts.length,
      Icon: Bell,
      detail: 'Require analyst attention',
      tone: 'orange',
      to: 'alerts',
      dates: highAlerts.map((a) => a.created_at),
    },
    {
      label: 'Open cases',
      value: openCases.length,
      Icon: FolderOpen,
      detail: `${data.cases.filter((c) => c.status === 'IN_REVIEW').length} currently in review`,
      tone: 'blue',
      to: 'cases',
      dates: openCases.map((c) => c.created_at),
    },
    {
      label: 'AI reports',
      value: data.investigations.length,
      Icon: FileSearch,
      detail: 'Evidence ready for review',
      tone: 'green',
      to: 'investigations',
      dates: data.investigations.map((r) => r.created_at),
    },
  ]
  const risk = ['LOW', 'MEDIUM', 'HIGH'].map((level) => ({
    level,
    count: transactions.filter((t) => t.risk_level === level).length,
  }))
  const assessed = risk.reduce((sum, r) => sum + r.count, 0)
  const lowPercent = assessed ? (risk[0].count / assessed) * 100 : 0
  const mediumPercent = assessed ? (risk[1].count / assessed) * 100 : 0
  return (
    <>
      <PageHeader
        eyebrow="YOUR OPERATIONS, IN FOCUS"
        title="Investigation overview"
        description="A clear view of risk. A confident next step."
      >
        <label className="date-filter">
          <CalendarDays size={15} />
          <select
            aria-label="Dashboard date range"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
          </select>
        </label>
        <Link className="btn btn-primary" to="/app/transactions">
          <FileSearch size={16} />
          New investigation
        </Link>
      </PageHeader>
      <div className="overview-status">
        <span className="flex items-center gap-2">
          <span className="status-dot" />
          {isDemo ? 'Demo environment' : 'API connected'}
          <span className="status-separator">/</span>
          <span className="muted">
            {isDemo ? 'Snapshot · 12 Sep 2026, 11:30 UTC' : 'Current workspace data'}
          </span>
        </span>
        <span className="muted hidden sm:block">Human judgment. AI-assisted.</span>
      </div>
      <div className="metrics-grid">
        {metrics.map(({ label, value, Icon, detail, tone, to, dates }, i) => (
          <Link
            to={`/app/${to}`}
            className={`metric metric-${tone}`}
            style={{ animationDelay: `${i * 45}ms` }}
            key={label}
          >
            <div className="metric-top">
              <span>{label}</span>
              <Icon size={18} />
            </div>
            <div className="metric-value">
              {value.toLocaleString()}
              <MetricSparkline dates={dates} endDate={endDate} days={days} />
            </div>
            <div className="metric-bottom">
              <span>{detail}</span>
              <ArrowUpRight size={14} />
            </div>
          </Link>
        ))}
      </div>
      <div className="dashboard-charts">
        <Panel
          title="Transaction activity"
          subtitle="Volume and risk signals over time"
          action={
            <div className="chart-legend">
              <span>
                <i className="legend-dot bg-slate-400" />
                All transactions
              </span>
              <span>
                <i className="legend-dot bg-orange-400" />
                High risk
              </span>
            </div>
          }
        >
          <ActivityChart transactions={transactions} days={days} endDate={endDate} />
        </Panel>
        <Panel title="Risk distribution" subtitle="Transaction risk assessment">
          <div className="risk-distribution">
            <div
              className="donut"
              role="img"
              aria-label={`${risk.map((r) => `${r.count} ${r.level.toLowerCase()} risk`).join(', ')}; ${transactions.length - assessed} unassessed`}
              style={{
                background: assessed
                  ? `conic-gradient(#63b79d 0% ${lowPercent}%, #d4ad69 ${lowPercent}% ${lowPercent + mediumPercent}%, #e58061 ${lowPercent + mediumPercent}% 100%)`
                  : '#34383d',
              }}
            >
              <div>
                <strong>{assessed}</strong>
                <span>assessed</span>
              </div>
            </div>
            <div className="risk-legend">
              {risk.map((r) => (
                <div key={r.level}>
                  <span>
                    <i className={`legend-dot risk-${r.level.toLowerCase()}`} />
                    {r.level === 'LOW' ? 'Low' : r.level === 'MEDIUM' ? 'Medium' : 'High'} risk
                  </span>
                  <strong>{r.count}</strong>
                  <small>{assessed ? Math.round((r.count / assessed) * 100) : 0}%</small>
                </div>
              ))}
              {transactions.length > assessed && (
                <p className="muted text-xs">{transactions.length - assessed} not assessed</p>
              )}
            </div>
          </div>
        </Panel>
      </div>
      <div className="dashboard-lower">
        <Panel
          title="Recent suspicious activity"
          subtitle="The signals that deserve a closer look"
          action={
            <Link className="text-link" to="/app/transactions?risk=HIGH">
              View all <ArrowUpRight size={14} />
            </Link>
          }
        >
          <TransactionTable
            transactions={transactions.filter((t) => t.risk_level === 'HIGH').slice(0, 4)}
            customers={data.customers}
            compact
          />
          <div className="panel-footnote">
            <Radar size={14} />
            Risk signals inform review. They do not determine an outcome.
          </div>
        </Panel>
        <Panel
          title="Investigation queue"
          action={<span className="count-label">{openCases.length} open</span>}
        >
          <div className="queue">
            {openCases.slice(0, 3).map((c) => (
              <Link to={`/app/cases?case=${c.id}`} key={c.id}>
                <div className="flex items-center justify-between">
                  <span className="mono muted">CASE-{c.id}</span>
                  <Badge value={c.priority} />
                </div>
                <h3>{c.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="queue-assignee">
                    <span className="tiny-avatar">{initials(c.assignee)}</span>
                    {c.assignee}
                  </span>
                  <ChevronRight size={15} className="muted" />
                </div>
              </Link>
            ))}
            {!openCases.length && (
              <EmptyState title="Queue is clear" description="New cases will appear here." />
            )}
          </div>
          <Link className="panel-bottom-link" to="/app/cases">
            Go to case workspace <ArrowRight size={15} />
          </Link>
        </Panel>
      </div>
      <div className="insight-strip">
        <div className="insight-icon">
          <FileSearch size={19} />
        </div>
        <div>
          <strong>Every signal has a story.</strong>
          <span>
            Connect customer context, transaction patterns, and evidence in one investigation.
          </span>
        </div>
        <Link className="text-link" to="/app/investigations">
          Explore AI reports <ArrowRight size={15} />
        </Link>
      </div>
    </>
  )
}
