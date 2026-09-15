import { useEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { Brand } from '../ui'
import { authDestination } from '../../lib/auth'

export function AuthLayout() {
  const location = useLocation()
  const signup = location.pathname === '/signup'
  const panel = useRef<HTMLDivElement>(null)
  const previousPath = useRef(location.pathname)
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      panel.current?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
      previousPath.current = location.pathname
    }
  }, [location.pathname])
  const state = { from: authDestination(location.state) }
  return (
    <div className={`login-page auth-page ${signup ? 'auth-signup' : 'auth-login'}`}>
      <aside className="login-story">
        <Link to="/" aria-label="FraudLens AI home">
          <Brand />
        </Link>
        <div>
          <p className="eyebrow">
            {signup ? 'A CLEARER WAY TO INVESTIGATE' : 'THE FULL PICTURE STARTS HERE'}
          </p>
          <h1>
            {signup ? (
              <>
                Bring your
                <br />
                investigations
                <br />
                <span>into focus.</span>
              </>
            ) : (
              <>
                Every transaction
                <br />
                has a story.
                <br />
                <span>Find the context.</span>
              </>
            )}
          </h1>
          <p>
            {signup
              ? 'Connect customer context, transaction evidence, and your team’s judgment in one workspace.'
              : 'A focused workspace for financial crime teams. From the first signal to the final decision.'}
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
        <nav aria-label="Account access" className="auth-switch">
          <Link to="/login" state={state} aria-current={!signup ? 'page' : undefined}>
            Sign in
          </Link>
          <Link to="/signup" state={state} aria-current={signup ? 'page' : undefined}>
            Create account
          </Link>
        </nav>
        <div
          ref={panel}
          key={location.pathname}
          className={`auth-route ${signup ? 'auth-route-signup' : 'auth-route-login'}`}
        >
          <Outlet />
        </div>
        <small className="login-copyright">© {new Date().getFullYear()} FraudLens AI</small>
      </main>
    </div>
  )
}
