import mongoose from 'mongoose'

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const attributeSchema = new mongoose.Schema({
  base:     { type: Number, default: 0 },
  current:  { type: Number, default: 0 },
}, { _id: false })

const skillSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  sunsignBonus:  { type: Number, default: 0 },
  masteryLevel:  { type: Number, default: 0 },   // ML — the roll-under target
  // Track result counters for advancement
  csCount:       { type: Number, default: 0 },   // Critical Successes
  msCount:       { type: Number, default: 0 },   // Marginal Successes
  mfCount:       { type: Number, default: 0 },   // Marginal Failures
  cfCount:       { type: Number, default: 0 },   // Critical Failures
  notes:         { type: String, default: '' },
}, { _id: true })

const inventoryItemSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  qty:       { type: Number, default: 1 },
  weight:    { type: Number, default: 0 },       // in lbs
  location:  { type: String, default: 'carried' },
  notes:     { type: String, default: '' },
}, { _id: true })

// ── Main character schema ─────────────────────────────────────────────────────

const characterSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // ── Identity
  name:        { type: String, required: true, trim: true },
  player:      { type: String, default: '' },
  sunsign:     { type: String, default: '' },
  birthdate:   { type: String, default: '' },
  deity:       { type: String, default: '' },
  sex:         { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  age:         { type: Number, default: 0 },
  height:      { type: Number, default: 0 }, // inches
  weight:      { type: Number, default: 0 }, // lbs
  appearance:  { type: String, default: '' },

  // ── Attributes (HarnMaster 3e core eight + derived)
  attributes: {
    STR: { ...attributeSchema.obj },  // Strength
    STA: { ...attributeSchema.obj },  // Stamina
    DEX: { ...attributeSchema.obj },  // Dexterity
    AGI: { ...attributeSchema.obj },  // Agility
    INT: { ...attributeSchema.obj },  // Intelligence
    AUR: { ...attributeSchema.obj },  // Aura
    WIL: { ...attributeSchema.obj },  // Will
    EYE: { ...attributeSchema.obj },  // Eyesight
    HRG: { ...attributeSchema.obj },  // Hearing
    SME: { ...attributeSchema.obj },  // Smell
    VOI: { ...attributeSchema.obj },  // Voice
    CML: { ...attributeSchema.obj },  // Comeliness
  },

  // ── Derived values (computed, stored for quick access)
  endurance:        { type: Number, default: 0 },
  move:             { type: Number, default: 0 },
  universalPenalty: { type: Number, default: 0 },
  physicalPenalty:  { type: Number, default: 0 },

  // ── Skills
  skills: [skillSchema],

  // ── Combat
  combat: {
    initiative:   { type: Number, default: 0 },
    dodge:        { type: Number, default: 0 },
    weaponSkills: [{ name: String, ml: Number }],
  },

  // ── Injuries / wounds
  injuries: [{
    location:  { type: String },
    severity:  { type: String, enum: ['M1','M2','M3','S1','S2','S3','G1','G2','G3',''] },
    effect:    { type: String, default: '' },
    healed:    { type: Boolean, default: false },
  }],

  // ── Psionics / Shek-Pvari (optional)
  psionics: {
    enabled:   { type: Boolean, default: false },
    auraScore: { type: Number, default: 0 },
    talents:   [{ name: String, ml: Number }],
  },

  // ── Inventory
  inventory: [inventoryItemSchema],

  // ── Misc
  notes:     { type: String, default: '' },
  isPublic:  { type: Boolean, default: false },

}, { timestamps: true })

export default mongoose.model('Character', characterSchema)