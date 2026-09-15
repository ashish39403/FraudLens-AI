import { lazy, Suspense, Component, type ErrorInfo, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import { AuthProvider, useAuth } from './AuthContext'
import { DataProvider } from './DataContext'
import { AppShell } from '../components/AppShell'
import { Brand, Button, LoadingState } from '../components/ui'
import { AuthLayout } from '../components/auth/AuthLayout'

const Landing = lazy(() => import('../pages/Landing'))
const Login = lazy(() => import('../pages/Login'))
const Signup = lazy(() => import('../pages/Signup'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Customers = lazy(() => import('../pages/Customers'))
const Transactions = lazy(() => import('../pages/Transactions'))
const Investigations = lazy(() => import('../pages/Investigations'))
const Alerts = lazy(() => import('../pages/Alerts'))
const Cases = lazy(() => import('../pages/Cases'))
const AuditLogs = lazy(() => import('../pages/AuditLogs'))

function ProtectedRoute() {
  const { session } = useAuth()
  const location = useLocation()
  return session ? (
    <DataProvider>
      <Outlet />
    </DataProvider>
  ) : (
    <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  )
}
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Workspace rendering failed', error, info.componentStack)
  }
  render() {
    return this.state.failed ? (
      <div className="standalone-state">
        <Brand />
        <h1>The workspace hit a problem.</h1>
        <p>Your saved demo data is still in this browser. Reload to try again.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload workspace
        </Button>
      </div>
    ) : (
      this.props.children
    )
  }
}
function NotFound() {
  return (
    <div className="standalone-state">
      <Brand />
      <p className="eyebrow">404 · OUTSIDE THE PICTURE</p>
      <h1>This page isn't here.</h1>
      <p>The link may be outdated. Head back to your workspace.</p>
      <Link className="btn btn-primary" to="/app/dashboard">
        Back to overview
      </Link>
    </div>
  )
}
export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingState />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppShell />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="investigations" element={<Investigations />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="cases" element={<Cases />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
