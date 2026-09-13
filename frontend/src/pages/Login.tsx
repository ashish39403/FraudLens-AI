import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from '../app/AuthContext'
import { useAction } from '../hooks/useAction'
import { isDemo } from '../services/client'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../data/seed'
import { Brand, Button, Feedback } from '../components/ui'

export default function Login() {
  const { session, login } = useAuth()
  const action = useAction()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  useEffect(() => {
    document.title = 'Sign in · FraudLens AI'
  }, [])
  const destination =
    typeof location.state?.from === 'string' && location.state.from.startsWith('/app/')
      ? location.state.from
      : '/app/dashboard'
  if (session) return <Navigate to={destination} replace />
  return (
    <div className="login-page">
      <aside className="login-story">
        <Link to="/" aria-label="FraudLens AI home">
          <Brand />
        </Link>
        <div>
          <p className="eyebrow">THE FULL PICTURE STARTS HERE</p>
          <h1>
            Every transaction
            <br />
            has a story.
            <br />
            <span>Find the context.</span>
          </h1>
          <p>
            A focused workspace for financial crime teams.
            <br />
            From the first signal to the final decision.
          </p>
          <div className="login-workflow">
            <span>Trace</span>
            <ArrowRight size={15} />
            <span>Investigate</span>
            <ArrowRight size={15} />
            <span>Decide</span>
          </div>
        </div>
        <small>
          <ShieldCheck size={15} />
          AI-assisted. Evidence-led. Human-decided.
        </small>
      </aside>
      <main className="login-main">
        <Link to="/" className="back-link">
          <ArrowLeft size={15} />
          Back to FraudLens
        </Link>
        <div className="login-form-wrap">
          <span className="auth-icon">
            <LockKeyhole size={23} />
          </span>
          <p className="eyebrow mt-6">ANALYST WORKSPACE</p>
          <h2>Welcome back.</h2>
          <p className="muted">Sign in to bring the full picture into focus.</p>
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
            <label className="form-field">
              Password
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={action.pending}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <Feedback error={action.error} />
            <Button type="submit" variant="primary" className="w-full" busy={action.pending}>
              {action.pending ? 'Signing in…' : 'Sign in to workspace'}
              {!action.pending && <ArrowRight size={16} />}
            </Button>
          </form>
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
        <small className="login-copyright">© 2026 FraudLens AI</small>
      </main>
    </div>
  )
}
