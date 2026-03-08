import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/common/Navbar.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]         = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
    if (apiError) setApiError('')
  }

  function validate() {
    const errs = {}
    if (!form.username || form.username.length < 3)
      errs.username = 'Username must be at least 3 characters.'
    if (!/^[a-zA-Z0-9]+$/.test(form.username))
      errs.username = 'Username may only contain letters and numbers.'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'A valid email is required.'
    if (!form.password || form.password.length < 8)
      errs.password = 'Password must be at least 8 characters.'
    if (form.confirm !== form.password)
      errs.confirm = 'Passwords do not match.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  /* Password strength */
  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8)  s++
    if (p.length >= 12) s++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
    if (/\d/.test(p)) s++
    if (/[^a-zA-Z0-9]/.test(p)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength]
  const strengthColor = ['', '#e07070', '#c4a84a', '#8ab88a', '#4a9a4a', '#3d7a8a'][strength]

  return (
    <div className="page-wrap">
      <Navbar />

      <main className="auth-page">
        <div className="auth-glow auth-glow--a" aria-hidden="true" />
        <div className="auth-glow auth-glow--b" aria-hidden="true" />

        <div className="auth-card card fade-up">
          <div className="auth-header">
            <p className="display auth-eyebrow">HârnMaster</p>
            <h1 className="display auth-title">Begin Your Legend</h1>
            <p className="auth-sub">Create your account and start building characters.</p>
          </div>

          <div className="ornament">✦</div>

          {apiError && <div className="alert alert-error">{apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className={`form-input ${errors.username ? 'error' : ''}`}
                value={form.username}
                onChange={handleChange}
                placeholder="aldric_of_kaldor"
                maxLength={30}
              />
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
              {form.password && (
                <div className="strength-bar-wrap">
                  <div
                    className="strength-bar"
                    style={{
                      width: `${(strength / 5) * 100}%`,
                      background: strengthColor,
                    }}
                  />
                  <span className="strength-label" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                className={`form-input ${errors.confirm ? 'error' : ''}`}
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.confirm && <p className="form-error">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> Creating Account…</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-text">
            Already chronicled?{' '}
            <Link to="/login" className="auth-link">Return, adventurer →</Link>
          </p>
        </div>
      </main>

      <style>{`
        .auth-page {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .auth-glow {
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .auth-glow--a { background: rgba(196,117,42,0.12); top: -100px; right: -100px; }
        .auth-glow--b { background: rgba(139,32,32,0.10); bottom: -100px; left: -100px; }
        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
        }
        .auth-header { text-align: center; margin-bottom: 0.5rem; }
        .auth-eyebrow {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ember2);
          margin-bottom: 0.5rem;
        }
        .auth-title {
          font-size: 1.6rem;
          color: var(--parchment);
          margin-bottom: 0.5rem;
        }
        .auth-sub { font-size: 0.92rem; color: var(--mist); }
        .strength-bar-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.4rem;
        }
        .strength-bar {
          height: 3px;
          border-radius: 2px;
          flex: 1;
          background: var(--ash3);
          transition: width 0.3s ease, background 0.3s ease;
        }
        .strength-label {
          font-size: 0.78rem;
          font-family: var(--font-display);
          letter-spacing: 0.06em;
          min-width: 60px;
        }
        .auth-footer-text {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.92rem;
          color: var(--mist);
        }
        .auth-link { color: var(--ember2); transition: color var(--transition); }
        .auth-link:hover { color: var(--gold); }
      `}</style>
    </div>
  )
}