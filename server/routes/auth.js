import { Router } from 'express'
import { authLimiter } from '../middleware/rateLimiter.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/Validate.js'
import { registerSchema, loginSchema } from '../validators/authValidator.js'
import { register, login, logout, getMe } from '../controllers/authController.js'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login',    authLimiter, validate(loginSchema),    login)
router.post('/logout',   logout)
router.get('/me',        requireAuth, getMe)

export default router