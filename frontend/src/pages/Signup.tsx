import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowRight, ShieldCheck, UserPlus } from 'lucide-react'
import { useAuth } from '../app/AuthContext'
import { PasswordField } from '../components/auth/PasswordField'
import { Button, Feedback } from '../components/ui'
import { useAction } from '../hooks/useAction'
import { USER_ROLES, authDestination } from '../lib/auth'
import { repository } from '../services/repository'
import { isDemo } from '../services/client'
import type { UserRole } from '../types'

const roleDescriptions: Record<UserRole, string> = {
  ANALYST: 'Investigate transactions and document findings.',
  REVIEWER: 'Review evidence and investigation conclusions.',
  MANAGER: 'Coordinate your team’s investigation work.',
  ADMIN: 'Administer your organization’s workspace.',
}
export default function Signup() {
  const { session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const action = useAction()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('ANALYST')
  const destination = authDestination(location.state)
  useEffect(() => {
    document.title = 'Create account · FraudLens AI'
  }, [])
  if (session) return <Navigate to={destination} replace />
  return (
    <div className="login-form-wrap signup-form-wrap">
      <span className="auth-icon">
        <UserPlus size={23} />
      </span>
      <p className="eyebrow mt-6">YOUR INVESTIGATION WORKSPACE</p>
      <h2 tabIndex={-1}>Start with clarity.</h2>
      <p className="muted">Create your account. Bring the evidence together.</p>
      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          void action.run(async () => {
            const user = await repository.register({ full_name: fullName, email, password, role })
            setPassword('')
            navigate('/login', {
              replace: true,
              state: { from: destination, registeredEmail: user.email, registrationSuccess: true },
            })
          })
        }}
      >
        <label className="form-field">
          Full name
          <input
            name="full_name"
            autoComplete="name"
            placeholder="Your full name"
            maxLength={225}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={action.pending}
          />
        </label>
        <label className="form-field">
          Work email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={action.pending}
          />
        </label>
        <PasswordField
          value={password}
          onChange={setPassword}
          newPassword
          disabled={action.pending}
        />
        <label className="form-field">
          Role
          <select
            name="role"
            aria-describedby="role-guidance"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={action.pending}
          >
            {USER_ROLES.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <p id="role-guidance" className="auth-hint role-guidance">
          {roleDescriptions[role]}
        </p>
        <Feedback error={action.error} />
        <Button type="submit" variant="primary" className="w-full" busy={action.pending}>
          {action.pending ? 'Creating your account…' : 'Create account'}
          {!action.pending && <ArrowRight size={16} />}
        </Button>
      </form>
      <p className="auth-account-link">
        Already have an account?{' '}
        <Link to="/login" state={{ from: destination }}>
          Sign in
        </Link>
      </p>
      <p className="login-footnote">
        <ShieldCheck size={14} />
        {isDemo
          ? 'Demo accounts last until this page is reloaded. Use a sample password.'
          : 'One account. A connected investigation workspace.'}
      </p>
    </div>
  )
}
