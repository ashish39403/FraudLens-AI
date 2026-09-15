import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordField({
  value,
  onChange,
  disabled,
  newPassword = false,
}: {
  value: string
  onChange: (value: string) => void
  disabled: boolean
  newPassword?: boolean
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="form-field">
      <label htmlFor="auth-password">Password</label>
      <div className="password-input">
        <input
          id="auth-password"
          type={visible ? 'text' : 'password'}
          autoComplete={newPassword ? 'new-password' : 'current-password'}
          placeholder={newPassword ? 'Create a strong password' : 'Enter your password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={newPassword ? 8 : undefined}
          aria-describedby={newPassword ? 'password-guidance' : undefined}
          disabled={disabled}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {newPassword && (
        <span id="password-guidance" className="auth-hint">
          8+ characters, with uppercase, lowercase, and a number.
        </span>
      )}
    </div>
  )
}
