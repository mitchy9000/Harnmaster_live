const SUNSIGNS = ['','Ulandus','Aralius','Feniri','Ahnu','Angberelius','Nadai','Tai','Skorus','Masara','Lado','Morgath','Navek']
const SEXES    = ['', 'Male', 'Female', 'Other']

export default function IdentityTab({ data, onChange }) {
  function field(name) {
    return {
      name,
      value: data[name] ?? '',
      onChange: e => onChange(name, e.target.value),
      className: 'form-input',
    }
  }

  return (
    <div className="tab-content">
      <div className="section-grid-2">
        <div className="form-group">
          <label className="form-label">Character Name *</label>
          <input type="text" {...field('name')} placeholder="Full name" />
        </div>
        <div className="form-group">
          <label className="form-label">Player</label>
          <input type="text" {...field('player')} placeholder="Your name" />
        </div>
      </div>

      <div className="section-grid-3">
        <div className="form-group">
          <label className="form-label">Sunsign</label>
          <select {...field('sunsign')} className="form-input">
            {SUNSIGNS.map(s => <option key={s} value={s}>{s || '— None —'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sex</label>
          <select {...field('sex')} className="form-input">
            {SEXES.map(s => <option key={s} value={s}>{s || '— Unspecified —'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Age</label>
          <input type="number" {...field('age')} min={0} max={999} placeholder="0" className="form-input" />
        </div>
      </div>

      <div className="section-grid-3">
        <div className="form-group">
          <label className="form-label">Deity</label>
          <input type="text" {...field('deity')} placeholder="e.g. Larani" />
        </div>
        <div className="form-group">
          <label className="form-label">Height (in.)</label>
          <input type="number" {...field('height')} min={0} placeholder="72" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Weight (lbs)</label>
          <input type="number" {...field('weight')} min={0} placeholder="170" className="form-input" />
        </div>
      </div>

      <div className="section-grid-2">
        <div className="form-group">
          <label className="form-label">Birthdate</label>
          <input type="text" {...field('birthdate')} placeholder="e.g. 17 Aralius 680TR" />
        </div>
        <div className="form-group">
          <label className="form-label">Appearance</label>
          <input type="text" {...field('appearance')} placeholder="Brief description" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea
          name="notes"
          value={data.notes ?? ''}
          onChange={e => onChange('notes', e.target.value)}
          className="form-input"
          rows={5}
          placeholder="Background, personality, goals…"
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  )
}