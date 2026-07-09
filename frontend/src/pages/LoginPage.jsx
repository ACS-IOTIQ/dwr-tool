// ── frontend/src/pages/LoginPage.jsx ────────────────────────────
import { useState } from 'react'
import { useLogin } from '../hooks/useAuth'
import './LoginPage.css'

// ── Inline SVG icons (no extra icon-library dep needed) ─────────

function IconMail() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="3" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconEye({ off }) {
  return off ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function IconSpinner() {
  return (
    <svg className="login-btn-spinner" width="17" height="17"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round"
      aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

// ── DWR logo mark ────────────────────────────────────────────────

function DwrMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="5" width="16" height="2.5" rx="1.25" fill="#5B6AF0" />
      <rect x="3" y="10" width="22" height="2.5" rx="1.25" fill="#5B6AF0" opacity=".6" />
      <rect x="3" y="15" width="18" height="2.5" rx="1.25" fill="#5B6AF0" opacity=".4" />
      <circle cx="21" cy="20" r="5.5" fill="#22C55E" />
      <path d="M18.5 20l1.8 1.8 3.2-3.2"
        stroke="#fff" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────

export default function LoginPage() {
  const { mutate: doLogin, isPending, error } = useLogin()
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    doLogin({ email, password })
  }

  const errorMessage = error?.response?.data?.detail || (error ? 'Login failed. Check your credentials.' : null)

  return (
    <div className="login-page">
      <div className="login-card" role="main">

        {/* Logo mark */}
        <div className="login-mark" aria-label="DWR Tool">
          <div className="login-mark-icon">
            <DwrMark />
          </div>
        </div>

        <h1 className="login-heading">Welcome back</h1>
        <p className="login-sub">Sign in to your DWR workspace</p>

        {/* Error */}
        {errorMessage && (
          <div className="login-error" role="alert">
            <IconAlert />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="login-field">
            <label className="login-label" htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><IconMail /></span>
              <input
                className="login-input"
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><IconLock /></span>
              <input
                className="login-input login-input-pw"
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <IconEye off={showPw} />
              </button>
            </div>
          </div>

          {/* Forgot */}
          <a href="/forgot-password" className="login-forgot">Forgot password?</a>

          {/* Submit */}
          <button
            type="submit"
            className="login-btn"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <IconSpinner />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>

        </form>

        <p className="login-footer">
          New to DWR? Contact your team admin to get access.
        </p>

      </div>
    </div>
  )
}