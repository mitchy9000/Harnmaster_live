import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/Validate.js'
import { createCharacterSchema, updateCharacterSchema } from '../validators/characterValidator.js'
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '../controllers/characterController.js'

const router = Router()

// All character routes require a valid JWT cookie
router.use(requireAuth)

router.get('/',       getCharacters)
router.post('/',      validate(createCharacterSchema), createCharacter)
router.get('/:id',    getCharacter)
router.put('/:id',    validate(updateCharacterSchema), updateCharacter)
router.delete('/:id', deleteCharacter)

export default router