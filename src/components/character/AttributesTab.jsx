const ATTR_DEFS = [
  { key: 'STR', label: 'Strength',    abbr: 'STR' },
  { key: 'STA', label: 'Stamina',     abbr: 'STA' },
  { key: 'DEX', label: 'Dexterity',   abbr: 'DEX' },
  { key: 'AGI', label: 'Agility',     abbr: 'AGI' },
  { key: 'INT', label: 'Intelligence',abbr: 'INT' },
  { key: 'AUR', label: 'Aura',        abbr: 'AUR' },
  { key: 'WIL', label: 'Will',        abbr: 'WIL' },
  { key: 'EYE', label: 'Eyesight',    abbr: 'EYE' },
  { key: 'HRG', label: 'Hearing',     abbr: 'HRG' },
  { key: 'SME', label: 'Smell',       abbr: 'SME' },
  { key: 'VOI', label: 'Voice',       abbr: 'VOI' },
  { key: 'CML', label: 'Comeliness',  abbr: 'CML' },
]

function AttrRow({ def, base, current, onBaseChange, onCurrentChange }) {
  return (
    <div className="attr-row">
      <div className="attr-abbr display">{def.abbr}</div>
      <div className="attr-name">{def.label}</div>
      <input
        type="number"
        className="form-input attr-input"
        value={base}
        min={0} max={20}
        onChange={e => onBaseChange(Number(e.target.value))}
        title="Base value"
      />
      <input
        type="number"
        className="form-input attr-input"
        value={current}
        min={0} max={20}
        onChange={e => onCurrentChange(Number(e.target.value))}
        title="Current value"
      />
    </div>
  )
}

export default function AttributesTab({ data, onChange }) {
  const attrs = data.attributes ?? {}

  function setAttrField(key, field, val) {
    onChange('attributes', {
      ...attrs,
      [key]: { ...(attrs[key] ?? { base: 0, current: 0 }), [field]: val },
    })
  }

  // HarnMaster 3e derived stats
  const str = attrs.STR?.current ?? 0
  const sta = attrs.STA?.current ?? 0
  const dex = attrs.DEX?.current ?? 0
  const agi = attrs.AGI?.current ?? 0
  const wil = attrs.WIL?.current ?? 0

  const derivedEndurance = Math.ceil((str + sta + wil) / 3)
  const derivedMove      = Math.ceil((agi + dex) / 5) + 2

  function setDerived(field, val) { onChange(field, Number(val)) }

  return (
    <div className="tab-content">
      {/* Column headers */}
      <div className="attr-header">
        <div className="attr-abbr" />
        <div className="attr-name-head">Attribute</div>
        <div className="attr-col-head">Base</div>
        <div className="attr-col-head">Current</div>
      </div>

      <div className="attr-list">
        {ATTR_DEFS.map(def => (
          <AttrRow
            key={def.key}
            def={def}
            base={attrs[def.key]?.base ?? 0}
            current={attrs[def.key]?.current ?? 0}
            onBaseChange={v => setAttrField(def.key, 'base', v)}
            onCurrentChange={v => setAttrField(def.key, 'current', v)}
          />
        ))}
      </div>

      <hr className="rule" />

      {/* Derived stats */}
      <div className="derived-title display">Derived Values</div>
      <div className="derived-grid">
        <div className="derived-card">
          <span className="derived-label">Endurance</span>
          <span className="derived-formula text-mist">(STR+STA+WIL) ÷ 3</span>
          <span className="derived-computed text-gold">{derivedEndurance}</span>
          <input
            type="number" min={0}
            className="form-input derived-override"
            value={data.endurance ?? 0}
            onChange={e => setDerived('endurance', e.target.value)}
            title="Override computed value"
          />
        </div>
        <div className="derived-card">
          <span className="derived-label">Move</span>
          <span className="derived-formula text-mist">(AGI+DEX) ÷ 5 + 2</span>
          <span className="derived-computed text-gold">{derivedMove}</span>
          <input
            type="number" min={0}
            className="form-input derived-override"
            value={data.move ?? 0}
            onChange={e => setDerived('move', e.target.value)}
            title="Override computed value"
          />
        </div>
        <div className="derived-card">
          <span className="derived-label">Universal Penalty</span>
          <span className="derived-formula text-mist">From injuries</span>
          <input
            type="number" min={0}
            className="form-input derived-override"
            value={data.universalPenalty ?? 0}
            onChange={e => setDerived('universalPenalty', e.target.value)}
          />
        </div>
        <div className="derived-card">
          <span className="derived-label">Physical Penalty</span>
          <span className="derived-formula text-mist">From injuries</span>
          <input
            type="number" min={0}
            className="form-input derived-override"
            value={data.physicalPenalty ?? 0}
            onChange={e => setDerived('physicalPenalty', e.target.value)}
          />
        </div>
      </div>

      <style>{`
        .attr-header {
          display: grid;
          grid-template-columns: 48px 1fr 72px 72px;
          gap: 0.75rem;
          padding: 0 0.5rem 0.5rem;
          border-bottom: 1px solid var(--ash3);
          margin-bottom: 0.25rem;
        }
        .attr-name-head, .attr-col-head {
          font-family: var(--font-display);
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
        }
        .attr-col-head { text-align: center; }
        .attr-list { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; }
        .attr-row {
          display: grid;
          grid-template-columns: 48px 1fr 72px 72px;
          gap: 0.75rem;
          align-items: center;
          padding: 0.3rem 0.5rem;
          border-radius: var(--radius-sm);
          transition: background var(--transition);
        }
        .attr-row:hover { background: rgba(196,117,42,0.06); }
        .attr-abbr {
          font-size: 0.8rem;
          letter-spacing: 0.06em;
          color: var(--ember2);
        }
        .attr-name {
          font-size: 0.92rem;
          color: var(--parchment2);
        }
        .attr-input {
          text-align: center;
          padding: 0.4rem 0.3rem !important;
          font-family: var(--font-display) !important;
          font-size: 1rem !important;
        }

        /* Derived */
        .derived-title {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--mist);
          margin-bottom: 1rem;
        }
        .derived-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .derived-card {
          background: var(--ash2);
          border: 1px solid var(--ash3);
          border-radius: var(--radius);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .derived-label {
          font-family: var(--font-display);
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          color: var(--parchment2);
        }
        .derived-formula { font-size: 0.75rem; }
        .derived-computed {
          font-family: var(--font-display);
          font-size: 1.4rem;
        }
        .derived-override {
          padding: 0.35rem 0.5rem !important;
          font-size: 0.9rem !important;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  )
}