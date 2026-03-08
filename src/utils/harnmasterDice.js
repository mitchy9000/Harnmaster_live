/**
 * HarnMaster 3e Dice Utilities
 *
 * Core mechanic: roll d100 (open-ended percentile) against a Mastery Level (ML)
 *   CS  Critical Success  — roll ≤ floor(ML / 20) × 5  (i.e. top 5% of successes)
 *   MS  Marginal Success  — roll ≤ ML (but > CS threshold)
 *   MF  Marginal Failure  — roll > ML (but < CF threshold)
 *   CF  Critical Failure  — roll ≥ 96 (or roll > 95 when ML ≥ 95)
 */

/** Roll a single d6 */
export const d6 = () => Math.floor(Math.random() * 6) + 1

/** Roll a single d100 (percentile, 1–100) */
export const d100 = () => Math.floor(Math.random() * 100) + 1

/**
 * Roll against a Mastery Level and return the result category + roll value.
 * @param {number} ml  Mastery Level (1–100+)
 * @returns {{ roll: number, category: 'CS'|'MS'|'MF'|'CF', ml: number }}
 */
export function rollVsML(ml) {
  const roll = d100()
  const csThreshold = Math.floor(ml / 20) * 5 || 5 // minimum 5

  let category
  if (roll >= 96) {
    category = 'CF'
  } else if (roll <= csThreshold) {
    category = 'CS'
  } else if (roll <= ml) {
    category = 'MS'
  } else {
    category = 'MF'
  }

  return { roll, category, ml, csThreshold }
}

/**
 * Roll multiple d6 and sum them (e.g. for damage)
 * @param {number} count  number of dice
 * @returns {{ rolls: number[], total: number }}
 */
export function rollDice(count = 1) {
  const rolls = Array.from({ length: count }, d6)
  return { rolls, total: rolls.reduce((a, b) => a + b, 0) }
}

/** Result label with colour hint for UI */
export const RESULT_LABELS = {
  CS: { label: 'Critical Success',  color: '#4ade80' },
  MS: { label: 'Marginal Success',  color: '#86efac' },
  MF: { label: 'Marginal Failure',  color: '#fca5a5' },
  CF: { label: 'Critical Failure',  color: '#ef4444' },
}