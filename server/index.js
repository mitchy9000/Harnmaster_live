import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { connectDB } from './config/db.js'

import authRoutes      from './routes/auth.js'
import characterRoutes from './routes/characters.js'
import { errorHandler } from './middleware/errorHandler.js'

const isProd    = process.env.NODE_ENV === 'production'
const isTest    = process.env.NODE_ENV === 'test'
const __dirname = dirname(fileURLToPath(import.meta.url))

export const app = express()

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: isProd
    ? {
        directives: {
          defaultSrc:  ["'self'"],
          scriptSrc:   ["'self'"],
          styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
          imgSrc:      ["'self'", 'data:'],
          connectSrc:  ["'self'"],
          objectSrc:   ["'none'"],
          upgradeInsecureRequests: [],
        },
      }
    : false,
}))

app.use(cors({
  origin: isProd
    ? (process.env.CLIENT_ORIGIN || false)
    : 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Utility routes ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV })
)

app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) =>
  res.status(204).end()
)

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/characters', characterRoutes)

// ── Serve React build in production ──────────────────────────────────────────
if (isProd) {
  const distPath = join(__dirname, '..', 'dist')
  app.use(express.static(distPath, { maxAge: '1y', etag: true }))
  app.use((_req, res) => res.sendFile(join(distPath, 'index.html')))
}

app.use(errorHandler)

// ── Start server — skipped entirely when NODE_ENV=test ────────────────────────
// Tests supply their own MongoMemoryServer connection; we must not open a
// competing Atlas connection or bind a port that Supertest doesn't need.
if (!isTest) {
  const PORT = process.env.PORT || 3001
  connectDB()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () =>
        console.log(`[server] running on port ${PORT} (${process.env.NODE_ENV})`)
      )
    })
    .catch(err => {
      console.error('[server] DB connection failed:', err.message)
      process.exit(1)
    })
}

export default app