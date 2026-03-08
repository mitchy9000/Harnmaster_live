import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { characterService } from '../services/characterService.js'
import Navbar from '../components/common/Navbar.jsx'

function CharacterCard({ character, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const navigate = useNavigate()

  async function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try {
      await onDelete(character._id)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  function handleCancelDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    setConfirming(false)
  }

  const updated = new Date(character.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div
      className="char-card"
      onClick={() => navigate(`/characters/${character._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/characters/${character._id}`)}
    >
      <div className="char-card-body">
        <div className="char-card-icon">{character.sex === 'Female' ? '♀' : character.sex === 'Male' ? '♂' : '⚔'}</div>
        <div className="char-card-info">
          <h3 className="display char-card-name">{character.name}</h3>
          <p className="char-card-meta">
            {[character.player && `Player: ${character.player}`, character.sunsign && `☽ ${character.sunsign}`, character.age && `Age ${character.age}`]
              .filter(Boolean).join('  ·  ')}
          </p>
          <p className="char-card-updated">Updated {updated}</p>
        </div>
      </div>

      <div className="char-card-actions" onClick={e => e.stopPropagation()}>
        <Link
          to={`/characters/${character._id}`}
          className="btn btn-ghost btn-sm"
        >
          Edit
        </Link>
        {confirming ? (
          <div className="confirm-wrap">
            <span className="confirm-prompt">Delete?</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <span className="spinner" style={{width:14,height:14}} /> : 'Yes'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleCancelDelete}>No</button>
          </div>
        ) : (
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [characters, setCharacters] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    characterService.getAll()
      .then(setCharacters)
      .catch(() => setError('Failed to load characters. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    await characterService.remove(id)
    setCharacters(cs => cs.filter(c => c._id !== id))
  }

  return (
    <div className="page-wrap">
      <Navbar />

      <main className="dash-main">
        <div className="container">
          {/* Header row */}
          <div className="dash-header fade-up">
            <div>
              <p className="display dash-eyebrow">Your Roster</p>
              <h1 className="display dash-title">
                Welcome back, <span className="text-ember">{user?.username}</span>
              </h1>
            </div>
            <Link to="/characters/new" className="btn btn-primary">
              + New Character
            </Link>
          </div>

          <hr className="rule" />

          {/* States */}
          {loading && (
            <div className="dash-state">
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p className="text-mist">Summoning your characters…</p>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && characters.length === 0 && (
            <div className="dash-empty fade-up">
              <div className="empty-emblem">⚔</div>
              <h2 className="display empty-title">No Characters Yet</h2>
              <p className="empty-sub">
                Your chronicle awaits. Create your first HârnMaster character to begin.
              </p>
              <Link to="/characters/new" className="btn btn-primary btn-lg">
                Create Your First Character
              </Link>
            </div>
          )}

          {!loading && !error && characters.length > 0 && (
            <div className="char-list fade-up-2">
              {characters.map((c, i) => (
                <div
                  key={c._id}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  className="fade-up"
                >
                  <CharacterCard character={c} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .dash-main { padding: 3rem 0 5rem; flex: 1; }
        .dash-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .dash-eyebrow {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ember2);
          margin-bottom: 0.25rem;
        }
        .dash-title { font-size: 2rem; color: var(--parchment); }

        /* Empty state */
        .dash-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 5rem 0;
          color: var(--mist);
        }
        .dash-empty {
          text-align: center;
          padding: 5rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .empty-emblem {
          font-size: 3.5rem;
          opacity: 0.25;
          line-height: 1;
        }
        .empty-title { font-size: 1.4rem; color: var(--parchment2); }
        .empty-sub { color: var(--mist); max-width: 360px; font-size: 1rem; }

        /* Character list */
        .char-list { display: flex; flex-direction: column; gap: 1rem; }
        .char-card {
          background: var(--ash);
          border: 1px solid var(--ash3);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          cursor: pointer;
          transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);
        }
        .char-card:hover {
          border-color: var(--ember);
          transform: translateX(4px);
          box-shadow: -3px 0 0 var(--ember);
        }
        .char-card-body {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex: 1;
          min-width: 0;
        }
        .char-card-icon {
          font-size: 1.6rem;
          color: var(--ember);
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(196,117,42,0.1);
          border-radius: var(--radius);
          border: 1px solid rgba(196,117,42,0.2);
        }
        .char-card-name {
          font-size: 1.05rem;
          color: var(--parchment);
          letter-spacing: 0.04em;
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .char-card-meta {
          font-size: 0.82rem;
          color: var(--mist);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .char-card-updated {
          font-size: 0.75rem;
          color: var(--ash3);
          margin-top: 0.2rem;
        }
        .char-card-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .btn-sm {
          padding: 0.35rem 0.8rem;
          font-size: 0.68rem;
        }
        .confirm-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .confirm-prompt {
          font-size: 0.8rem;
          color: var(--crimson2);
          font-family: var(--font-display);
        }

        @media (max-width: 560px) {
          .char-card { flex-direction: column; align-items: flex-start; }
          .char-card-actions { width: 100%; }
        }
      `}</style>
    </div>
  )
}