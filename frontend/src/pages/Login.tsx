import { PasswordField } from '../components/auth/PasswordField'
import { authDestination } from '../lib/auth'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from '../app/AuthContext'
import { useAction } from '../hooks/useAction'
import { isDemo } from '../services/client'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../data/seed'
import { Button, Feedback } from '../components/ui'

export default function Login() {
  const { session, login } = useAuth()
  const action = useAction()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(
    typeof location.state?.registeredEmail === 'string' ? location.state.registeredEmail : '',
  )
  const [password, setPassword] = useState('')
  useEffect(() => {
    document.title = 'Sign in · FraudLens AI'
  }, [])
  const destination = authDestination(location.state)
  if (session) return <Navigate to={destination} replace />
  return (
    <div className="login-form-wrap">
      <span className="auth-icon">
        <LockKeyhole size={23} />
      </span>
      <p className="eyebrow mt-6">ANALYST WORKSPACE</p>
      <h2 tabIndex={-1}>Welcome back.</h2>
      <p className="muted">Sign in to bring the full picture into focus.</p>
      <Feedback
        success={
          location.state?.registrationSuccess ? 'Account created. Sign in to continue.' : undefined
        }
      />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void action.run(async () => {
            await login(email, password)
            navigate(destination, { replace: true })
          })
        }}
        className="auth-form"
      >
        <label className="form-field">
          Work email
          <input
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={action.pending}
          />
        </label>
        <PasswordField value={password} onChange={setPassword} disabled={action.pending} />
        <Feedback error={action.error} />
        <Button type="submit" variant="primary" className="w-full" busy={action.pending}>
          {action.pending ? 'Signing in…' : 'Sign in to workspace'}
          {!action.pending && <ArrowRight size={16} />}
        </Button>
      </form>
      <p className="auth-account-link">
        New to FraudLens?{' '}
        <Link to="/signup" state={{ from: destination }}>
          Create an account
        </Link>
      </p>
      {isDemo && (
        <div className="demo-credentials">
          <div className="flex justify-between items-center">
            <strong>Take a look around.</strong>
            <span className="environment-label">DEMO ACCESS</span>
          </div>
          <p>Explore the workspace with these demo credentials.</p>
          <dl>
            <dt>Email</dt>
            <dd>{DEMO_EMAIL}</dd>
            <dt>Password</dt>
            <dd>{DEMO_PASSWORD}</dd>
          </dl>
          <Button
            variant="ghost"
            onClick={() => {
              setEmail(DEMO_EMAIL)
              setPassword(DEMO_PASSWORD)
            }}
          >
            Use demo credentials <ArrowRight size={14} />
          </Button>
        </div>
      )}
      <p className="login-footnote">
        <ShieldCheck size={14} />
        {isDemo
          ? 'A safe demo environment. All financial data is synthetic.'
          : 'Use your organization-provided account to sign in.'}
      </p>
    </div>
  )
}
