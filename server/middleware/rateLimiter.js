import rateLimit from 'express-rate-limit'

const isTest = process.env.NODE_ENV === 'test'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10_000 : 20, // effectively unlimited in test
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})