# Project Plan & Documentation

> **Purpose:** Single source of truth for vision, scope, and implementation. Use this document to drive actual code changes.

---

## 1. Project overview

- **Working title:** Kana Shoot (Japanese Hiragana/Katakana typing game)
- **Description:** Browser-based game: player types **romaji** to shoot matching kana, words, or image targets. Multiple game modes. Content is driven by a simple **Editor (CMS)**. Served by a simple **Express** backend.
- **Target users:** People learning or practicing Japanese hiragana and katakana (including dakuten and handakuten).
- **Architecture:**
  - **Game** — Playable minigame; play area where targets fall; player types romaji and fires. Enriched by editor content.
  - **Editor** — Simple CMS to create and manage: word lists (romaji + kana + optional image, optional English). Focus: simplicity and usability; no fancy UI.

---

## 2. Kana character data (implementation requirement)

- **Current gap:** The project does **not** include **dakuten** (゛) or **handakuten** (゜) characters. These must be added.
- **Implement:**
  - **Dakuten (voiced):** が ぎ ぐ げ ご, ざ じ ず ぜ ぞ, だ ぢ づ で ど, ば び ぶ べ ぼ (hiragana and katakana equivalents).
  - **Handakuten (half-voiced):** ぱ ぴ ぷ ぺ ぽ (hiragana and katakana equivalents).
- **Usage:** Same as base kana: character set options (Hiragana / Katakana / Both / Custom) must include these where applicable; custom sets can include or exclude them.

---

## 3. Play area (implementation requirement)

- **Current issue:** The area where targets (kana, words, images) fall from the top is **too small**.
- **Implement:** Increase the **size of the play area** (the falling-target zone). Prefer CSS/layout changes (e.g. larger height/width, or responsive sizing) so the play field feels noticeably larger. Exact dimensions can be tuned in code.

---

## 4. Game modes (actionable list)

Player **always types romaji** (with rare exceptions if we add alternate input later). Choose **one** mode per session.

| Mode | Description | Source of targets | Player types |
|------|-------------|-------------------|--------------|
| **Single letter** | One kana per target (e.g. か). | Built-in + custom kana set (incl. dakuten/handakuten). | Romaji for that kana (e.g. `ka`). |
| **Random letter combo** | Random sequence of kana (e.g. あい, かお). Length min–max from options. | Built-in + custom character set. | Full romaji for the sequence (e.g. `ai`, `kao`). |
| **Words (CMS)** | Words in hiragana/katakana (e.g. しま). | Editor word list (romaji + kana). | Romaji for the word (e.g. `shima`). |
| **Images** | Small **image** drops (e.g. picture of an island). | Editor word list entries that have an **image** attached. | Romaji for the word (e.g. `shima`). |
| **English meaning** | **English** text shown as target (e.g. "island"). | Editor word list entries that have **English** meaning. | Romaji for the word (e.g. `shima`). |

- **Implement:** Game start/settings screen includes a **mode selector** (dropdown or buttons) for these five options. Spawn and hit logic pull targets from the correct source per mode. Single letter and Random combo use character pool; Words/Images/English use CMS word list (filtered by “has kana”, “has image”, “has English” as needed).

---

## 5. Projectile display and color (implementation requirement)

- **Default (current):** Projectile shows **romaji** and is styled (e.g. blue).
- **For Image mode (and optionally Words/English mode):**  
  - **Display:** The **shooting object (projectile) must show kana** (e.g. しま), not romaji, when firing at image (or word/English) targets.  
  - **Wrong answer:** If the typed romaji does **not** match any current target (wrong or miss), the projectile must be **red**. If it matches and flies toward a target, keep current color (e.g. blue).  
- **Implement:** When creating the projectile: (1) set its text to kana when in Image (and optionally Words/English) mode; (2) if there is no valid target for the typed romaji, set projectile class/style to “wrong” (red) and animate off screen; otherwise use default (blue) and move toward target.

---

## 6. Quit game (implementation requirement)

- **Requirement:** Player can **quit** the current game (return to start screen or exit game view) without finishing or losing all lives.
- **Implement:** Add a **Quit** control (button or key) in the game UI. On action: stop timers/animations, reset state, show start/settings screen again. No need for confirmation unless you want it later.

---

## 7. Editor (simple CMS) — actionable spec

**Purpose:** Control all game content used in Words, Images, and English meaning modes. One place to enter words and images. Simple and quick to use.

### 7.1 Word entry (romaji → kana)

- **Flow:** User enters the word in **romaji** (e.g. `shima`).
- **System:** Show **possible kana options** for that romaji (e.g. しま). (Implementation: use a romaji→kana mapping or lookup; one romaji string can have multiple kana spellings — show all or the most common.)
- **User:** Picks or confirms the desired kana for this entry (e.g. しま). Stored as the canonical kana for this word.
- **Implement:** Input field for romaji; on input or “look up”, call backend or client-side logic that returns candidate kana; display as selectable options (e.g. list or dropdown); save entry as `{ romaji, kana }` (plus optional image and English).

### 7.2 Image entry

- **Requirement:** For each word (or as a separate field per entry), user can attach **one image** (e.g. island photo).
- **Input method:** User can **paste** the image into a field (e.g. contenteditable div or file paste). Upload via file input is acceptable if paste is not enough.
- **Storage:** Store image on server (e.g. as file in `data/uploads/` or in blob store); reference by URL or id in the word entry. Only entries with an image are used in **Images** mode.

### 7.3 English meaning (optional per entry)

- **Requirement:** Optional field for **English meaning** (e.g. "island"). Used for **English meaning** mode: target shows this text; player types romaji.
- **Implement:** Optional text field per word entry; save as `english` (or equivalent). Only entries with `english` are used in English-meaning mode.

### 7.4 CMS storage — JSON file, no database

- **Requirement:** Simple implementation only. **No database.** No fancy DB or external storage.
- **Implement:** Store all CMS content in a **single JSON file on the server** (e.g. `data/words.json` or `data/cms.json`). The file holds the list of word entries (romaji, kana, optional image path/URL, optional English).
- **Flow:** Editor (client) loads data via GET → server reads JSON file and returns it. On add/edit/delete → client sends request to server → server reads JSON file, updates in memory, **writes the JSON file back** to disk. Images can be stored as files in a folder (e.g. `data/images/`) and the JSON entry holds the filename or path.
- **Principle:** File-based persistence only. Easy to backup, edit by hand if needed, and keep the stack minimal.

### 7.5 CMS scope and UI

- **Content types:** Words (romaji + kana); optional image; optional English. No separate “lessons” or presets required for MVP — just one list (or one list per “set” if we add sets later).
- **UI:** Simple forms and lists: add/edit/delete word; romaji input → kana options → select; image paste/upload; optional English. Focus on **simplicity and usability**; no fancy UI. Fast to add many entries.

---

## 8. Game mechanics (core loop) — unchanged in spirit

1. **Display:** Targets (kana, word in kana, image, or English text) appear from the **top** of the **enlarged** play area.
2. **Input:** One **input field**; player types **romaji** and presses **Enter** to fire.
3. **Fire:** Input clears; a **projectile** is created. For single-letter and random-combo: show romaji. For Image (and optionally Words/English): show **kana**. If no matching target: projectile is **red** and moves off screen; otherwise default color (e.g. blue) and moves toward target.
4. **Hit:** Projectile reaches target → both removed, score (× multiplier) added.
5. **Miss:** No matching target → projectile (red) leaves screen, then removed; no score.
6. **Multiplier:** Consecutive hits increase multiplier; miss resets (per current design).
7. **Quit:** Player can quit at any time (see §6).

---

## 9. Tech & stack

- **Server:** **Express** (Node.js). Serves game UI, editor UI, and API for CMS data and images.
- **Game:** HTML, CSS, JavaScript (evolve from current v2). Load modes and CMS data from server where needed.
- **Editor:** HTML, CSS, JavaScript. Simple forms; romaji input → kana options; image paste/upload; optional English. Persist via API.
- **Data:** **No database.** Persist CMS data in a **single JSON file** on the server (e.g. `data/words.json`). Server reads/writes this file on API requests. Images as files in a folder (e.g. `data/images/`); JSON holds paths. Game fetches word list (and image paths) via API for Words/Images/English modes.

---

## 10. Structure & flow (implementation reference)

### Routes

- `GET /` or `GET /game` — Game UI.
- `GET /editor` — Editor (CMS) UI.
- `GET /api/words` — List word entries (for game and editor).
- `GET /api/words/:id` — One word (optional).
- `POST /api/words` — Create word (romaji, kana, optional image, optional English).
- `PUT /api/words/:id` — Update word.
- `DELETE /api/words/:id` — Delete word.
- `POST /api/romaji-to-kana` or inline in editor — Given romaji, return possible kana options (e.g. `["しま"]` for "shima").
- Image upload/paste → `POST /api/images` or form multipart; store file in `data/images/`; return path or URL. Word entry in JSON stores that path/URL.
- **Server:** All CMS mutations read `data/words.json` (or equivalent), update in memory, then **write the same file back**. No DB.

### Game flow

1. Player selects **game mode** (Single letter / Random combo / Words / Images / English meaning), character set (for letter modes), and other options (Zen/Ramping, lives, etc.).
2. Game loads targets from server for Words/Images/English; uses built-in (+ dakuten/handakuten) + custom set for Single/Random.
3. Play in enlarged play area; type romaji, fire; projectile shows romaji or kana and red when wrong; quit available.

### Editor flow

1. Open `/editor`. List existing word entries.
2. Add entry: type romaji → see kana options → select kana; optionally paste/upload image; optionally add English; save.
3. Edit/delete existing entries. Saved content is used by the game in Words, Images, and English meaning modes.

---

## 11. Implementation checklist (summary)

- [ ] Add **dakuten** and **handakuten** to hiragana and katakana data (§2).
- [ ] **Enlarge play area** (§3).
- [ ] Implement **five game modes** and mode selector (§4).
- [ ] **Projectile:** show **kana** in Image (and optionally Words/English) mode; **red** when no valid target (§5).
- [ ] Add **Quit** control in game (§6).
- [ ] **Editor:** romaji input → kana options → select; image paste/upload; optional English; CRUD for word list (§7). CMS stores data in **single JSON file** on server; no DB (§7.4).
- [ ] Express server, routes, and JSON-file read/write persistence (§9, §10).

---

*Last updated: Feb 8, 2025*
