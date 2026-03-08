import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { app } from '../server/index.js'

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

const userA = { username: 'playerone', email: 'playerone@example.com', password: 'password123' }
const userB = { username: 'playertwo', email: 'playertwo@example.com', password: 'password123' }

async function registerAndGetCookie(user) {
  const res = await request(app).post('/api/auth/register').send(user)
  if (res.status !== 201) {
    throw new Error(`Registration failed (${res.status}): ${JSON.stringify(res.body)}`)
  }
  const cookie = res.headers['set-cookie']
  if (!cookie) throw new Error('No set-cookie header on successful register')
  return cookie
}

const baseCharacter = {
  name:    'Aldric of Kaldor',
  player:  'Test Player',
  sunsign: 'Ulandus',
  sex:     'Male',
  age:     25,
}

const fullCharacter = {
  ...baseCharacter,
  attributes: {
    STR: { base: 12, current: 12 },
    STA: { base: 11, current: 11 },
    DEX: { base: 13, current: 13 },
    AGI: { base: 10, current: 10 },
    INT: { base: 14, current: 14 },
    AUR: { base: 8,  current: 8  },
    WIL: { base: 12, current: 12 },
    EYE: { base: 11, current: 11 },
    HRG: { base: 10, current: 10 },
    SME: { base: 9,  current: 9  },
    VOI: { base: 12, current: 12 },
    CML: { base: 11, current: 11 },
  },
  skills: [
    { name: 'Sword',  sunsignBonus: 2, masteryLevel: 65 },
    { name: 'Riding', sunsignBonus: 0, masteryLevel: 42 },
  ],
  inventory: [
    { name: 'Broadsword', qty: 1, weight: 3.5, location: 'belt' },
    { name: 'Rations',    qty: 5, weight: 1.0, location: 'pack' },
  ],
}

// ── POST /api/characters ──────────────────────────────────────────────────────

describe('POST /api/characters', () => {
  it('creates a character and returns 201', async () => {
    const cookie = await registerAndGetCookie(userA)
    const res = await request(app)
      .post('/api/characters').set('Cookie', cookie).send(baseCharacter)
    expect(res.status).toBe(201)
    expect(res.body.character.name).toBe(baseCharacter.name)
    expect(res.body.character.owner).toBeDefined()
  })

  it('saves all attributes, skills, and inventory', async () => {
    const cookie = await registerAndGetCookie(userA)
    const res = await request(app)
      .post('/api/characters').set('Cookie', cookie).send(fullCharacter)
    expect(res.status).toBe(201)
    expect(res.body.character.attributes.STR.base).toBe(12)
    expect(res.body.character.skills).toHaveLength(2)
    expect(res.body.character.inventory).toHaveLength(2)
  })

  it('ignores any owner field in the request body', async () => {
    const cookie = await registerAndGetCookie(userA)
    const fakeOwnerId = new mongoose.Types.ObjectId().toString()
    const res = await request(app)
      .post('/api/characters').set('Cookie', cookie)
      .send({ ...baseCharacter, owner: fakeOwnerId })
    expect(res.status).toBe(201)
    expect(res.body.character.owner).not.toBe(fakeOwnerId)
  })

  it('returns 400 when name is missing', async () => {
    const cookie = await registerAndGetCookie(userA)
    const res = await request(app)
      .post('/api/characters').set('Cookie', cookie).send({ player: 'No Name' })
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/characters').send(baseCharacter)
    expect(res.status).toBe(401)
  })
})

// ── GET /api/characters ───────────────────────────────────────────────────────

describe('GET /api/characters', () => {
  it('returns only characters owned by the logged-in user', async () => {
    const cookieA = await registerAndGetCookie(userA)
    const cookieB = await registerAndGetCookie(userB)
    await request(app).post('/api/characters').set('Cookie', cookieA).send({ name: 'Char A1' })
    await request(app).post('/api/characters').set('Cookie', cookieA).send({ name: 'Char A2' })
    await request(app).post('/api/characters').set('Cookie', cookieB).send({ name: 'Char B1' })
    const res = await request(app).get('/api/characters').set('Cookie', cookieA)
    expect(res.status).toBe(200)
    expect(res.body.characters).toHaveLength(2)
    res.body.characters.forEach(c => expect(c.name).toMatch(/^Char A/))
  })

  it('returns an empty array when user has no characters', async () => {
    const cookie = await registerAndGetCookie(userA)
    const res = await request(app).get('/api/characters').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.characters).toEqual([])
  })

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/characters')
    expect(res.status).toBe(401)
  })
})

// ── GET /api/characters/:id ───────────────────────────────────────────────────

describe('GET /api/characters/:id', () => {
  it('returns the full character for its owner', async () => {
    const cookie = await registerAndGetCookie(userA)
    const createRes = await request(app)
      .post('/api/characters').set('Cookie', cookie).send(fullCharacter)
    const id = createRes.body.character._id
    const res = await request(app).get(`/api/characters/${id}`).set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.character._id).toBe(id)
    expect(res.body.character.skills).toHaveLength(2)
  })

  it("returns 404 when accessing another user's character", async () => {
    const cookieA = await registerAndGetCookie(userA)
    const cookieB = await registerAndGetCookie(userB)
    const createRes = await request(app)
      .post('/api/characters').set('Cookie', cookieA).send(baseCharacter)
    const id = createRes.body.character._id
    const res = await request(app).get(`/api/characters/${id}`).set('Cookie', cookieB)
    expect(res.status).toBe(404)
  })

  it('returns 400 for a malformed id', async () => {
    const cookie = await registerAndGetCookie(userA)
    const res = await request(app).get('/api/characters/not-a-valid-id').set('Cookie', cookie)
    expect(res.status).toBe(400)
  })

  it('returns 404 for a valid but non-existent id', async () => {
    const cookie = await registerAndGetCookie(userA)
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await request(app).get(`/api/characters/${fakeId}`).set('Cookie', cookie)
    expect(res.status).toBe(404)
  })
})

// ── PUT /api/characters/:id ───────────────────────────────────────────────────

describe('PUT /api/characters/:id', () => {
  it('updates character fields and returns the updated document', async () => {
    const cookie = await registerAndGetCookie(userA)
    const createRes = await request(app)
      .post('/api/characters').set('Cookie', cookie).send(baseCharacter)
    const id = createRes.body.character._id
    const res = await request(app)
      .put(`/api/characters/${id}`).set('Cookie', cookie)
      .send({ name: 'Aldric the Bold', age: 30 })
    expect(res.status).toBe(200)
    expect(res.body.character.name).toBe('Aldric the Bold')
    expect(res.body.character.age).toBe(30)
  })

  it('updates skills array correctly', async () => {
    const cookie = await registerAndGetCookie(userA)
    const createRes = await request(app)
      .post('/api/characters').set('Cookie', cookie).send(fullCharacter)
    const id = createRes.body.character._id
    const updatedSkills = [
      { name: 'Sword',   sunsignBonus: 2, masteryLevel: 70 },
      { name: 'Riding',  sunsignBonus: 0, masteryLevel: 42 },
      { name: 'Stealth', sunsignBonus: 1, masteryLevel: 35 },
    ]
    const res = await request(app)
      .put(`/api/characters/${id}`).set('Cookie', cookie)
      .send({ skills: updatedSkills })
    expect(res.status).toBe(200)
    expect(res.body.character.skills).toHaveLength(3)
    expect(res.body.character.skills[0].masteryLevel).toBe(70)
  })

  it("returns 404 when trying to update another user's character", async () => {
    const cookieA = await registerAndGetCookie(userA)
    const cookieB = await registerAndGetCookie(userB)
    const createRes = await request(app)
      .post('/api/characters').set('Cookie', cookieA).send(baseCharacter)
    const id = createRes.body.character._id
    const res = await request(app)
      .put(`/api/characters/${id}`).set('Cookie', cookieB)
      .send({ name: 'Hacked' })
    expect(res.status).toBe(404)
  })

  it('cannot overwrite the owner field', async () => {
    const cookieA = await registerAndGetCookie(userA)
    const createRes = await request(app)
      .post('/api/characters').set('Cookie', cookieA).send(baseCharacter)
    const id = createRes.body.character._id
    const originalOwner = createRes.body.character.owner
    const fakeOwner = new mongoose.Types.ObjectId().toString()
    await request(app)
      .put(`/api/characters/${id}`).set('Cookie', cookieA)
      .send({ owner: fakeOwner, name: 'Renamed' })
    const check = await request(app).get(`/api/characters/${id}`).set('Cookie', cookieA)
    expect(check.body.character.owner).toBe(originalOwner)
  })
})

// ── DELETE /api/characters/:id ────────────────────────────────────────────────

describe('DELETE /api/characters/:id', () => {
  it('deletes a character and returns 200', async () => {
    const cookie = await registerAndGetCookie(userA)
    const createRes = await request(app)
      .post('/api/characters').set('Cookie', cookie).send(baseCharacter)
    const id = createRes.body.character._id
    const deleteRes = await request(app).delete(`/api/characters/${id}`).set('Cookie', cookie)
    expect(deleteRes.status).toBe(200)
    const getRes = await request(app).get(`/api/characters/${id}`).set('Cookie', cookie)
    expect(getRes.status).toBe(404)
  })

  it("returns 404 when trying to delete another user's character", async () => {
    const cookieA = await registerAndGetCookie(userA)
    const cookieB = await registerAndGetCookie(userB)
    const createRes = await request(app)
      .post('/api/characters').set('Cookie', cookieA).send(baseCharacter)
    const id = createRes.body.character._id
    const res = await request(app).delete(`/api/characters/${id}`).set('Cookie', cookieB)
    expect(res.status).toBe(404)
    const check = await request(app).get(`/api/characters/${id}`).set('Cookie', cookieA)
    expect(check.status).toBe(200)
  })

  it('returns 400 for a malformed id', async () => {
    const cookie = await registerAndGetCookie(userA)
    const res = await request(app).delete('/api/characters/bad-id').set('Cookie', cookie)
    expect(res.status).toBe(400)
  })
})