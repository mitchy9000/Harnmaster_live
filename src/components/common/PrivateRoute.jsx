import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function PrivateRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--mist)',
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.1em',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
      }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        Consulting the archives…
      </div>
    )
  }

  return user
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />
}