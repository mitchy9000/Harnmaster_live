const BLANK_ITEM = { name: '', qty: 1, weight: 0, location: 'carried', notes: '' }

function totalWeight(inventory) {
  return inventory.reduce((sum, item) => sum + (item.weight ?? 0) * (item.qty ?? 1), 0)
}

export default function InventoryTab({ inventory = [], onChange }) {
  function addItem() {
    onChange([...inventory, { ...BLANK_ITEM, _id: crypto.randomUUID() }])
  }

  function updateItem(i, field, val) {
    onChange(inventory.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  function removeItem(i) {
    onChange(inventory.filter((_, idx) => idx !== i))
  }

  const total = totalWeight(inventory)

  return (
    <div className="tab-content">
      {/* Summary bar */}
      <div className="inv-summary">
        <span>{inventory.length} item{inventory.length !== 1 ? 's' : ''}</span>
        <span className="inv-summary-dot">·</span>
        <span className="text-gold">{total.toFixed(1)} lbs total</span>
      </div>

      {/* Column headers */}
      {inventory.length > 0 && (
        <div className="inv-header">
          <div>Item</div>
          <div style={{textAlign:'center'}}>Qty</div>
          <div style={{textAlign:'center'}}>Weight (lbs)</div>
          <div>Location</div>
          <div>Notes</div>
          <div />
        </div>
      )}

      {inventory.length === 0 && (
        <div className="empty-state">
          <p className="text-mist">No items in inventory. Add equipment below.</p>
        </div>
      )}

      <div className="inv-list">
        {inventory.map((item, i) => (
          <div key={item._id ?? i} className="inv-row">
            <input
              className="form-input"
              placeholder="Item name"
              value={item.name}
              onChange={e => updateItem(i, 'name', e.target.value)}
            />
            <input
              type="number" min={0}
              className="form-input"
              style={{ textAlign: 'center' }}
              value={item.qty}
              onChange={e => updateItem(i, 'qty', Number(e.target.value))}
            />
            <input
              type="number" min={0} step={0.1}
              className="form-input"
              style={{ textAlign: 'center' }}
              value={item.weight}
              onChange={e => updateItem(i, 'weight', Number(e.target.value))}
            />
            <input
              className="form-input"
              placeholder="carried / pack / stored"
              value={item.location}
              onChange={e => updateItem(i, 'location', e.target.value)}
            />
            <input
              className="form-input"
              placeholder="Notes"
              value={item.notes}
              onChange={e => updateItem(i, 'notes', e.target.value)}
            />
            <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={addItem} style={{ marginTop: '1rem' }}>
        + Add Item
      </button>

      <style>{`
        .inv-summary {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.88rem;
          color: var(--mist);
          margin-bottom: 1rem;
        }
        .inv-summary-dot { color: var(--ash3); }
        .inv-header {
          display: grid;
          grid-template-columns: 2fr 60px 100px 120px 1fr 36px;
          gap: 0.5rem;
          padding: 0 0.25rem 0.5rem;
          border-bottom: 1px solid var(--ash3);
          margin-bottom: 0.4rem;
          font-family: var(--font-display);
          font-size: 0.63rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
        }
        .inv-list { display: flex; flex-direction: column; gap: 0.4rem; }
        .inv-row {
          display: grid;
          grid-template-columns: 2fr 60px 100px 120px 1fr 36px;
          gap: 0.5rem;
          align-items: center;
        }
        .empty-state { padding: 2rem; text-align: center; }

        @media (max-width: 700px) {
          .inv-header { display: none; }
          .inv-row {
            grid-template-columns: 1fr 50px 60px;
            grid-template-rows: auto auto;
          }
          .inv-row > *:nth-child(4),
          .inv-row > *:nth-child(5) {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  )
}