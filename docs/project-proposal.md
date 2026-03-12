# Project Proposal

## HârnMaster Character Manager

---

## 1. Problem Statement

HârnMaster 3rd Edition (Columbia Games Inc.) is a tabletop RPG with rich, detailed
character mechanics. Players maintain paper sheets that require significant manual
calculation for attributes, skills, combat values, and injury effects. Existing
generic character-sheet tools do not support the HârnMaster-specific dice mechanic
(percentile roll vs. Mastery Level with CS/MS/MF/CF result categories) or the
sunsign-bonus system.

---

## 2. Proposed Solution

A full-stack, cloud-hosted character manager that lets players:

1. **Create and store** HârnMaster characters in a personal account.
2. **Track attributes** (STR, STA, DEX, AGI, INT, AUR, WIL, EYE, HRG, SME, VOI, CML)
   with automatic derived-value calculation (endurance, move, penalties).
3. **Roll dice** using the correct HârnMaster mechanic and automatically record
   CS/MS/MF/CF results against each skill for future advancement checks.
4. **Manage combat**, injuries, and inventory in a single tabbed interface.

---

## 3. Scope

### In Scope

- User authentication (register, login, logout) with JWT via httpOnly cookies
- Full CRUD for characters (create, read-list, read-single, update, delete)
- Attribute editing for all 12 core attributes (base and current values)
- Skills management with dice roller and result tracking
- Combat stats (initiative, dodge, weapon skills)
- Injury log with severity codes (M1–G3) and healed flag
- Inventory list with name, quantity, weight, location, and notes
- Deployment on Render.com with MongoDB Atlas (free tier)

### Out of Scope (future versions)

- Public character sharing (model field `isPublic` exists but UI is not built)
- GM tools (encounter tracker, campaign management)
- Mobile native application
- HârnMaster magic system (Shek-Pvari) — data model stub exists; UI is not built

---

## 4. Technical Architecture

```
Browser (React 19 / Vite 7)
        │  HTTPS, JSON
        ▼
Express 5 REST API  (/api/*)
        │  Mongoose ODM
        ▼
MongoDB Atlas (cloud database)
```

**Deployment:** Single Render Web Service serves both the compiled Vite assets and
the Express API. No separate CDN or static host is needed.

---

## 5. API Overview

| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| POST   | /api/auth/register     | Create account (rate-limited)      |
| POST   | /api/auth/login        | Authenticate and set JWT cookie    |
| POST   | /api/auth/logout       | Clear JWT cookie                   |
| GET    | /api/auth/me           | Return current user (requires JWT) |
| GET    | /api/characters        | List all characters for user       |
| POST   | /api/characters        | Create a new character             |
| GET    | /api/characters/:id    | Get a single character             |
| PUT    | /api/characters/:id    | Update a character                 |
| DELETE | /api/characters/:id    | Delete a character                 |
| GET    | /health                | Health check (returns status/env)  |

---

## 6. Data Storage

Two MongoDB collections:

- **users** — `username`, `email`, hashed `password`, timestamps
- **characters** — full character document (see `docs/data-model.md`) linked
  to a user via `owner` ObjectId reference

---

## 7. Security Considerations

| Concern              | Mitigation                                          |
|----------------------|-----------------------------------------------------|
| Password storage     | bcryptjs with 12 rounds                             |
| Session management   | JWT in httpOnly cookie (not accessible from JS)     |
| Input validation     | Joi schemas on every mutating endpoint              |
| Rate limiting        | 10 register/login requests per 15 minutes per IP   |
| HTTP headers         | Helmet with strict CSP                              |
| CORS                 | Restricted to `CLIENT_ORIGIN` env var               |

---

## 8. Testing Plan

- **Unit / integration tests:** Jest + Supertest against `mongodb-memory-server`
- **Coverage targets:** Authentication flow (register/login/logout/me) and
  character CRUD (create, list, get, update, delete) — see `tests/`

---

## 9. Timeline

| Week | Milestone                                              |
|------|--------------------------------------------------------|
| 1    | Project scaffolding, auth backend + tests              |
| 2    | Character model, CRUD API + tests                      |
| 3    | React frontend: auth pages, dashboard, character sheet |
| 4    | Dice roller, skills tab, combat tab                    |
| 5    | Injury and inventory tabs, deployment to Render        |
| 6    | Polish, final testing, documentation                   |
