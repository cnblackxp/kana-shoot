# Project Plan & Documentation

> **Purpose:** This document describes the vision, scope, and plan for the project. We'll fill it in together as we define what you want to build.

---

## 1. Project overview

- **Working title:** Japanese Hiragana/Katakana typing game
- **One-line description:** A simple browser typing game where players type romaji to “shoot Ematching hiragana/katakana symbols falling from the top.
- **Target users:** People learning or practicing Japanese hiragana and katakana.

---

## 2. Goals & outcomes

- **What users do:** Type romaji (e.g. `ka`) and press Enter to fire at the matching Japanese character (e.g. ぁE on screen. Hit = character removed and score increases; miss = shot goes off screen.
- **What it solves:** Makes drilling hiragana/katakana ↁEromaji recognition fast and game-like, with score and multiplier for consistency.

---

## 3. Game mechanics (core loop)

1. **Display:** Japanese symbols (hiragana and/or katakana, depending on player choice) appear from the **top** of the screen (e.g. ぁE ぁE く…).
2. **Input:** Player has a single **input field**. They type the romaji reading (e.g. `ka`) and press **Enter** to submit.
3. **Fire (visual):** On Enter, the typed word is **cleared from the input**. A **separate element** is created that displays only the romaji (e.g. `ka`). This element moves in the **direction of the matching symbol** on screen (if there is one) or otherwise travels off screen. When the romaji element **reaches** the target symbol, both the projectile and the symbol are **removed**, and score (ÁEmultiplier) is added.
4. **Hit:** If that hiragana/katakana is on screen ↁEthe romaji projectile travels toward it; on contact both are removed and **score** increases.
5. **Miss:** If that character is **not** on screen ↁEthe romaji projectile simply moves off screen (no target), then is removed. No score change.
6. **Multiplier:** Consecutive correct answers build a **multiplier** (e.g. 2x, 3x…); consistent play rewards more points.

---

## 4. Features & scope

### Must-have (MVP)

- Single HTML page with one input field.
- **Firing visual:** On fire, input is cleared; a **separate DOM element** shows the romaji and **moves toward** the matching symbol (or off screen if no match). When it reaches the symbol, both projectile and symbol are removed; score added.
- Japanese symbols spawning from the top; which script depends on **character set option** (see below).
- Type romaji + Enter to fire; hit = remove symbol + score; miss = projectile goes off screen.
- Consecutive correct answers increase a score multiplier.
- Score and current multiplier visible on screen.
- **Difficulty / spawn mode:**
  - **Zen mode:** Fixed spawn timer. One symbol every N seconds (e.g. every 1 second). **Timer is customizable** (player can set the interval).
  - **Ramping mode:** The time between symbol spawns **decreases slightly over time** (symbols appear more frequently as the game goes on = difficulty increases).
- **Character set option** (before or when starting the game): choose **Hiragana only**, **Katakana only**, or **Both** (hiragana and katakana).
- **Tech:** Pure HTML, CSS, and JavaScript only. No frameworks, no build step.

### Nice-to-have (later)

- Sound effects (hit, miss, multiplier up).
- High score or “best streak E(e.g. in `localStorage`).

---

## 5. Tech & stack

- **Platform:** Web  Eone HTML file (plus CSS/JS inline or in separate files, as we prefer).
- **Stack:** **Pure HTML, CSS, JavaScript only.** No React, Vue, or build tools. Keep it simple and open-in-browser.
- **Data / storage:** None required for MVP; optional later: `localStorage` for high score.

---

## 6. Structure & flow

**Page structure (simple):**

1. **Top area:** Where Japanese symbols appear and move (or stay in a row/column).
2. **Middle/play area:** Optional visual for “shots Egoing upward toward symbols.
3. **Bottom area:** Input field (always focused for typing) + “Press Enter to fire. E
4. **UI elements:** Score display; optional multiplier display (e.g.  Ex E.

**User flow:**

1. Player chooses **character set** (Hiragana only / Katakana only / Both) and **spawn mode** (Zen with customizable timer, or Ramping).
2. Game starts ↁEsymbols from the chosen set spawn from the top (Zen: fixed interval; Ramping: interval shortens over time).
3. Player types romaji in the input and presses Enter ↁEinput clears; a romaji element is created and moves toward the matching symbol (or off screen).
4. On reach: symbol + projectile removed, score (+ multiplier) added. On miss: projectile leaves screen, then removed.
5. Repeat; new symbols keep appearing.

**Files (to keep it simple):**

- `index.html`  Estructure, input, score, multiplier.
- `style.css`  Elayout, symbols, input, optional shot animation.
- `script.js`  Espawning symbols, input handling, hit detection, score, multiplier.

(Or everything in one `index.html` with `<style>` and `<script>` if we want a single file.)

---

## 7. Notes & open questions

- **Symbol set:** Define full hiragana (e.g. あ–ん) and katakana (e.g. ア–ン) maps to romaji; filter by character-set option (hiragana only / katakana only / both).
- **Zen mode:** Customizable timer = user can set spawn interval (e.g. 0.5s, 1s, 2s). Simple number input or dropdown.
- **Ramping mode:** Decide how much the spawn interval decreases and how often (e.g. every 10 seconds, interval drops by 50ms). Cap at a minimum interval so it doesn't become impossible.
- **Multiplier:** How many correct in a row to go 2x, 3x? Does a miss reset it to 1x? (To be decided when building.)
- **Projectile movement:** Move the romaji element toward the target symbol's position (e.g. with requestAnimationFrame or CSS transition). If no target, move in a default direction (e.g. up) until off screen.

---

*Last updated: Feb 6, 2025*
