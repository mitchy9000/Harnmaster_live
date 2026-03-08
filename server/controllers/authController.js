import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

const COOKIE_NAME = 'token'

/**
 * Sign a JWT and attach it as an httpOnly cookie on the response.
 * Secure in production, SameSite=Strict to prevent CSRF.
 * The token never touches localStorage.
 */
function issueTokenCookie(res, userId) {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
  })
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body already validated + sanitised by validate(registerSchema) middleware.
 */
export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body

    // Check for duplicates with specific error messages
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with that email already exists.' })
    }

    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(409).json({ error: 'That username is already taken.' })
    }

    // Create user — password is hashed by the pre-save hook in User model
    const user = await User.create({ username, email, password })

    issueTokenCookie(res, user._id)
    return res.status(201).json({ user })

  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/login
 * Body already validated + sanitised by validate(loginSchema) middleware.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    // Deliberately vague error — prevents account enumeration attacks
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    // toJSON() on User strips the password field before sending
    issueTokenCookie(res, user._id)
    return res.status(200).json({ user })

  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/logout
 * Clears the auth cookie — no request body needed.
 */
export function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
  return res.status(200).json({ message: 'Logged out successfully.' })
}

/**
 * GET /api/auth/me
 * requireAuth middleware already verified the JWT and set req.userId.
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    return res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}