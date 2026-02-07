# Project Plan & Documentation (v1)

> **Purpose:** This document describes the vision, scope, and plan for the project.

---

## 1. Project overview

- **Working title:** Japanese Hiragana/Katakana typing game
- **One-line description:** A simple browser typing game where players type romaji to "shoot" matching hiragana/katakana symbols from the top.
- **Target users:** People learning or practicing Japanese hiragana and katakana.

---

## 2. Goals & outcomes

- **What users do:** Type romaji (e.g. `ka`) and press Enter to fire at the matching Japanese character (e.g. か) on screen. Hit = character removed and score increases; miss = shot goes off screen.
- **What it solves:** Makes drilling hiragana/katakana → romaji recognition fast and game-like, with score and multiplier for consistency.

---

## 3. Game mechanics (core loop)

1. **Display:** Japanese symbols (hiragana and/or katakana) appear from the **top** of the screen.
2. **Input:** Single **input field**. Type romaji and press **Enter** to submit.
3. **Fire (visual):** On Enter, input is **cleared**. A **separate element** shows the romaji and **moves toward** the matching symbol (or off screen). When it reaches the symbol, both are **removed** and score (× multiplier) is added.
4. **Hit:** Projectile travels to symbol; on contact both removed, score increases.
5. **Miss:** Projectile moves off screen, then removed. No score change.
6. **Multiplier:** Consecutive correct answers build a multiplier.

---

## 4. Features (MVP)

- Input field; on fire, input clears and romaji element moves toward target (or up).
- Symbols spawn from top. Character set: **Hiragana only** / **Katakana only** / **Both**.
- **Zen mode:** Fixed spawn interval (customizable, e.g. 1 s). **Ramping mode:** Interval decreases over time.
- Score and multiplier visible. Pure HTML, CSS, JavaScript.

---

## 5. Tech

- Web. Pure HTML, CSS, JavaScript only. No frameworks.

---

## 6. Structure

- **Top:** Japanese symbols. **Middle:** Projectiles + symbols. **Bottom:** Input. **UI:** Score, multiplier.
- Files: `index.html`, `style.css`, `script.js`.

---

*Saved as v1 for implementation.*
