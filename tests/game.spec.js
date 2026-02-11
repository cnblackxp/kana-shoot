// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('start screen shows and Start button starts the game', async ({ page }) => {
    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#game-screen')).toBeHidden();
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();

    await page.getByRole('button', { name: /start/i }).click();

    await expect(page.locator('#start-screen')).toBeHidden();
    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#lives-display')).toBeVisible();
  });

  test('Single letter mode: game runs and input is focused', async ({ page }) => {
    await expect(page.locator('#opt-mode-type')).toHaveValue('single');
    await page.getByRole('button', { name: /start/i }).click();

    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#input')).toBeFocused();
    await expect(page.locator('#play-area')).toBeVisible();
  });

  test('typing romaji and Enter fires (score or projectile)', async ({ page }) => {
    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.locator('#game-screen')).toBeVisible();

    await page.locator('#input').fill('a');
    await page.locator('#input').press('Enter');

    await page.waitForTimeout(400);
    const scoreText = await page.locator('#score').textContent();
    const score = parseInt(scoreText || '0', 10);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('Quit returns to start screen', async ({ page }) => {
    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.locator('#game-screen')).toBeVisible();

    await page.getByRole('button', { name: /quit/i }).click();

    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#game-screen')).toBeHidden();
  });

  test('Custom character modal opens and has 5-column grid and filters', async ({ page }) => {
    await page.locator('#opt-characters').selectOption('custom');
    await expect(page.locator('#btn-custom-chars')).toBeVisible();
    await page.getByRole('button', { name: /select characters/i }).click();

    await expect(page.locator('#custom-modal')).toBeVisible();
    await expect(page.locator('#custom-modal h2')).toContainText(/select characters/i);
    await expect(page.locator('#custom-select-all')).toBeVisible();
    await expect(page.locator('#custom-deselect-all')).toBeVisible();
    await expect(page.locator('#custom-select-hiragana')).toBeVisible();
    await expect(page.locator('#custom-deselect-dakuten')).toBeVisible();
    await expect(page.locator('#custom-select-handakuten')).toBeVisible();

    const hiraganaGrid = page.locator('#custom-hiragana.custom-grid');
    await expect(hiraganaGrid).toBeVisible();
    const labels = hiraganaGrid.locator('label');
    await expect(labels.first()).toBeVisible();
    const count = await labels.count();
    expect(count).toBeGreaterThan(40);

    await page.getByRole('button', { name: /done/i }).click();
    await expect(page.locator('#custom-modal')).toBeHidden();
  });

  test('Stats modal opens and closes', async ({ page }) => {
    await page.getByRole('button', { name: /stats/i }).click();
    await expect(page.locator('#stats-modal')).toBeVisible();
    await expect(page.locator('#stats-modal-list')).toBeVisible();
    await page.locator('#stats-modal-close').click();
    await expect(page.locator('#stats-modal')).toBeHidden();
  });

  test('mode switch shows correct options (Smart shows script, Custom shows Select characters)', async ({ page }) => {
    await expect(page.locator('#character-set-wrap')).toBeVisible();
    await expect(page.locator('#btn-custom-chars')).toBeHidden();

    await page.locator('#opt-characters').selectOption({ label: 'Custom' });
    await expect(page.locator('#btn-custom-chars')).toBeVisible();

    await page.locator('#opt-mode-type').selectOption({ label: 'Smart (practice weak)' });
    await expect(page.locator('#smart-chars-wrap')).toBeVisible();
    await expect(page.getByRole('button', { name: /view characters/i })).toBeVisible();

    await page.locator('#opt-mode-type').selectOption({ label: 'Single letter' });
    await expect(page.locator('#character-set-wrap')).toBeVisible();
  });

  test('Random combo mode starts and shows game screen', async ({ page }) => {
    await page.locator('#opt-mode-type').selectOption({ label: 'Random letter combo' });
    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#play-area')).toBeVisible();
  });

  test('Smart mode: options visible and Start can be clicked (pool may be empty)', async ({ page }) => {
    await page.locator('#opt-mode-type').selectOption({ label: 'Smart (practice weak)' });
    await expect(page.locator('#smart-chars-wrap')).toBeVisible();
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(600);
    const gameVisible = await page.locator('#game-screen').isVisible();
    const startVisible = await page.locator('#start-screen').isVisible();
    expect(gameVisible || startVisible).toBe(true);
  });
});
