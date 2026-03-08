import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { characterService } from '../services/characterService.js'
import Navbar from '../components/common/Navbar.jsx'
import IdentityTab   from '../components/Character/IdentityTab.jsx'
import AttributesTab from '../components/Character/AttributesTab.jsx'
import SkillsTab     from '../components/Character/SkillsTab.jsx'
import CombatTab     from '../components/Character/CombatTab.jsx'
import InventoryTab  from '../components/Character/InventoryTab.jsx'
import DiceRoller    from '../components/Character/Diceroller.jsx'

// ── Default blank character ───────────────────────────────────────────────────
const BLANK = {
  name: '', player: '', sunsign: '', birthdate: '', deity: '',
  sex: '', age: 0, height: 0, weight: 0, appearance: '', notes: '',
  attributes: {
    STR:{base:0,current:0}, STA:{base:0,current:0},
    DEX:{base:0,current:0}, AGI:{base:0,current:0},
    INT:{base:0,current:0}, AUR:{base:0,current:0},
    WIL:{base:0,current:0}, EYE:{base:0,current:0},
    HRG:{base:0,current:0}, SME:{base:0,current:0},
    VOI:{base:0,current:0}, CML:{base:0,current:0},
  },
  endurance: 0, move: 0, universalPenalty: 0, physicalPenalty: 0,
  skills: [], combat: { initiative: 0, dodge: 0, weaponSkills: [] },
  injuries: [], psionics: { enabled: false, auraScore: 0, talents: [] },
  inventory: [], isPublic: false,
}

const TABS = [
  { id: 'identity',   label: 'Identity'   },
  { id: 'attributes', label: 'Attributes' },
  { id: 'skills',     label: 'Skills'     },
  { id: 'combat',     label: 'Combat'     },
  { id: 'inventory',  label: 'Inventory'  },
  { id: 'dice',       label: '⚄ Dice'    },
]

// ── Save status indicator ─────────────────────────────────────────────────────
function SaveStatus({ status }) {
  const map = {
    idle:    { text: '',             color: 'transparent' },
    saving:  { text: 'Saving…',     color: 'var(--mist)'    },
    saved:   { text: '✓ Saved',     color: 'var(--moss2)'   },
    error:   { text: '✗ Save failed', color: 'var(--crimson2)' },
    unsaved: { text: '● Unsaved',   color: 'var(--ember2)'  },
  }
  const { text, color } = map[status] ?? map.idle
  return (
    <span className="save-status display" style={{ color }}>
      {text}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CharacterSheet() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isNew    = !id

  const [character,  setCharacter]  = useState(BLANK)
  const [activeTab,  setActiveTab]  = useState('identity')
  const [loading,    setLoading]    = useState(!isNew)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [loadError,  setLoadError]  = useState('')
  const [isDirty,    setIsDirty]    = useState(false)

  const saveTimerRef = useRef(null)

  // ── Load existing character ──
  useEffect(() => {
    if (isNew) return
    characterService.getOne(id)
      .then(c => { setCharacter(c); setIsDirty(false) })
      .catch(() => setLoadError('Character not found or access denied.'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  // ── Field updater (handles nested paths or top-level keys) ──
  const updateField = useCallback((key, value) => {
    setCharacter(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
    setSaveStatus('unsaved')

    // Auto-save after 2 seconds of inactivity (edit-mode only)
    if (!isNew) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => autoSave(), 2000)
    }
  }, [isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save ──
  async function handleSave() {
    if (!character.name?.trim()) {
      setActiveTab('identity')
      setSaveStatus('error')
      return
    }
    setSaveStatus('saving')
    try {
      if (isNew) {
        const saved = await characterService.create(character)
        setSaveStatus('saved')
        setIsDirty(false)
        navigate(`/characters/${saved._id}`, { replace: true })
      } else {
        await characterService.update(id, character)
        setSaveStatus('saved')
        setIsDirty(false)
      }
    } catch {
      setSaveStatus('error')
    }
  }

  async function autoSave() {
    if (!character.name?.trim() || !id) return
    setSaveStatus('saving')
    try {
      await characterService.update(id, character)
      setSaveStatus('saved')
      setIsDirty(false)
    } catch {
      setSaveStatus('error')
    }
  }

  // ── Warn on unload if unsaved ──
  useEffect(() => {
    const handler = e => {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // ── Loading / error states ──
  if (loading) {
    return (
      <div className="page-wrap">
        <Navbar />
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', color:'var(--mist)' }}>
          <span className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
          <span className="display" style={{ fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Loading character…
          </span>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="page-wrap">
        <Navbar />
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1.5rem', padding:'3rem' }}>
          <div className="alert alert-error">{loadError}</div>
          <Link to="/dashboard" className="btn btn-ghost">← Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrap">
      <Navbar />

      <main className="sheet-main">
        <div className="container">

          {/* ── Page header ── */}
          <div className="sheet-header fade-up">
            <div className="sheet-header-left">
              <Link to="/dashboard" className="back-link">← Roster</Link>
              <div>
                <p className="display sheet-eyebrow">
                  {isNew ? 'New Character' : 'Character Sheet'}
                </p>
                <h1 className="display sheet-title">
                  {character.name || <span className="sheet-title-placeholder">Unnamed</span>}
                </h1>
              </div>
            </div>
            <div className="sheet-header-right">
              <SaveStatus status={saveStatus} />
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving'
                  ? <><span className="spinner" /> Saving…</>
                  : isNew ? 'Create Character' : 'Save'}
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="sheet-tabs fade-up-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`sheet-tab ${activeTab === tab.id ? 'sheet-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab panels ── */}
          <div className="sheet-panel card fade-up-3">
            {activeTab === 'identity' && (
              <IdentityTab
                data={character}
                onChange={updateField}
              />
            )}
            {activeTab === 'attributes' && (
              <AttributesTab
                data={character}
                onChange={updateField}
              />
            )}
            {activeTab === 'skills' && (
              <SkillsTab
                skills={character.skills}
                onChange={skills => updateField('skills', skills)}
              />
            )}
            {activeTab === 'combat' && (
              <CombatTab
                data={character}
                onChange={updateField}
              />
            )}
            {activeTab === 'inventory' && (
              <InventoryTab
                inventory={character.inventory}
                onChange={inv => updateField('inventory', inv)}
              />
            )}
            {activeTab === 'dice' && (
              <DiceRoller
                skills={character.skills}
                onRecordResult={(skillIdOrName, category) => {
                  const countKey = category.toLowerCase() + 'Count'
                  const updated = character.skills.map(s =>
                    (s._id === skillIdOrName || s.name === skillIdOrName)
                      ? { ...s, [countKey]: (s[countKey] ?? 0) + 1 }
                      : s
                  )
                  updateField('skills', updated)
                }}
              />
            )}
          </div>

          {/* ── Bottom save bar (visible when dirty) ── */}
          {isDirty && (
            <div className="bottom-save-bar">
              <span className="text-mist" style={{ fontSize: '0.88rem' }}>
                You have unsaved changes.
              </span>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? <><span className="spinner" /> Saving…</> : 'Save Now'}
              </button>
            </div>
          )}

        </div>
      </main>

      <style>{`
        /* Layout */
        .sheet-main { padding: 2rem 0 6rem; flex: 1; }

        /* Header */
        .sheet-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .sheet-header-left { display: flex; flex-direction: column; gap: 0.25rem; }
        .sheet-header-right { display: flex; align-items: center; gap: 1rem; }
        .back-link {
          font-family: var(--font-display);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
          transition: color var(--transition);
        }
        .back-link:hover { color: var(--ember2); }
        .sheet-eyebrow {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ember2);
        }
        .sheet-title {
          font-size: 1.8rem;
          color: var(--parchment);
          line-height: 1.1;
        }
        .sheet-title-placeholder { color: var(--ash3); font-style: italic; }
        .save-status {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 0.3s;
        }

        /* Tabs */
        .sheet-tabs {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--ash3);
          overflow-x: auto;
          padding-bottom: 0;
          scrollbar-width: none;
        }
        .sheet-tabs::-webkit-scrollbar { display: none; }
        .sheet-tab {
          font-family: var(--font-display);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
          background: transparent;
          border: none;
          padding: 0.65rem 1.1rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          white-space: nowrap;
          transition: color var(--transition), border-color var(--transition);
        }
        .sheet-tab:hover { color: var(--parchment2); }
        .sheet-tab--active {
          color: var(--ember2);
          border-bottom-color: var(--ember);
        }

        /* Panel */
        .sheet-panel { min-height: 400px; }

        /* Tab content shared layout helpers */
        .tab-content { display: flex; flex-direction: column; }
        .section-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .section-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }

        /* Bottom save bar */
        .bottom-save-bar {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--ash);
          border: 1px solid var(--ember);
          border-radius: var(--radius-lg);
          padding: 0.75rem 1.25rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          animation: fadeUp 0.3s ease;
          z-index: 40;
        }

        @media (max-width: 600px) {
          .sheet-header { align-items: flex-start; flex-direction: column; }
          .sheet-header-right { width: 100%; justify-content: space-between; }
          .section-grid-2,
          .section-grid-3 { grid-template-columns: 1fr; }
          .sheet-title { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  )
}