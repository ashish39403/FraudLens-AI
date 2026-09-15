import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import {
  Activity,
  ArrowLeftRight,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileClock,
  FileSearch,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../app/AuthContext'
import { useData } from '../app/DataContext'
import { isDemo } from '../services/client'
import { Brand, Button, Feedback, LoadingState } from './ui'
import { GlobalSearch } from './GlobalSearch'
import { Drawer } from './Drawer'

const navigation = [
  { path: 'dashboard', label: 'Overview', Icon: LayoutDashboard },
  { path: 'customers', label: 'Customers', Icon: Users },
  { path: 'transactions', label: 'Transactions', Icon: ArrowLeftRight },
  { path: 'investigations', label: 'AI Investigations', Icon: FileSearch },
  { path: 'alerts', label: 'Alerts', Icon: Bell },
  { path: 'cases', label: 'Cases', Icon: FolderOpen },
  { path: 'audit-logs', label: 'Audit logs', Icon: FileClock },
]
export function AppShell() {
  const location = useLocation()
  const { session, logout } = useAuth()
  const { data, loading, error, refresh } = useData()
  const [searchOpen, setSearchOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const mobileMenu = useRef<HTMLDialogElement>(null)
  const current = navigation.find((n) => location.pathname.includes(n.path))?.label ?? 'Workspace'
  const alertCount = data?.alerts.filter((a) => a.status === 'OPEN').length ?? 0
  useEffect(() => {
    document.title = `${current} · FraudLens AI`
    window.scrollTo(0, 0)
  }, [current])
  const nav = (
    <>
      <div className="workspace-switch">
        <span className="workspace-avatar">F</span>
        <div>
          <strong>Fraud operations</strong>
          <small>Analyst workspace</small>
        </div>
        <ChevronDown size={14} />
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {navigation.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={`/app/${path}`}
            onClick={() => mobileMenu.current?.close()}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {path === 'alerts' && alertCount > 0 && <span className="nav-count">{alertCount}</span>}
            {path === 'investigations' && <span className="ai-tag">AI</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="workspace-status">
          <span className="status-dot" />
          <span>{isDemo ? 'Demo workspace' : 'API workspace'}</span>
          <span className="text-[10px] muted">v1.0</span>
        </div>
        <button
          className="nav-item"
          onClick={() => {
            mobileMenu.current?.close()
            setHelpOpen(true)
          }}
        >
          <CircleHelp size={18} />
          Help & resources
          <ArrowLeftRight size={12} className="ml-auto" />
        </button>
        <div className="user-profile">
          <span className="avatar">AM</span>
          <div>
            <strong>{session?.user.full_name}</strong>
            <small>{session?.user.role.toLowerCase()}</small>
          </div>
          <Button variant="ghost" aria-label="Sign out" onClick={logout}>
            <LogOut size={17} />
          </Button>
        </div>
      </div>
    </>
  )
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand" aria-label="FraudLens AI home">
          <Brand />
        </Link>
        {nav}
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <Button
              className="mobile-menu-button"
              variant="ghost"
              aria-label="Open navigation"
              onClick={() => mobileMenu.current?.showModal()}
            >
              <Menu size={21} />
            </Button>
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={13} className="muted" />
            <span>{current}</span>
          </div>
          <div className="topbar-actions">
            <button
              className="global-search"
              aria-label="Search workspace"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
              <span>Search anything…</span>
              <span className="search-shortcut">Search</span>
            </button>
            <span className="environment-label">{isDemo ? 'DEMO' : 'LIVE API'}</span>
            <Link
              className="notification-button"
              to="/app/alerts"
              aria-label={`${alertCount} new alerts`}
            >
              <Bell size={19} />
              {alertCount > 0 && <span />}
            </Link>
            <span className="avatar avatar-small" aria-label={session?.user.full_name}>
              AM
            </span>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div key={location.pathname} className="page-enter">
            {loading ? (
              <LoadingState />
            ) : !data ? (
              <div className="panel p-8">
                <Feedback error={error} />
                <Button onClick={() => void refresh().catch(() => {})}>
                  Retry loading workspace
                </Button>
              </div>
            ) : (
              <>
                {error && <Feedback error={error} />}
                <Outlet />
              </>
            )}
          </div>
          <footer className="app-footer">
            <span>
              <ShieldCheck size={13} />
              {isDemo
                ? 'Synthetic data. Real investigation workflows.'
                : 'Analyst workspace · Connected to API'}
            </span>
            <span>
              FraudLens AI <span className="muted">/</span> Intelligence with context.
            </span>
          </footer>
        </main>
      </div>
      <dialog ref={mobileMenu} className="mobile-navigation" aria-label="Navigation">
        <div className="flex items-center justify-between mb-5">
          <Brand />
          <Button
            aria-label="Close navigation"
            variant="ghost"
            onClick={() => mobileMenu.current?.close()}
          >
            <X size={20} />
          </Button>
        </div>
        {nav}
      </dialog>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
      {helpOpen && (
        <Drawer
          title="Built for a considered decision"
          subtitle="WORKSPACE GUIDE"
          onClose={() => setHelpOpen(false)}
        >
          <div className="help-content">
            <Activity className="text-orange-300" size={28} />
            <h3>Your investigation workflow</h3>
            <p>
              Start with an alert or a transaction. Review the customer context, run an AI
              investigation, then open a case to record evidence and a human decision.
            </p>
            <h3>About this demo</h3>
            <p>
              All records are synthetic. Reports use simulated analysis, not a live AI model.
              Changes are saved in this browser; audit entries demonstrate the workflow and are not
              a compliance-grade record.
            </p>
            <h3>API integration</h3>
            <p>
              The service layer connects to the FastAPI authentication, customer, transaction,
              alert, case, and AI investigation endpoints. Audit logs are still local-only.
            </p>
            <Link className="text-link" to="/" onClick={() => setHelpOpen(false)}>
              Explore FraudLens AI <ChevronRight size={15} />
            </Link>
          </div>
        </Drawer>
      )}
    </div>
  )
}
