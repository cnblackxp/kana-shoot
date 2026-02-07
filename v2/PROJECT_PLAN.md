# Kana Shoot v2

Adds **Words (typing of the dead)** mode on top of v1.

## What's in v2

- Everything from v1 (single characters, custom set, Zen/Ramping, fall speed, lives, particles, localStorage).
- **Game style**
  - **Single characters** — Same as v1: one kana per target, type its romaji (e.g. か → "ka").
  - **Words** — Targets are **words** made from the chosen character set. Player types the **full romaji** for the word (e.g. あい → "ai").
- **Word length** (only when Game style = Words)
  - **Min** and **Max** characters per word (default 2–5, range 2–6).
  - Words are built by picking random characters from the current pool and concatenating their romaji.

## How Words mode works

1. From the character pool (Hiragana / Katakana / Both / Custom), the game builds words of length between Min and Max (inclusive).
2. Each word is shown in Japanese (e.g. あい, かお).
3. Player types the full romaji (e.g. "ai", "kao") and presses Enter to fire.
4. Hit/miss, score, multiplier, lives, and all other rules are the same as v1.

Settings (including game style and word length) are saved in `localStorage` under `kanaShoot_v2_settings`.
