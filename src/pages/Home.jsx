import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/common/Navbar.jsx'

const FEATURES = [
  {
    icon: '⚔',
    title: 'Character Creation',
    body: 'Build a complete HârnMaster 3e character — attributes, skills, combat, injuries, inventory, and optional psionics.',
  },
  {
    icon: '⚄',
    title: 'Dice Roller',
    body: 'Roll d100 against any Mastery Level and instantly see your result — Critical Success, Marginal, or Fumble — with advancement tracking.',
  },
  {
    icon: '📜',
    title: 'Saved Characters',
    body: 'Your roster persists between sessions. Edit any character at any time and pick up exactly where you left off.',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="page-wrap">
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-glow hero-glow--left"  />
          <div className="hero-glow hero-glow--right" />
          <div className="hero-grid" />
        </div>

        <div className="container hero-content">
          <p className="hero-eyebrow fade-up display">The Kingdom of Hârn awaits</p>

          <h1 className="hero-title display fade-up-2">
            Chronicle Your<br />
            <span className="hero-title-accent">Legend</span>
          </h1>

          <p className="hero-sub fade-up-3">
            A character manager built for HârnMaster 3rd Edition — from attribute
            allocation to skill advancement, wound tracking, and dice rolls, all in one place.
          </p>

          <div className="hero-actions fade-up-4">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Your Characters →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Begin Your Chronicle
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  Return, Adventurer
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative shield emblem */}
        <div className="hero-emblem fade-up" aria-hidden="true">
          <div className="emblem-ring emblem-ring--outer" />
          <div className="emblem-ring emblem-ring--inner" />
          <span className="emblem-icon">⚔</span>
        </div>
      </section>

      {/* ── Ornament ── */}
      <div className="container">
        <div className="ornament">✦</div>
      </div>

      {/* ── Features ── */}
      <section className="features">
        <div className="container">
          <h2 className="features-title display fade-up">What Awaits You</h2>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`feature-card fade-up-${i + 2}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-name display">{f.title}</h3>
                <p className="feature-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <hr className="rule" />
          <p className="footer-text">
            HârnMaster is a trademark of Columbia Games Inc.
            This tool is an unofficial fan aid by Mitchell Smothermon.
             Please support the official products!
          </p>
        </div>
      </footer>

      <style>{`
        /* Hero */
        .hero {
          position: relative;
          overflow: hidden;
          padding: 7rem 0 6rem;
          text-align: center;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .hero-glow {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.18;
        }
        .hero-glow--left  { left: -200px; top: -100px; background: var(--ember); }
        .hero-glow--right { right: -200px; bottom: -100px; background: var(--crimson); }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(196,117,42,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196,117,42,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
        }
        .hero-eyebrow {
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ember2);
          margin-bottom: 1.25rem;
        }
        .hero-title {
          font-size: clamp(2.8rem, 7vw, 5rem);
          font-weight: 700;
          line-height: 1.05;
          color: var(--parchment);
          margin-bottom: 1.5rem;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, var(--ember2), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 1.15rem;
          color: var(--mist);
          max-width: 520px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-lg {
          padding: 0.8rem 2rem;
          font-size: 0.85rem;
        }
        /* Emblem */
        .hero-emblem {
          position: absolute;
          right: 6%;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.12;
        }
        .emblem-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid var(--gold);
        }
        .emblem-ring--outer { width: 280px; height: 280px; }
        .emblem-ring--inner { width: 200px; height: 200px; }
        .emblem-icon {
          font-size: 5rem;
          color: var(--gold);
          position: relative;
          z-index: 1;
        }
        @media (max-width: 768px) { .hero-emblem { display: none; } }

        /* Features */
        .features { padding: 4rem 0 5rem; }
        .features-title {
          text-align: center;
          font-size: 1.5rem;
          letter-spacing: 0.06em;
          color: var(--parchment2);
          margin-bottom: 3rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          background: var(--ash);
          border: 1px solid var(--ash3);
          border-radius: var(--radius-lg);
          padding: 2rem 1.75rem;
          transition: border-color var(--transition), transform var(--transition);
        }
        .feature-card:hover {
          border-color: var(--ember);
          transform: translateY(-3px);
        }
        .feature-icon {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }
        .feature-name {
          font-size: 0.95rem;
          letter-spacing: 0.06em;
          color: var(--gold);
          margin-bottom: 0.75rem;
        }
        .feature-body {
          font-size: 0.95rem;
          color: var(--mist);
          line-height: 1.65;
        }

        /* Footer */
        .footer { padding: 2rem 0; }
        .footer-text {
          font-size: 0.82rem;
          color: var(--ash3);
          text-align: center;
          padding-bottom: 1rem;
        }
      `}</style>
    </div>
  )
}