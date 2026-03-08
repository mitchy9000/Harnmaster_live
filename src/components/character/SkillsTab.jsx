import { useState } from 'react'
import { rollVsML, RESULT_LABELS } from '../../utils/harnmasterDice.js'

const BLANK_SKILL = { name: '', sunsignBonus: 0, masteryLevel: 0, csCount: 0, msCount: 0, mfCount: 0, cfCount: 0, notes: '' }

function SkillRow({ skill, index, onChange, onRemove, onRoll }) {
  const [lastResult, setLastResult] = useState(null)
  const [rolling, setRolling]       = useState(false)
  const [expanded, setExpanded]     = useState(false)

  async function handleRoll() {
    if (rolling || !skill.masteryLevel) return
    setRolling(true)
    await new Promise(r => setTimeout(r, 300))
    const res = rollVsML(skill.masteryLevel)
    setLastResult(res)
    setRolling(false)
    onRoll(index, res.category)
  }

  const resultInfo = lastResult ? RESULT_LABELS[lastResult.category] : null

  return (
    <div className="skill-row-wrap">
      <div className="skill-row">
        {/* Name */}
        <input
          className="form-input skill-name-input"
          value={skill.name}
          placeholder="Skill name"
          onChange={e => onChange(index, 'name', e.target.value)}
        />
        {/* Sunsign bonus */}
        <div className="skill-num-cell">
          <span className="skill-col-hint">Bonus</span>
          <input
            type="number" min={-10} max={10}
            className="form-input skill-num-input"
            value={skill.sunsignBonus}
            onChange={e => onChange(index, 'sunsignBonus', Number(e.target.value))}
          />
        </div>
        {/* ML */}
        <div className="skill-num-cell">
          <span className="skill-col-hint">ML</span>
          <input
            type="number" min={0} max={100}
            className="form-input skill-num-input skill-ml"
            value={skill.masteryLevel}
            onChange={e => onChange(index, 'masteryLevel', Number(e.target.value))}
          />
        </div>
        {/* Roll button + last result */}
        <div className="skill-roll-cell">
          <button
            className={`btn btn-ghost btn-sm skill-roll-btn ${rolling ? 'rolling' : ''}`}
            onClick={handleRoll}
            disabled={!skill.masteryLevel || rolling}
            title={`Roll d100 vs ML ${skill.masteryLevel}`}
          >
            {rolling ? '…' : '⚄'}
          </button>
          {lastResult && (
            <span
              className="skill-last-result"
              style={{ color: resultInfo.color }}
              title={`${lastResult.roll} — ${resultInfo.label}`}
            >
              {lastResult.category}
            </span>
          )}
        </div>
        {/* Count badges */}
        <div className="skill-counts">
          {[['CS','#4ade80'],['MS','#86efac'],['MF','#fca5a5'],['CF','#ef4444']].map(([cat, col]) => (
            <span
              key={cat}
              className="skill-count-badge"
              style={{ '--cc': col }}
              title={`${cat} count: ${skill[cat.toLowerCase() + 'Count']}`}
            >
              {cat} {skill[cat.toLowerCase() + 'Count']}
            </span>
          ))}
        </div>
        {/* Expand / remove */}
        <div className="skill-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(x => !x)}
            title="Notes"
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onRemove(index)} title="Remove">✕</button>
        </div>
      </div>

      {expanded && (
        <div className="skill-notes-row">
          <input
            className="form-input"
            placeholder="Notes about this skill…"
            value={skill.notes ?? ''}
            onChange={e => onChange(index, 'notes', e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

export default function SkillsTab({ skills = [], onChange }) {
  function addSkill() {
    onChange([...skills, { ...BLANK_SKILL, _id: crypto.randomUUID() }])
  }

  function removeSkill(i) {
    onChange(skills.filter((_, idx) => idx !== i))
  }

  function updateSkill(i, field, value) {
    onChange(skills.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  function recordRoll(i, category) {
    const countKey = category.toLowerCase() + 'Count'
    onChange(skills.map((s, idx) => idx === i
      ? { ...s, [countKey]: (s[countKey] ?? 0) + 1 }
      : s
    ))
  }

  return (
    <div className="tab-content">
      {/* Header */}
      <div className="skills-header">
        <div className="skill-name-col">Skill</div>
        <div className="skill-num-col">⊕ Bonus</div>
        <div className="skill-num-col">ML</div>
        <div className="skill-roll-col">Roll</div>
        <div className="skill-counts-col">Results</div>
        <div />
      </div>

      {skills.length === 0 && (
        <div className="empty-state">
          <p className="text-mist">No skills added yet. Add your first skill below.</p>
        </div>
      )}

      <div className="skill-list">
        {skills.map((skill, i) => (
          <SkillRow
            key={skill._id ?? i}
            skill={skill}
            index={i}
            onChange={updateSkill}
            onRemove={removeSkill}
            onRoll={recordRoll}
          />
        ))}
      </div>

      <button className="btn btn-ghost" onClick={addSkill} style={{ marginTop: '1rem' }}>
        + Add Skill
      </button>

      <style>{`
        .skills-header {
          display: grid;
          grid-template-columns: 1fr 80px 70px 70px 1fr 80px;
          gap: 0.5rem;
          padding: 0 0.5rem 0.5rem;
          border-bottom: 1px solid var(--ash3);
          margin-bottom: 0.5rem;
          font-family: var(--font-display);
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
        }
        .skill-list { display: flex; flex-direction: column; gap: 0.35rem; }
        .skill-row-wrap {
          background: var(--ash2);
          border: 1px solid var(--ash3);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .skill-row {
          display: grid;
          grid-template-columns: 1fr 80px 70px 70px 1fr 80px;
          gap: 0.5rem;
          align-items: center;
          padding: 0.4rem 0.5rem;
        }
        .skill-row:hover { background: rgba(196,117,42,0.04); }
        .skill-name-input { padding: 0.35rem 0.5rem !important; font-size: 0.92rem !important; }
        .skill-num-cell { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
        .skill-col-hint { font-size: 0.6rem; color: var(--ash3); letter-spacing: 0.06em; text-transform: uppercase; }
        .skill-num-input {
          text-align: center !important;
          padding: 0.35rem 0.2rem !important;
          font-size: 0.95rem !important;
          font-family: var(--font-display) !important;
        }
        .skill-ml { color: var(--ember2) !important; }
        .skill-roll-cell { display: flex; align-items: center; gap: 0.4rem; }
        .skill-roll-btn { font-size: 1rem !important; padding: 0.3rem 0.5rem !important; }
        .skill-roll-btn.rolling { opacity: 0.6; }
        .skill-last-result {
          font-family: var(--font-display);
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          font-weight: 700;
          animation: fadeUp 0.3s ease;
        }
        .skill-counts { display: flex; flex-wrap: wrap; gap: 0.25rem; }
        .skill-count-badge {
          font-size: 0.65rem;
          font-family: var(--font-display);
          letter-spacing: 0.04em;
          padding: 0.15rem 0.35rem;
          border-radius: 3px;
          border: 1px solid var(--cc);
          color: var(--cc);
          background: color-mix(in srgb, var(--cc) 10%, transparent);
        }
        .skill-actions { display: flex; gap: 0.35rem; justify-content: flex-end; }
        .skill-notes-row {
          padding: 0.5rem;
          border-top: 1px solid var(--ash3);
          background: var(--ash);
        }
        .empty-state { padding: 2rem; text-align: center; }

        @media (max-width: 640px) {
          .skills-header { display: none; }
          .skill-row { grid-template-columns: 1fr 60px 60px 50px; }
          .skill-counts { display: none; }
        }
      `}</style>
    </div>
  )
}