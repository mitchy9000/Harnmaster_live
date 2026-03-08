import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/common/Navbar.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
    if (apiError) setApiError('')
  }

  function validate() {
    const errs = {}
    if (!form.email)    errs.email    = 'Email is required.'
    if (!form.password) errs.password = 'Password is required.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrap">
      <Navbar />

      <main className="auth-page">
        {/* Background glows */}
        <div className="auth-glow auth-glow--a" aria-hidden="true" />
        <div className="auth-glow auth-glow--b" aria-hidden="true" />

        <div className="auth-card card fade-up">
          {/* Header */}
          <div className="auth-header">
            <p className="display auth-eyebrow">HârnMaster</p>
            <h1 className="display auth-title">Return, Adventurer</h1>
            <p className="auth-sub">Enter your credentials to access your chronicles.</p>
          </div>

          <div className="ornament">✦</div>

          {/* API error */}
          {apiError && <div className="alert alert-error">{apiError}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
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
                autoComplete="current-password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> Entering…</> : 'Enter the Chronicle'}
            </button>
          </form>

          <p className="auth-footer-text">
            No chronicle yet?{' '}
            <Link to="/register" className="auth-link">Begin your legend →</Link>
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
        .auth-glow--a { background: rgba(196,117,42,0.12); top: -100px; left: -100px; }
        .auth-glow--b { background: rgba(139,32,32,0.10); bottom: -100px; right: -100px; }
        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: var(--ash);
          border: 1px solid var(--ash3);
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
        .auth-sub {
          font-size: 0.92rem;
          color: var(--mist);
        }
        .auth-footer-text {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.92rem;
          color: var(--mist);
        }
        .auth-link {
          color: var(--ember2);
          transition: color var(--transition);
        }
        .auth-link:hover { color: var(--gold); }
      `}</style>
    </div>
  )
}