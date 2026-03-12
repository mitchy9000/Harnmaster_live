# Data Model

## HârnMaster Character Manager — MongoDB Collections

---

## 1. Users Collection (`User` model — `server/models/User.js`)

Stores account credentials. Passwords are **never** stored in plain text.

| Field       | Type     | Required | Constraints                        | Notes                          |
|-------------|----------|----------|------------------------------------|--------------------------------|
| `_id`       | ObjectId | auto     | —                                  | MongoDB primary key            |
| `username`  | String   | Yes      | unique, trim, 3–30 chars           | Used for login display         |
| `email`     | String   | Yes      | unique, lowercase, trim            | Used for login                 |
| `password`  | String   | Yes      | min 8 chars                        | bcryptjs hash (12 rounds)      |
| `createdAt` | Date     | auto     | —                                  | Mongoose timestamps            |
| `updatedAt` | Date     | auto     | —                                  | Mongoose timestamps            |

### Behaviour

- `pre('save')` hook hashes `password` whenever it is modified.
- `comparePassword(candidate)` instance method verifies a plain-text password.
- `toJSON()` removes the `password` field from all API responses.

---

## 2. Characters Collection (`Character` model — `server/models/Character.js`)

One document per character. All sub-documents are embedded (no separate
collections for skills, inventory, etc.).

### 2.1 Top-level Fields

| Field              | Type     | Required | Notes                               |
|--------------------|----------|----------|-------------------------------------|
| `_id`              | ObjectId | auto     | MongoDB primary key                 |
| `owner`            | ObjectId | Yes      | Ref: `User._id`; indexed            |
| `name`             | String   | Yes      | Character name; trimmed             |
| `player`           | String   | No       | Player's real name                  |
| `sunsign`          | String   | No       | HârnMaster birth-sign               |
| `birthdate`        | String   | No       | Free-form date string               |
| `deity`            | String   | No       | Patron deity                        |
| `sex`              | String   | No       | Enum: `Male`, `Female`, `Other`, `` |
| `age`              | Number   | No       | Years                               |
| `height`           | Number   | No       | Inches                              |
| `weight`           | Number   | No       | Pounds                              |
| `appearance`       | String   | No       | Free-form description               |
| `endurance`        | Number   | No       | Derived; stored for quick access    |
| `move`             | Number   | No       | Derived; stored for quick access    |
| `universalPenalty` | Number   | No       | Derived from active injuries        |
| `physicalPenalty`  | Number   | No       | Derived from active injuries        |
| `notes`            | String   | No       | Free-form character notes           |
| `isPublic`         | Boolean  | No       | Future sharing feature              |
| `createdAt`        | Date     | auto     | Mongoose timestamps                 |
| `updatedAt`        | Date     | auto     | Mongoose timestamps                 |

### 2.2 Attributes Sub-document (`attributes`)

Twelve HârnMaster core attributes, each with `base` and `current` values.

| Key   | Meaning       |
|-------|---------------|
| `STR` | Strength      |
| `STA` | Stamina       |
| `DEX` | Dexterity     |
| `AGI` | Agility       |
| `INT` | Intelligence  |
| `AUR` | Aura          |
| `WIL` | Will          |
| `EYE` | Eyesight      |
| `HRG` | Hearing       |
| `SME` | Smell         |
| `VOI` | Voice         |
| `CML` | Comeliness    |

Each attribute: `{ base: Number, current: Number }` (defaults `0`).

### 2.3 Skills Array (`skills[]`)

Each element is a sub-document with its own `_id`.

| Field          | Type   | Notes                                              |
|----------------|--------|----------------------------------------------------|
| `name`         | String | Skill name (required)                              |
| `sunsignBonus` | Number | Bonus from character's sunsign                     |
| `masteryLevel` | Number | ML — the roll-under target for dice rolls          |
| `csCount`      | Number | Critical Success rolls (used for advancement)      |
| `msCount`      | Number | Marginal Success rolls                             |
| `mfCount`      | Number | Marginal Failure rolls                             |
| `cfCount`      | Number | Critical Failure rolls                             |
| `notes`        | String | Free-form notes                                    |

### 2.4 Combat Sub-document (`combat`)

| Field          | Type                       | Notes                      |
|----------------|----------------------------|----------------------------|
| `initiative`   | Number                     | Initiative score           |
| `dodge`        | Number                     | Dodge score                |
| `weaponSkills` | `[{ name: String, ml: Number }]` | Weapon name + ML     |

### 2.5 Injuries Array (`injuries[]`)

| Field      | Type    | Notes                                                        |
|------------|---------|--------------------------------------------------------------|
| `location` | String  | Body location (e.g. "Right Arm")                             |
| `severity` | String  | Enum: `M1`–`M3`, `S1`–`S3`, `G1`–`G3`, or `""` (Minor/Serious/Grievous) |
| `effect`   | String  | Free-form effect description                                 |
| `healed`   | Boolean | `true` once the injury is resolved                           |

### 2.6 Psionics Sub-document (`psionics`)

Stub for the Shek-Pvari magic system (not yet exposed in the UI).

| Field       | Type                       | Notes                    |
|-------------|----------------------------|--------------------------|
| `enabled`   | Boolean                    | Whether psionics are active |
| `auraScore` | Number                     | Psionic aura value       |
| `talents`   | `[{ name: String, ml: Number }]` | Psionic talent + ML |

### 2.7 Inventory Array (`inventory[]`)

| Field      | Type   | Notes                                          |
|------------|--------|------------------------------------------------|
| `name`     | String | Item name (required)                           |
| `qty`      | Number | Quantity (default 1)                           |
| `weight`   | Number | Weight in pounds                               |
| `location` | String | Where item is kept (default `"carried"`)       |
| `notes`    | String | Free-form notes                                |

---

## 3. Entity-Relationship Summary

```
User (1) ──── owns ────► (N) Character
                               │
                               ├── attributes  (embedded object)
                               ├── skills[]    (embedded array)
                               ├── combat      (embedded object)
                               │     └── weaponSkills[]
                               ├── injuries[]  (embedded array)
                               ├── psionics    (embedded object)
                               │     └── talents[]
                               └── inventory[] (embedded array)
```

All character data is embedded in a single document for simplicity and
atomic updates. No joins are required; a single `findById` returns the
complete character.

---

## 4. Indexes

| Collection   | Field(s)            | Type   | Purpose                          |
|--------------|---------------------|--------|----------------------------------|
| `users`      | `username`          | unique | Login lookup, duplicate guard    |
| `users`      | `email`             | unique | Login lookup, duplicate guard    |
| `characters` | `owner`             | index  | Fast retrieval of user's characters |
