# Initial Project Ideas

## Overview

Early brainstorming notes for the HârnMaster Character Manager.

---

## Problem to Solve

HârnMaster 3rd Edition uses paper character sheets that are difficult to manage
during play. Calculations for derived stats, dice-roll tracking, and injury
management are error-prone on paper. A digital tool would:

- Automate derived value calculations (endurance, universal penalty, etc.)
- Log every skill roll result (CS/MS/MF/CF) to enable advancement tracking
- Persist characters across sessions via cloud storage

---

## Initial Ideas Considered

### Idea 1 — Static Single-Page App
A pure-browser app storing characters in `localStorage`.

**Pros:** No backend, easy to host on GitHub Pages.  
**Cons:** No account system; data lost if browser storage is cleared; no
sharing between devices.

### Idea 2 — Google Sheets / Spreadsheet Integration
Export a template sheet and use Google Sheets API to sync data.

**Pros:** Familiar spreadsheet interface.  
**Cons:** Complex OAuth flow; limited control over UX; offline capability poor.

### Idea 3 — Full-Stack Web App (selected)
React frontend + Express/MongoDB backend with JWT authentication.

**Pros:** Full control over UX; persistent cloud storage; user accounts
enable multiple characters per user; deployable as a single Render service.  
**Cons:** Requires a backend and a database, adding setup complexity.

---

## Core Features Identified

| Priority | Feature                                    |
|----------|--------------------------------------------|
| P0       | User registration and login                |
| P0       | Create / read / update / delete characters |
| P0       | Attribute display and editing              |
| P1       | Skills with Mastery Level and dice roller  |
| P1       | Combat stats tab                           |
| P2       | Injury tracking                            |
| P2       | Inventory management                       |
| P3       | Psionics / Shek-Pvari tab                  |
| P3       | Public character sharing                   |

---

## Technology Decisions

| Decision              | Choice         | Reason                                      |
|-----------------------|----------------|---------------------------------------------|
| Frontend framework    | React 19       | Component model fits tabbed character sheet |
| Routing               | React Router 7 | SPA navigation between pages and tabs       |
| Build tool            | Vite 7         | Fast HMR during development                 |
| Backend framework     | Express 5      | Minimal, well-known, easy to deploy         |
| ODM / Database        | Mongoose / MongoDB | Flexible schema; Atlas free tier           |
| Authentication        | JWT (httpOnly cookies) | Stateless; CSRF-resistant cookies    |
| Deployment            | Render.com     | Free tier; auto-deploys from GitHub         |
| Testing               | Jest + Supertest | Lightweight; in-memory DB via `mongodb-memory-server` |
