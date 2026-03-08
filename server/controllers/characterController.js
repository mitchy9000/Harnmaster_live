import mongoose from 'mongoose'
import Character from '../models/Character.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validates that :id is a well-formed MongoDB ObjectId before hitting the DB.
 * Returns true if valid, false otherwise.
 */
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * Fetch a character that belongs to the requesting user.
 * Returns null if not found OR if it belongs to someone else (no leaking ids).
 */
async function findOwnedCharacter(id, userId) {
  return Character.findOne({ _id: id, owner: userId })
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/characters
 * Returns a lightweight list of all characters owned by the logged-in user.
 * Only returns fields needed for the dashboard card — not the full document.
 */
export async function getCharacters(req, res, next) {
  try {
    const characters = await Character
      .find({ owner: req.userId })
      .select('name player sunsign sex age updatedAt')
      .sort({ updatedAt: -1 }) // most recently updated first

    return res.status(200).json({ characters })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/characters/:id
 * Returns the full character document.
 */
export async function getCharacter(req, res, next) {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid character ID.' })
    }

    const character = await findOwnedCharacter(id, req.userId)
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' })
    }

    return res.status(200).json({ character })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/characters
 * Creates a new character.
 * Body already validated + sanitised by validate(createCharacterSchema) middleware.
 */
export async function createCharacter(req, res, next) {
  try {
    const character = await Character.create({
      ...req.body,
      owner: req.userId, // always set owner from JWT, never from body
    })

    return res.status(201).json({ character })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/characters/:id
 * Replaces (or deep-merges) a character's data.
 * Body already validated + sanitised by validate(updateCharacterSchema) middleware.
 *
 * We use findOneAndUpdate with { new: true } so we return the updated document.
 * The $set spread means only provided fields are overwritten.
 */
export async function updateCharacter(req, res, next) {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid character ID.' })
    }

    // First confirm ownership (don't let a user overwrite someone else's doc)
    const existing = await findOwnedCharacter(id, req.userId)
    if (!existing) {
      return res.status(404).json({ error: 'Character not found.' })
    }

    // Prevent overwriting the owner field via the request body
    const { owner: _stripped, ...safeBody } = req.body

    const character = await Character.findByIdAndUpdate(
      id,
      { $set: safeBody },
      { returnDocument: 'after', runValidators: true }
    )

    return res.status(200).json({ character })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/characters/:id
 * Permanently deletes a character. Only the owner can do this.
 */
export async function deleteCharacter(req, res, next) {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid character ID.' })
    }

    const character = await findOwnedCharacter(id, req.userId)
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' })
    }

    await character.deleteOne()

    return res.status(200).json({ message: 'Character deleted.' })
  } catch (err) {
    next(err)
  }
}