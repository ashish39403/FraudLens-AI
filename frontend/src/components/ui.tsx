import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Inbox,
  LoaderCircle,
  Search,
  ShieldCheck,
} from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { label } from '../lib/format'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <span className="brand-mark">
        <ShieldCheck size={23} strokeWidth={2} />
      </span>
      {!compact && (
        <span>
          FraudLens<span className="brand-ai">AI</span>
        </span>
      )}
    </span>
  )
}
export function Button({
  children,
  className = '',
  variant = 'secondary',
  busy,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  busy?: boolean
}) {
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {busy && <LoaderCircle size={16} className="spin" />}
      {children}
    </button>
  )
}
export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge badge-${value.toLowerCase()}`}>
      <span className="badge-dot" />
      {label(value)}
    </span>
  )
}
export function Direction({ value }: { value: string }) {
  return (
    <span className="direction">
      {value === 'INBOUND' ? (
        <ArrowDownLeft size={15} className="text-emerald-400" />
      ) : (
        <ArrowUpRight size={15} className="text-slate-400" />
      )}
      {label(value)}
    </span>
  )
}
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  )
}
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted text-xs mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="search-field">
      <Search size={16} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="search"
      />
    </div>
  )
}
export function Filter({
  label: name,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="filter">
      <span className="sr-only">{name}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="ALL">All {name.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label(option)}
          </option>
        ))}
      </select>
    </label>
  )
}
export function EmptyState({
  title = 'No results found',
  description = 'Try another search or adjust your filters.',
  children,
}: {
  title?: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="empty-state">
      <Inbox size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  )
}
export function Feedback({ error, success }: { error?: string; success?: string }) {
  return (
    <>
      {error && (
        <p role="alert" className="feedback error">
          <CircleAlert size={16} />
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="feedback success">
          <CheckCircle2 size={16} />
          {success}
        </p>
      )}
    </>
  )
}
export function LoadingState() {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" size={22} />
      <p>Loading your workspace…</p>
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  )
}
export function Pagination({
  page,
  total,
  size,
  onChange,
}: {
  page: number
  total: number
  size: number
  onChange: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / size))
  return (
    <div className="pagination">
      <span>
        {total
          ? `${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total} results`
          : '0 results'}
      </span>
      <div className="flex items-center gap-2">
        <Button aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={15} />
        </Button>
        <span>
          {page} / {pages}
        </span>
        <Button aria-label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  )
}
export function DetailField({ label: name, children }: { label: string; children: ReactNode }) {
  return (
    <div className="detail-field">
      <dt>{name}</dt>
      <dd>{children}</dd>
    </div>
  )
}
