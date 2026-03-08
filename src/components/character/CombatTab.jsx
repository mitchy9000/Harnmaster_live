const SEVERITY_OPTIONS = ['','M1','M2','M3','S1','S2','S3','G1','G2','G3']
const LOCATIONS = ['Head','Neck','Shoulder-L','Shoulder-R','Upper Arm-L','Upper Arm-R',
  'Elbow-L','Elbow-R','Forearm-L','Forearm-R','Hand-L','Hand-R',
  'Chest','Abdomen','Hip-L','Hip-R','Thigh-L','Thigh-R',
  'Knee-L','Knee-R','Calf-L','Calf-R','Foot-L','Foot-R']

const BLANK_WEAPON = { name: '', ml: 0 }
const BLANK_INJURY = { location: '', severity: '', effect: '', healed: false }

export default function CombatTab({ data, onChange }) {
  const combat   = data.combat   ?? { initiative: 0, dodge: 0, weaponSkills: [] }
  const injuries = data.injuries ?? []

  function setCombat(field, val) {
    onChange('combat', { ...combat, [field]: val })
  }

  /* Weapon skills */
  function addWeapon() {
    setCombat('weaponSkills', [...(combat.weaponSkills ?? []), { ...BLANK_WEAPON }])
  }
  function updateWeapon(i, field, val) {
    const ws = (combat.weaponSkills ?? []).map((w, idx) => idx === i ? { ...w, [field]: val } : w)
    setCombat('weaponSkills', ws)
  }
  function removeWeapon(i) {
    setCombat('weaponSkills', (combat.weaponSkills ?? []).filter((_, idx) => idx !== i))
  }

  /* Injuries */
  function addInjury() {
    onChange('injuries', [...injuries, { ...BLANK_INJURY }])
  }
  function updateInjury(i, field, val) {
    onChange('injuries', injuries.map((inj, idx) => idx === i ? { ...inj, [field]: val } : inj))
  }
  function removeInjury(i) {
    onChange('injuries', injuries.filter((_, idx) => idx !== i))
  }

  const activeInjuries = injuries.filter(inj => !inj.healed)
  const healedInjuries = injuries.filter(inj =>  inj.healed)

  return (
    <div className="tab-content">
      {/* ── Core combat stats ── */}
      <div className="section-label display">Combat Statistics</div>
      <div className="section-grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Initiative</label>
          <input
            type="number" min={0}
            className="form-input combat-stat-input"
            value={combat.initiative ?? 0}
            onChange={e => setCombat('initiative', Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Dodge ML</label>
          <input
            type="number" min={0} max={100}
            className="form-input combat-stat-input"
            value={combat.dodge ?? 0}
            onChange={e => setCombat('dodge', Number(e.target.value))}
          />
        </div>
      </div>

      {/* ── Weapon skills ── */}
      <div className="section-label display">Weapon Skills</div>
      {(combat.weaponSkills ?? []).length === 0 && (
        <p className="text-mist" style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          No weapon skills added.
        </p>
      )}
      <div className="weapon-list">
        {(combat.weaponSkills ?? []).map((w, i) => (
          <div key={i} className="weapon-row">
            <input
              className="form-input"
              placeholder="Weapon / skill name"
              value={w.name ?? ''}
              onChange={e => updateWeapon(i, 'name', e.target.value)}
            />
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">ML</label>
              <input
                type="number" min={0} max={100}
                className="form-input"
                style={{ textAlign: 'center' }}
                value={w.ml ?? 0}
                onChange={e => updateWeapon(i, 'ml', Number(e.target.value))}
              />
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => removeWeapon(i)}>✕</button>
          </div>
        ))}
      </div>
      <button className="btn btn-ghost" onClick={addWeapon} style={{ marginBottom: '2rem' }}>
        + Add Weapon Skill
      </button>

      <hr className="rule" />

      {/* ── Injuries ── */}
      <div className="section-label display">Wounds &amp; Injuries</div>

      {activeInjuries.length === 0 && (
        <p className="text-mist" style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          No active wounds. The adventurer is uninjured.
        </p>
      )}

      <div className="injury-list">
        {injuries.map((inj, i) => (
          <div key={i} className={`injury-card ${inj.healed ? 'injury-healed' : ''}`}>
            <div className="injury-row1">
              <div className="form-group" style={{ flex: 2, margin: 0 }}>
                <label className="form-label">Location</label>
                <select
                  className="form-input"
                  value={inj.location ?? ''}
                  onChange={e => updateInjury(i, 'location', e.target.value)}
                >
                  <option value="">— Select —</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Severity</label>
                <select
                  className="form-input"
                  value={inj.severity ?? ''}
                  onChange={e => updateInjury(i, 'severity', e.target.value)}
                >
                  {SEVERITY_OPTIONS.map(s => (
                    <option key={s} value={s}>{s || '—'}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.1rem' }}>
                <label className="healed-toggle" title="Mark as healed">
                  <input
                    type="checkbox"
                    checked={inj.healed ?? false}
                    onChange={e => updateInjury(i, 'healed', e.target.checked)}
                  />
                  <span>Healed</span>
                </label>
                <button className="btn btn-danger btn-sm" onClick={() => removeInjury(i)}>✕</button>
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Effect / Notes</label>
              <input
                className="form-input"
                placeholder="e.g. −2 to all physical actions"
                value={inj.effect ?? ''}
                onChange={e => updateInjury(i, 'effect', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={addInjury}>
        + Add Wound
      </button>

      {healedInjuries.length > 0 && (
        <p className="text-mist" style={{ fontSize: '0.82rem', marginTop: '0.75rem' }}>
          {healedInjuries.length} healed wound{healedInjuries.length > 1 ? 's' : ''} recorded.
        </p>
      )}

      <style>{`
        .section-label {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--mist);
          margin-bottom: 0.75rem;
        }
        .combat-stat-input {
          font-family: var(--font-display) !important;
          font-size: 1.2rem !important;
          text-align: center;
        }
        .weapon-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
        .weapon-row {
          display: grid;
          grid-template-columns: 1fr 80px auto;
          gap: 0.75rem;
          align-items: flex-end;
        }
        .injury-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 0.75rem; }
        .injury-card {
          background: var(--ash2);
          border: 1px solid var(--ash3);
          border-radius: var(--radius);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-left: 3px solid var(--crimson2);
        }
        .injury-healed {
          border-left-color: var(--moss2);
          opacity: 0.65;
        }
        .injury-row1 {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .healed-toggle {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--mist);
          cursor: pointer;
          white-space: nowrap;
          padding-bottom: 0.6rem;
        }
        .healed-toggle input { accent-color: var(--moss2); }
      `}</style>
    </div>
  )
}