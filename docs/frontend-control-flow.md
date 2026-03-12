# Frontend Control Flow

## HârnMaster Character Manager — React Application

---

## 1. Application Routes

Defined in `src/App.jsx` using React Router 7.

| Path                  | Component          | Auth required |
|-----------------------|--------------------|---------------|
| `/`                   | `Home`             | No            |
| `/login`              | `Login`            | No            |
| `/register`           | `Register`         | No            |
| `/dashboard`          | `Dashboard`        | Yes (JWT)     |
| `/characters/:id`     | `CharacterSheet`   | Yes (JWT)     |

Protected routes are wrapped by `PrivateRoute`, which redirects to `/login` if
no authenticated user is present in `AuthContext`.

---

## 2. Auth Context (`src/context/AuthContext.jsx`)

Global state for the logged-in user. Consumed by every page and by `PrivateRoute`.

```
App starts
    │
    ▼
AuthProvider mounts
    │
    ├─ GET /api/auth/me ──► success → set user state
    │                       fail    → user = null
    │
    └─ exposes: { user, loading, login(), logout() }
```

All components call `useAuth()` to access these values.

---

## 3. Page-Level Control Flow

### 3.1 Home (`/`)

```
Unauthenticated:  show landing page → links to /login and /register
Authenticated:    redirect to /dashboard
```

### 3.2 Register (`/register`)

```
User fills form (username, email, password)
    │
    ▼
POST /api/auth/register
    ├─ 201 Created → auto-login → redirect to /dashboard
    └─ 4xx Error   → display validation message
```

### 3.3 Login (`/login`)

```
User fills form (username, password)
    │
    ▼
POST /api/auth/login
    ├─ 200 OK → set JWT cookie → update AuthContext → redirect to /dashboard
    └─ 401    → display "Invalid credentials"
```

### 3.4 Dashboard (`/dashboard`)  *(requires auth)*

```
Mount
    │
    ├─ GET /api/characters → render character cards
    │
    ├─ "New Character" button
    │       │
    │       ▼
    │   POST /api/characters (name required)
    │       └─ 201 → re-fetch list → display new card
    │
    └─ Character card click → navigate to /characters/:id
       Character card delete
               │
               ▼
           DELETE /api/characters/:id → re-fetch list
```

### 3.5 Character Sheet (`/characters/:id`)  *(requires auth)*

```
Mount
    │
    ├─ GET /api/characters/:id → populate local state
    │
    └─ Tabbed interface
            │
            ├─ Identity Tab      → edit name/player/sunsign/etc.
            ├─ Attributes Tab    → edit base + current for 12 attributes
            ├─ Skills Tab        → add/edit skills; DiceRoller component
            ├─ Combat Tab        → initiative, dodge, weapon skills
            └─ Inventory Tab     → item list (add/edit/remove)

     Any change → PUT /api/characters/:id (debounced or on blur)
```

---

## 4. Shared Components

### Navbar (`src/components/common/Navbar.jsx`)

Rendered on every page.

```
Unauthenticated: Logo | Login | Register
Authenticated:   Logo | Dashboard | Logout button
                            │
                        POST /api/auth/logout
                            └─ clear AuthContext → redirect to /
```

### PrivateRoute (`src/components/common/PrivateRoute.jsx`)

```
AuthContext.loading === true  → render loading spinner
user !== null                 → render <Outlet />  (the protected page)
user === null                 → <Navigate to="/login" replace />
```

### DiceRoller (`src/components/character/DiceRoller.jsx`)

Standalone dice-roll widget used inside the Skills Tab.

```
User inputs Mastery Level (ML)
    │
    ▼
rollVsML(ml)  [src/utils/harnmasterDice.js]
    │
    ▼
Display:  roll value, CS/MS/MF/CF category, colour-coded label
```

---

## 5. Frontend Service Layer (`src/services/`)

All HTTP calls go through an Axios instance configured in `src/services/api.js`:

- Base URL: `/api`
- `withCredentials: true` — includes the httpOnly JWT cookie automatically

`characterService.js` wraps each character endpoint with typed functions
(`getCharacters`, `getCharacter`, `createCharacter`, `updateCharacter`,
`deleteCharacter`).

---

## 6. State Management Summary

| Data          | Location                      | Persistence               |
|---------------|-------------------------------|---------------------------|
| Auth user     | `AuthContext` (React context) | Rehydrated on page load   |
| Character list| `Dashboard` component state   | Re-fetched on mount       |
| Character doc | `CharacterSheet` component state | Re-fetched on mount    |
| Dice results  | `DiceRoller` component state  | Local only (not saved)    |
