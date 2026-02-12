# Standalone Web App Migration Plan

This document outlines the plan to turn the current Express-based Kana Shoot application into a **standalone single-page web app** that runs entirely in the browser, with no server required. Same game and editor logic; all data moves to the client and is stored in IndexedDB with export/import support.

---

## 1. Current State Summary

### 1.1 Architecture

- **Server (Express)**: Serves static files (`public/game`, `public/editor`), provides REST API for words (CRUD), romaji→kana lookup, and image upload/serve.
- **Game** (`public/game/`): Single-letter, random combo, smart, words, images, english, kana-to-english modes. Fetches words from `GET /api/words` when starting relevant modes. Uses localStorage for settings, custom chars, character profiles, and kana stats.
- **Editor** (`public/editor/`): Word list CRUD via `/api/words`, image upload via `/api/images`, romaji→kana via `/api/romaji-to-kana`. All data currently lives on the server (words in `data/words.json`, images in `data/images/`).

### 1.2 Data Currently on Server

| Data        | Location              | Shape (words) |
|------------|------------------------|---------------|
| Words list | `data/words.json`      | Array of `{ id, romaji, kana, image, english, enabled? }` |
| Images     | `data/images/*`       | Files; words reference e.g. `/api/images/<filename>.png`   |

### 1.3 Data Currently in localStorage (Game)

| Key                        | Purpose                    |
|---------------------------|----------------------------|
| `kanaShoot_settings`      | Mode, characters, spawn, interval, fall speed, lives, show kana, smart script, word min/max |
| `kanaShoot_customChars`   | Current custom character set `[{ char, romaji }]` |
| `kanaShoot_characterProfiles` | Saved profiles `[{ id, name, chars }]` |
| `kanaShoot_romajiStats`    | All-time kana stats `{ "あ": 5, ... }` (displayed kana → count) |

### 1.4 Server APIs to Replace or Move

- `GET/POST/PUT/DELETE /api/words` → IndexedDB + in-app editor.
- `GET /api/romaji-to-kana?q=` → Implement in client (game/editor already have or can share romaji→kana logic).
- `POST /api/images`, `GET /api/images/:filename` → **Future enhancement**: local path or in-browser image handling; see §5.

---

## 2. Target: Standalone Single-Page Web App

### 2.1 Goals

- **Single entry point**: One HTML (or app shell) that loads the game; editor is a “mode” or view within the same app (e.g. tab or route like `#editor`), not a separate server route.
- **No backend**: No Node/Express; app runs from file:// or any static host (e.g. GitHub Pages, Netlify).
- **Same behavior**: Game modes, editor CRUD, custom characters, profiles, and stats behave the same; only storage and “where data lives” change.
- **All persistent data in IndexedDB** with a single export/import story.

### 2.2 What Stays the Same

- Game logic (spawning, scoring, lives, modes, smart pool, etc.).
- Editor logic (word list, romaji→kana, validation).
- UI structure and flow (start screen, game screen, modals, select characters, stats).
- Character sets, profiles, and filters in the Select characters modal.

### 2.3 What Changes

- **Words**: Read/write from IndexedDB instead of `/api/words`; editor and game both use the same DB layer.
- **Settings, custom chars, profiles, stats**: Stored in IndexedDB instead of localStorage; API layer (get/set) is replaced by async IndexedDB calls.
- **Romaji→kana**: Done in the client (shared helper used by editor and game).
- **Images**: For this migration, treat as “future enhancement” (§5); words can still have an `image` field (e.g. local path or placeholder) but no upload/serve from server.

---

## 3. IndexedDB Data Model

Use one database (e.g. `kanaShoot`) with multiple object stores. The **words** store mirrors the current `words.json` structure so that export/import can be file-based and human-readable.

### 3.1 Database and Stores

- **Database name**: e.g. `kanaShoot_db`, single version to manage schema.
- **Object stores**:

| Store name   | Key path  | Purpose |
|-------------|-----------|---------|
| `words`    | `id`      | Word list: `{ id, romaji, kana, image, english, enabled }`. Same shape as current `words.json` entries. |
| `settings` | key (e.g. `"main"`) | Current settings object (one record keyed by `"main"` or similar). |
| `customChars` | key (e.g. `"current"`) | Current custom character set `[{ char, romaji }]` (one record). |
| `profiles` | `id`      | Character profiles `{ id, name, chars: [{ char, romaji }] }`. |
| `stats`    | `kana` (character) | Kana stats: key = kana character, value = count (number). Alternatively one record `{ key: "romajiStats", value: { "あ": 5, ... } }`. |
| `sessions` | `id` (auto-increment or timestamp) | Session records (§4). |

### 3.2 Words Store Shape (Match words.json)

Each word document:

```json
{
  "id": "1770576798166",
  "romaji": "shima",
  "kana": "しま",
  "image": "",
  "english": "island",
  "enabled": true
}
```

- **image**: For now, optional; future enhancement can use a local path or blob reference (§5).
- **enabled**: Optional; default true when missing.

### 3.3 Settings Store

Single document, e.g. key `"main"`, value = current settings object (modeType, characters, wordMin, wordMax, spawn, interval, fallspeed, lives, showKanaTyping, smartScript).

### 3.4 Custom Chars and Profiles

- **customChars**: One document (e.g. key `"current"`) holding the array used when “Custom” character set is selected.
- **profiles**: One document per profile; key = `id`; value = `{ id, name, chars }`.

### 3.5 Stats Store

Either:

- One document with key `"romajiStats"` and value `{ "あ": 5, "い": 3, ... }`, or  
- One document per kana character (key = character, value = count).

Choose one and use it consistently for read/write and export.

---

## 4. Session Data (New)

### 4.1 Purpose

- Record each completed game session (user quit or game over) for later review.
- Show session history in a **Sessions** stats modal (separate from the existing “Kana stats” modal which is per-kana counts).

### 4.2 When to Save a Session

- When the user clicks **Quit** (session ended by user).
- When the user **loses** (lives reach 0 and game over).

In both cases, write one session record to the `sessions` store.

### 4.3 Session Record Shape

Capture all dynamic values that were in effect when the session was **started**, plus the outcome. Suggested shape:

```json
{
  "id": "session_1739...",
  "endedAt": 1739123456789,
  "score": 420,
  "gameMode": "single",
  "characterSet": "hiragana",
  "spawn": "zen",
  "interval": 1,
  "fallSpeed": 0.45,
  "lives": 3,
  "wordMin": 2,
  "wordMax": 5,
  "smartScript": null
}
```

- **endedAt**: Timestamp when session ended (for ordering and display).
- **score**: Final score.
- **gameMode**: `single`, `random`, `smart`, `words`, `images`, `english`, `kana-to-english`.
- **characterSet**: `hiragana`, `katakana`, `both`, `custom`.
- **spawn**: `zen` or `ramping`.
- **interval**: Spawn interval in seconds (when zen).
- **fallSpeed**: Numeric value used for that session.
- **lives**: Starting lives.
- **wordMin** / **wordMax**: Only relevant for modes that use them (smart, etc.); can be null otherwise.
- **smartScript**: Only for smart mode; `hiragana`, `katakana`, or `both`; null otherwise.

Optional: add `duration` (seconds played) if easy to compute from start/end.

### 4.4 Sessions Modal (New UI)

- A separate modal or tab “Sessions” (or “Session history”) that lists session records.
- Display: date/time, mode, character set, score, spawn type, interval, fall speed, lives, etc. (table or cards).
- Filter/sort options (e.g. by date, by mode, by score) are optional but recommended for usability.
- Data source: `sessions` object store in IndexedDB.

---

## 5. Images (Future Enhancement)

- **Current**: Words have an `image` field; server stores files and serves them at `/api/images/:filename`.
- **Standalone (this migration)**: Do **not** implement image upload or blob storage. Keep the `image` field on word documents; allow it to be empty or a string.
- **Future**: Support “local path” or “user-chosen file” so the game can resolve an image (e.g. file input, or path the user points to). No server; images could be:
  - Data URLs (base64) stored in IndexedDB or in the word document, or
  - References to a user-selected local path (with browser limitations), or
  - Blobs in a separate store keyed by word id.

This plan does **not** implement the images part; only the words structure and export/import are in scope. The `image` field remains so that future enhancement can plug in without changing the word schema.

---

## 6. Export / Import

### 6.1 Export

- **Default export**: **Words only** (same structure as current `words.json`: array of word objects). This keeps exports small and portable.
- **Optional export** (user chooses what to include):
  - Words (default on).
  - Session data (sessions store).
  - Character stats (romajiStats).
  - Character profiles (custom character sets).
  - Settings (optional).
  - Custom “current” character set (optional).

Suggested export format: **one JSON file** with a top-level structure, e.g.:

```json
{
  "version": 1,
  "exportedAt": 1739123456789,
  "words": [ ... ],
  "sessions": [ ... ],
  "stats": { "あ": 5, ... },
  "profiles": [ ... ],
  "settings": { ... },
  "customChars": [ ... ]
}
```

- Only include keys that the user chose to export (e.g. if only words: `{ version, exportedAt, words }`).
- This allows one file to backup or move “everything” or only words.

### 6.2 Import

- User selects a previously exported JSON file.
- **Selective import**: For each key present in the file (words, sessions, stats, profiles, settings, customChars), either:
  - **Replace** existing store with imported data, or
  - **Merge** (e.g. for words: merge by `id`; for sessions append; for stats merge counts; etc.).
- Clear UI: “Import words only” vs “Import full backup” and checkboxes for each data type when the file contains multiple keys.
- Validation: Ensure words have required fields (`id`, `romaji`, `kana` at least); reject or skip invalid entries.

### 6.3 File Format Compatibility

- **Words**: Export format for `words` array should match current `words.json` (and IndexedDB word documents) so that:
  - Existing `words.json` can be imported as “words only”.
  - Exported words can be edited or re-imported elsewhere.
- **Version field**: Use a `version` (and optionally `exportedAt`) so future migrations can detect and upgrade old import files.

---

## 7. Implementation Phases (Order of Work)

Do **not** implement in this step; the following is a suggested order for when implementation starts.

1. **IndexedDB layer**
   - Create DB, object stores (words, settings, customChars, profiles, stats, sessions).
   - Provide a small API (get/put/delete/list) for each store so the rest of the app does not touch IndexedDB directly.
   - Add a “migrate from localStorage” one-time step: on first load of the new app, if localStorage has old keys and IndexedDB is empty, copy settings, customChars, profiles, stats into IndexedDB (then optionally clear or keep localStorage).

2. **Words in IndexedDB**
   - Replace all `/api/words` calls in editor and game with the IndexedDB words API.
   - Editor: load words from DB on init; create/update/delete words in DB.
   - Game: when starting a mode that needs words, read words from DB instead of XHR.

3. **Romaji→kana in client**
   - Implement or reuse existing romaji→kana logic in the client; replace `GET /api/romaji-to-kana` in the editor (and game if used) with this helper.

4. **Replace all localStorage usage**
   - Settings: read/write from IndexedDB `settings` store.
   - Custom chars: read/write from `customChars` store.
   - Profiles: read/write from `profiles` store.
   - Stats: read/write from `stats` store.
   - Ensure all reads are async and UI waits for DB where necessary.

5. **Session recording**
   - When a session ends (quit or game over), build the session object from current game state (mode, character set, spawn, interval, fall speed, lives, word min/max, smart script) and score; write to `sessions` store.
   - Add “Sessions” modal and list/filter/sort session history from `sessions`.

6. **Export**
   - UI: “Export” button; dialog or options for “Words only” vs “Include: sessions, stats, profiles, settings, customChars”.
   - Build JSON (version, exportedAt, and selected keys); trigger download as a file.

7. **Import**
   - UI: “Import” button; file input; parse JSON; show options (replace/merge per data type); validate and write to IndexedDB.

8. **Single-page app structure**
   - One entry HTML; game and editor as views (e.g. `#game`, `#editor` or similar). Router or simple hash handling to show game or editor. Remove dependency on server routes; static hosting only.

9. **Remove server**
   - Remove Express (or keep a minimal static server only for local dev). Document that production is file:// or static host. Images left as future enhancement.

10. **Testing and cleanup**
    - Update Playwright (or any) E2E tests so game and editor run against the standalone app (no server API). Ensure export/import and session recording are covered if desired.

---

## 8. Out of Scope for This Plan

- **Images**: Storage and display of word images in the standalone app (future enhancement; local path or in-browser handling).
- **Server-side logic**: No new backend; migration is client-only aside from removing the server.
- **User accounts / sync**: No login or cloud sync; all data is local and export/import only.

---

## 9. Summary

| Area           | Change |
|----------------|--------|
| **Words**      | IndexedDB store mirroring `words.json`; editor and game use it; export/import words (default) and optionally more. |
| **Settings, custom chars, profiles, stats** | Move from localStorage to IndexedDB; same behavior, async API. |
| **Sessions**   | New store + new “Sessions” modal; save on quit/game over with mode, options, score; export/import optional. |
| **Export/import** | One JSON format; default = words only; options = sessions, stats, profiles, settings, customChars. |
| **Images**     | Not implemented; `image` field kept for future (e.g. local path). |
| **App shape**  | Single-page app; game + editor as local views; no server required. |

This plan is intended to be implemented in a later phase; no code changes are made in this step.
