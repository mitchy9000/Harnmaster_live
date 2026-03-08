import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-rune">⚔</span>
          <span className="display">HârnMaster</span>
        </Link>

        {/* Links */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`navbar-link ${isActive('/dashboard') ? 'navbar-link--active' : ''}`}
              >
                Characters
              </Link>
              <span className="navbar-user">
                <span className="navbar-user-dot" />
                {user.username}
              </span>
              <button
                className="btn btn-ghost"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? <span className="spinner" /> : 'Depart'}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`navbar-link ${isActive('/login') ? 'navbar-link--active' : ''}`}
              >
                Enter
              </Link>
              <Link to="/register" className="btn btn-primary">
                Begin
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(26,21,16,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--ash3);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: 0.06em;
          color: var(--gold);
          transition: color var(--transition);
        }
        .navbar-brand:hover { color: var(--gold2); }
        .navbar-rune {
          font-size: 1rem;
          color: var(--ember);
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .navbar-link {
          font-family: var(--font-display);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
          transition: color var(--transition);
          position: relative;
          padding-bottom: 2px;
        }
        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0; right: 0;
          height: 1px;
          background: var(--ember);
          transform: scaleX(0);
          transition: transform var(--transition);
        }
        .navbar-link:hover { color: var(--parchment); }
        .navbar-link:hover::after { transform: scaleX(1); }
        .navbar-link--active { color: var(--ember2); }
        .navbar-link--active::after { transform: scaleX(1); }
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          color: var(--mist);
        }
        .navbar-user-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--moss2);
          box-shadow: 0 0 6px var(--moss2);
        }
      `}</style>
    </nav>
  )
}