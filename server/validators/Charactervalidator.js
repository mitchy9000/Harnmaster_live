import Joi from 'joi'

// ── Reusable sub-schemas ──────────────────────────────────────────────────────

const attribute = Joi.object({
  base:    Joi.number().integer().min(0).max(20).default(0),
  current: Joi.number().integer().min(0).max(20).default(0),
})

const skill = Joi.object({
  name:         Joi.string().trim().max(60).required(),
  sunsignBonus: Joi.number().integer().min(-10).max(10).default(0),
  masteryLevel: Joi.number().integer().min(0).max(100).default(0),
  csCount:      Joi.number().integer().min(0).default(0),
  msCount:      Joi.number().integer().min(0).default(0),
  mfCount:      Joi.number().integer().min(0).default(0),
  cfCount:      Joi.number().integer().min(0).default(0),
  notes:        Joi.string().max(500).allow('').default(''),
})

const inventoryItem = Joi.object({
  name:     Joi.string().trim().max(80).required(),
  qty:      Joi.number().integer().min(0).default(1),
  weight:   Joi.number().min(0).default(0),
  location: Joi.string().max(60).allow('').default('carried'),
  notes:    Joi.string().max(500).allow('').default(''),
})

const injury = Joi.object({
  location: Joi.string().max(60).allow('').default(''),
  severity: Joi.string()
    .valid('M1','M2','M3','S1','S2','S3','G1','G2','G3','')
    .default(''),
  effect:   Joi.string().max(300).allow('').default(''),
  healed:   Joi.boolean().default(false),
})

const attributes = Joi.object({
  STR: attribute.default(),
  STA: attribute.default(),
  DEX: attribute.default(),
  AGI: attribute.default(),
  INT: attribute.default(),
  AUR: attribute.default(),
  WIL: attribute.default(),
  EYE: attribute.default(),
  HRG: attribute.default(),
  SME: attribute.default(),
  VOI: attribute.default(),
  CML: attribute.default(),
}).default()

// ── Create — name is the only required field ──────────────────────────────────

export const createCharacterSchema = Joi.object({
  name:       Joi.string().trim().min(1).max(80).required(),
  player:     Joi.string().max(80).allow('').default(''),
  sunsign:    Joi.string().max(40).allow('').default(''),
  birthdate:  Joi.string().max(40).allow('').default(''),
  deity:      Joi.string().max(60).allow('').default(''),
  sex:        Joi.string().valid('Male','Female','Other','').default(''),
  age:        Joi.number().integer().min(0).max(999).default(0),
  height:     Joi.number().min(0).max(120).default(0),
  weight:     Joi.number().min(0).max(1000).default(0),
  appearance: Joi.string().max(1000).allow('').default(''),

  attributes: attributes,

  endurance:        Joi.number().integer().min(0).default(0),
  move:             Joi.number().min(0).default(0),
  universalPenalty: Joi.number().integer().min(0).default(0),
  physicalPenalty:  Joi.number().integer().min(0).default(0),

  skills:    Joi.array().items(skill).default([]),

  combat: Joi.object({
    initiative:   Joi.number().integer().min(0).default(0),
    dodge:        Joi.number().integer().min(0).max(100).default(0),
    weaponSkills: Joi.array().items(
      Joi.object({ name: Joi.string().max(60), ml: Joi.number().integer().min(0).max(100) })
    ).default([]),
  }).default(),

  injuries:  Joi.array().items(injury).default([]),

  psionics: Joi.object({
    enabled:   Joi.boolean().default(false),
    auraScore: Joi.number().integer().min(0).max(20).default(0),
    talents:   Joi.array().items(
      Joi.object({ name: Joi.string().max(60), ml: Joi.number().integer().min(0).max(100) })
    ).default([]),
  }).default(),

  inventory: Joi.array().items(inventoryItem).default([]),

  notes:    Joi.string().max(5000).allow('').default(''),
  isPublic: Joi.boolean().default(false),
})

// ── Update — everything optional (PATCH semantics via PUT) ────────────────────

export const updateCharacterSchema = createCharacterSchema.fork(
  ['name'], // make name optional on update
  field => field.optional()
)