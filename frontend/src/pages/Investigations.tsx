import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  FileSearch,
  FolderPlus,
  ShieldCheck,
} from 'lucide-react'
import { useData } from '../app/DataContext'
import { useAuth } from '../app/AuthContext'
import { useAction } from '../hooks/useAction'
import { repository } from '../services/repository'
import { isDemo } from '../services/client'
import {
  Badge,
  Button,
  EmptyState,
  Feedback,
  Filter,
  PageHeader,
  SearchInput,
} from '../components/ui'
import { label, timestamp } from '../lib/format'
import type { Investigation } from '../types'

function ReportDetail({ report }: { report: Investigation }) {
  const { data, refresh } = useData()
  const { session } = useAuth()
  const action = useAction()
  const navigate = useNavigate()
  const customer = data?.customers.find((c) => c.id === report.customer_id)
  const existing = data?.cases.find((c) => c.report_id === report.id)
  return (
    <article className="report-detail">
      <header className="report-header">
        <div className="flex items-center justify-between mb-4">
          <span className="eyebrow">INVESTIGATION REPORT</span>
          <Badge value={report.risk_level} />
        </div>
        <h2>{customer?.full_name ?? `Customer ${report.customer_id}`}</h2>
        <div className="report-meta">
          <span className="mono">RPT-{report.id}</span>
          <span>·</span>
          <Link to={`/app/transactions?transaction=${report.transaction_id}`}>
            TXN-{report.transaction_id}
            <ArrowUpRight size={12} />
          </Link>
          <span>·</span>
          <span>{timestamp(report.created_at)} UTC</span>
        </div>
      </header>
      <div className="report-score-row">
        <div>
          <span className={`risk-score score-${report.risk_level.toLowerCase()}`}>
            {report.risk_score}
            <small>/100</small>
          </span>
          <p>Risk score</p>
        </div>
        <div>
          <strong>{label(report.confidence)}</strong>
          <p>Model confidence</p>
        </div>
        <div>
          <span className="review-label">
            <ShieldCheck size={15} />
            Analyst review
          </span>
          <p>Required before action</p>
        </div>
      </div>
      <section className="report-section">
        <h3>
          <FileSearch size={17} />
          Investigation summary
        </h3>
        <p>{report.summary}</p>
      </section>
      <section className="report-section">
        <h3>
          <Check size={17} />
          Supporting evidence<span className="count-label">{report.evidence.length}</span>
        </h3>
        <ol className="numbered-evidence">
          {report.evidence.map((e, i) => (
            <li key={e}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {e}
            </li>
          ))}
        </ol>
      </section>
      {report.suspicious_patterns.length > 0 && (
        <section className="report-section">
          <h3>Identified patterns</h3>
          <div className="flex flex-wrap gap-2">
            {report.suspicious_patterns.map((p) => (
              <span className="signal-chip" key={p}>
                {p}
              </span>
            ))}
          </div>
        </section>
      )}
      <section className="recommendation">
        <p className="eyebrow">RECOMMENDED NEXT STEP</p>
        <p>{report.recommended_action}</p>
        <Button
          variant="primary"
          busy={action.pending}
          onClick={() =>
            void action.run(async () => {
              const id = await repository.createCase(report.id, session!.user.full_name)
              await refresh()
              navigate(`/app/cases?case=${id}`)
            })
          }
        >
          <FolderPlus size={16} />
          {existing ? 'View linked case' : 'Open investigation case'}
          <ArrowUpRight size={15} />
        </Button>
        <Feedback error={action.error} />
      </section>
      <section className="report-section">
        <h3>
          <CircleAlert size={17} />
          Data gaps & contradictions
        </h3>
        <div className="gaps-grid">
          <div>
            <h4>Missing context</h4>
            <ul>
              {report.data_gaps?.length ? (
                report.data_gaps.map((g) => <li key={g}>{g}</li>)
              ) : (
                <li>Data gaps were not supplied by this report endpoint.</li>
              )}
            </ul>
          </div>
          <div>
            <h4>Consider before deciding</h4>
            <ul>
              {report.edge_cases_or_contradictions?.length ? (
                report.edge_cases_or_contradictions.map((g) => <li key={g}>{g}</li>)
              ) : (
                <li>No contradictions were supplied by this report endpoint.</li>
              )}
            </ul>
          </div>
        </div>
      </section>
      <footer className="report-footer">
        {report.model_name} <span>·</span> Prompt {report.prompt_version}
        <p>
          {isDemo ? 'This is a simulated report for demonstration. ' : ''}AI supports the
          investigation; the analyst owns the decision.
        </p>
      </footer>
    </article>
  )
}
export default function Investigations() {
  const { data } = useData()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [risk, setRisk] = useState('ALL')
  if (!data) return null
  const reports = data.investigations.filter(
    (r) =>
      `${r.id} ${r.summary} ${data.customers.find((c) => c.id === r.customer_id)?.full_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (risk === 'ALL' || r.risk_level === risk),
  )
  const selected = reports.find((r) => r.id === Number(params.get('report'))) ?? reports[0]
  return (
    <>
      <PageHeader
        eyebrow="EVIDENCE, NOT GUESSWORK"
        title="AI Investigations"
        description="Turn individual signals into a story you can investigate."
      >
        <Link className="btn btn-primary" to="/app/transactions">
          <FileSearch size={16} />
          New investigation
        </Link>
      </PageHeader>
      <div className="ai-notice">
        <ShieldCheck size={16} />
        <span>
          {isDemo
            ? 'Demo reports use simulated analysis.'
            : 'Generated reports are loaded from the backend and can be linked to case records.'}{' '}
          All findings require human review.
        </span>
      </div>
      <div className="investigation-layout">
        <aside className="report-list panel">
          <div className="p-4 border-b border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <h2>Reports</h2>
              <span className="count-label">{data.investigations.length}</span>
            </div>
            <SearchInput value={search} onChange={setSearch} placeholder="Search reports…" />
            <Filter
              label="Risk levels"
              value={risk}
              onChange={setRisk}
              options={['LOW', 'MEDIUM', 'HIGH']}
            />
          </div>
          {reports.map((r) => (
            <button
              key={r.id}
              className={`report-list-item ${selected?.id === r.id ? 'selected' : ''}`}
              onClick={() => setParams({ report: String(r.id) })}
            >
              <div className="flex items-center justify-between">
                <span className="mono muted">RPT-{r.id}</span>
                <Badge value={r.risk_level} />
              </div>
              <h3>{data.customers.find((c) => c.id === r.customer_id)?.full_name}</h3>
              <p>{r.summary}</p>
              <div className="flex items-center justify-between mt-3">
                <small>{timestamp(r.created_at)}</small>
                <span className="flex items-center gap-2">
                  {r.risk_score}
                  <span className="muted">/100</span>
                  <ChevronRight size={14} />
                </span>
              </div>
            </button>
          ))}
          {!reports.length && (
            <EmptyState
              title="No reports found"
              description="Run an investigation from a transaction or adjust your filters."
            />
          )}
        </aside>
        <div className="panel min-w-0">
          {selected ? (
            <ReportDetail key={selected.id} report={selected} />
          ) : (
            <EmptyState
              title="Your next insight starts with a transaction"
              description="Select a transaction and run an AI investigation to review its evidence."
            >
              <Link className="btn btn-secondary" to="/app/transactions">
                Browse transactions <ArrowUpRight size={16} />
              </Link>
            </EmptyState>
          )}
        </div>
      </div>
    </>
  )
}
