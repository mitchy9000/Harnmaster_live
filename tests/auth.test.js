import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../server/index.js'

// MongoMemoryServer downloads a binary on first run — allow plenty of time
jest.setTimeout(120_000)

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ instance: { startupTimeout: 120_000 } })
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

beforeEach(async () => {
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({})
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const testUser = {
  username: 'testuser',
  email:    'test@example.com',
  password: 'password123',
}

async function registerUser(overrides = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({ ...testUser, ...overrides })
}

// ── Register ──────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201 with user object', async () => {
    const res = await registerUser()
    expect(res.status).toBe(201)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.email).toBe(testUser.email)
    expect(res.body.user.password).toBeUndefined()
  })

  it('sets an httpOnly cookie on successful register', async () => {
    const res = await registerUser()
    const cookie = res.headers['set-cookie']?.[0] ?? ''
    expect(cookie).toMatch(/token=/)
    expect(cookie).toMatch(/HttpOnly/i)
  })

  it('returns 409 when email is already taken', async () => {
    await registerUser()
    const res = await registerUser({ username: 'otheruser' })
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/email/i)
  })

  it('returns 409 when username is already taken', async () => {
    await registerUser()
    const res = await registerUser({ email: 'other@example.com' })
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/username/i)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await registerUser({ email: 'not-an-email' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when password is too short', async () => {
    const res = await registerUser({ password: 'short' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({})
    expect(res.status).toBe(400)
    expect(res.body.details).toBeDefined()
  })
})

// ── Login ─────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await registerUser()
  })

  it('logs in with correct credentials and returns 200', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(testUser.email)
    expect(res.body.user.password).toBeUndefined()
  })

  it('sets an httpOnly cookie on successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
    const cookie = res.headers['set-cookie']?.[0] ?? ''
    expect(cookie).toMatch(/token=/)
    expect(cookie).toMatch(/HttpOnly/i)
  })

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: testUser.password })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/invalid email or password/i)
  })

  it('returns 400 for missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
  })
})

// ── Logout ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears the token cookie', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/logged out/i)
    const cookie = res.headers['set-cookie']?.[0] ?? ''
    expect(cookie).toMatch(/token=;|token=(?:;| Max-Age=0)/i)
  })
})

// ── Get Me ────────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns the authenticated user when a valid cookie is sent', async () => {
    const registerRes = await registerUser()
    const cookie = registerRes.headers['set-cookie']
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(testUser.email)
  })

  it('returns 401 when no cookie is sent', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})