import { useState } from 'react'
import { rollVsML, rollDice, RESULT_LABELS, d100 } from '../../utils/harnmasterDice.js'

// ── Animated d100 display ─────────────────────────────────────────────────────
function DieDisplay({ value, rolling }) {
  return (
    <div className={`die-face ${rolling ? 'die-rolling' : ''}`}>
      <span className="die-value">{value ?? '—'}</span>
      <span className="die-label">d100</span>
    </div>
  )
}

// ── Result badge ──────────────────────────────────────────────────────────────
function ResultBadge({ category }) {
  if (!category) return null
  const { label, color } = RESULT_LABELS[category]
  return (
    <div className="result-badge" style={{ '--badge-color': color }}>
      <span className="result-category">{category}</span>
      <span className="result-label">{label}</span>
    </div>
  )
}

// ── Roll history item ─────────────────────────────────────────────────────────
function HistoryItem({ entry }) {
  const { label, color } = RESULT_LABELS[entry.category]
  return (
    <div className="history-item">
      <span className="history-skill">{entry.skillName}</span>
      <span className="history-roll">rolled {entry.roll}</span>
      <span className="history-vs">vs ML {entry.ml}</span>
      <span className="history-result" style={{ color }}>{label}</span>
    </div>
  )
}

// ── Main DiceRoller ───────────────────────────────────────────────────────────
export default function DiceRoller({ skills = [], onRecordResult }) {
  const [selectedSkill, setSelectedSkill] = useState('')
  const [customML,      setCustomML]      = useState(50)
  const [useCustom,     setUseCustom]     = useState(false)
  const [result,        setResult]        = useState(null)
  const [rolling,       setRolling]       = useState(false)
  const [history,       setHistory]       = useState([])
  const [d6Count,       setD6Count]       = useState(1)
  const [d6Result,      setD6Result]      = useState(null)

  const activeSkill = skills.find(s => s._id === selectedSkill || s.name === selectedSkill)
  const ml = useCustom ? customML : (activeSkill?.masteryLevel ?? customML)
  const skillName = useCustom ? `Custom ML ${customML}` : (activeSkill?.name ?? 'Custom')

  async function handleRoll() {
    if (rolling) return
    setRolling(true)
    setResult(null)

    // Brief "rolling" flash
    await new Promise(r => setTimeout(r, 350))

    const res = rollVsML(ml)
    setResult(res)
    setRolling(false)

    const entry = { ...res, skillName, timestamp: Date.now() }
    setHistory(h => [entry, ...h].slice(0, 12))

    if (onRecordResult && activeSkill && !useCustom) {
      onRecordResult(activeSkill._id ?? activeSkill.name, res.category)
    }
  }

  function handleD6Roll() {
    const { rolls, total } = rollDice(d6Count)
    setD6Result({ rolls, total })
  }

  return (
    <div className="dice-roller">
      {/* ── Skill / ML selector ── */}
      <div className="dice-controls">
        <div className="dice-section-title display">Skill Roll — d100 vs Mastery Level</div>

        <div className="dice-selector-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Skill</label>
            <select
              className="form-input"
              value={useCustom ? '__custom__' : selectedSkill}
              onChange={e => {
                if (e.target.value === '__custom__') { setUseCustom(true); setSelectedSkill('') }
                else { setUseCustom(false); setSelectedSkill(e.target.value) }
              }}
            >
              <option value="">— Choose a skill —</option>
              {skills.map(s => (
                <option key={s._id ?? s.name} value={s._id ?? s.name}>
                  {s.name} (ML {s.masteryLevel})
                </option>
              ))}
              <option value="__custom__">Custom ML…</option>
            </select>
          </div>

          {useCustom && (
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Mastery Level</label>
              <input
                type="number"
                className="form-input"
                value={customML}
                min={1} max={100}
                onChange={e => setCustomML(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* CS threshold info */}
        {(activeSkill || useCustom) && (
          <div className="ml-info">
            <span>ML <strong>{ml}</strong></span>
            <span className="ml-divider">·</span>
            <span className="text-gold">CS ≤ {Math.floor(ml / 20) * 5 || 5}</span>
            <span className="ml-divider">·</span>
            <span className="text-ember">MS ≤ {ml}</span>
            <span className="ml-divider">·</span>
            <span className="text-crimson">CF ≥ 96</span>
          </div>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleRoll}
          disabled={rolling || (!activeSkill && !useCustom)}
        >
          {rolling ? <><span className="spinner" /> Rolling…</> : '⚄ Roll d100'}
        </button>
      </div>

      {/* ── Result display ── */}
      <div className="dice-result-area">
        <DieDisplay value={result?.roll} rolling={rolling} />
        {result && <ResultBadge category={result.category} />}
        {!result && !rolling && (
          <p className="dice-prompt text-mist">Roll the dice to see your fate.</p>
        )}
      </div>

      {/* ── d6 roller ── */}
      <div className="dice-controls" style={{ marginTop: '1.5rem' }}>
        <div className="dice-section-title display">Damage / Misc — d6</div>
        <div className="d6-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setD6Count(c => Math.max(1, c - 1))}
            >−</button>
            <span className="d6-count display">{d6Count}d6</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setD6Count(c => Math.min(6, c + 1))}
            >+</button>
          </div>
          <button className="btn btn-ghost" onClick={handleD6Roll}>
            Roll {d6Count}d6
          </button>
        </div>
        {d6Result && (
          <div className="d6-result">
            <span className="d6-total">{d6Result.total}</span>
            <span className="d6-breakdown">
              [{d6Result.rolls.join(' + ')}]
            </span>
          </div>
        )}
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="dice-history">
          <div className="dice-section-title display">Recent Rolls</div>
          {history.map((entry, i) => (
            <HistoryItem key={entry.timestamp + i} entry={entry} />
          ))}
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '0.5rem' }}
            onClick={() => setHistory([])}
          >
            Clear
          </button>
        </div>
      )}

      <style>{`
        .dice-roller { display: flex; flex-direction: column; gap: 0; }
        .dice-controls {
          background: var(--ash);
          border: 1px solid var(--ash3);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        .dice-section-title {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--mist);
          margin-bottom: 1rem;
        }
        .dice-selector-row {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          margin-bottom: 0.75rem;
        }
        .ml-info {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.88rem;
          color: var(--mist);
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .ml-divider { color: var(--ash3); }

        /* Result area */
        .dice-result-area {
          background: var(--ash);
          border: 1px solid var(--ash3);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          min-height: 180px;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .die-face {
          width: 100px; height: 100px;
          border: 2px solid var(--ash3);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--ash2);
          transition: border-color 0.2s;
        }
        .die-rolling {
          border-color: var(--ember);
          animation: dieShake 0.35s ease;
        }
        @keyframes dieShake {
          0%,100% { transform: rotate(0deg) scale(1); }
          25%      { transform: rotate(-8deg) scale(1.05); }
          75%      { transform: rotate(8deg) scale(1.05); }
        }
        .die-value {
          font-family: var(--font-display);
          font-size: 2.2rem;
          color: var(--parchment);
          line-height: 1;
        }
        .die-label {
          font-size: 0.65rem;
          color: var(--mist);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 0.2rem;
        }
        .result-badge {
          text-align: center;
          padding: 0.6rem 1.5rem;
          border: 1px solid var(--badge-color);
          border-radius: var(--radius);
          background: color-mix(in srgb, var(--badge-color) 12%, transparent);
        }
        .result-category {
          display: block;
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--badge-color);
          letter-spacing: 0.1em;
        }
        .result-label {
          display: block;
          font-size: 0.8rem;
          color: var(--badge-color);
          opacity: 0.8;
          letter-spacing: 0.06em;
        }
        .dice-prompt { font-size: 0.9rem; }

        /* d6 roller */
        .d6-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .d6-count {
          font-size: 1.1rem;
          color: var(--parchment);
          min-width: 2.5rem;
          text-align: center;
        }
        .d6-result {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }
        .d6-total {
          font-family: var(--font-display);
          font-size: 1.8rem;
          color: var(--gold);
        }
        .d6-breakdown {
          font-size: 0.9rem;
          color: var(--mist);
        }

        /* History */
        .dice-history {
          background: var(--ash);
          border: 1px solid var(--ash3);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
        }
        .history-item {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 0.75rem;
          align-items: center;
          padding: 0.4rem 0;
          border-bottom: 1px solid var(--ash2);
          font-size: 0.85rem;
        }
        .history-item:last-of-type { border-bottom: none; }
        .history-skill { color: var(--parchment2); font-weight: 600; }
        .history-roll  { color: var(--mist); }
        .history-vs    { color: var(--mist); }
        .history-result{ font-family: var(--font-display); font-size: 0.75rem; letter-spacing: 0.06em; }
      `}</style>
    </div>
  )
}