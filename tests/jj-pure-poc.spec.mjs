import { test, expect } from '@playwright/test';

test.setTimeout(90_000);

const checkpoints = [
  { name: 'calm', progress: 0.16, selector: '.copy-calm' },
  { name: 'plump', progress: 0.36, selector: '.copy-plump' },
  { name: 'bright', progress: 0.58, selector: '.copy-bright' },
  { name: 'serum', progress: 0.79, selector: '.copy-serum' },
  { name: 'cream', progress: 0.94, selector: '.copy-cream' },
];

async function getProgress(page) {
  return Number(await page.locator('#progress-readout').textContent());
}

async function driveProgress(page, target, tolerance = 0.025) {
  for (let attempt = 0; attempt < 18; attempt++) {
    const current = await getProgress(page);
    if (Math.abs(current - target) <= tolerance) return current;

    await page.evaluate(({ currentProgress, targetProgress }) => {
      const section = document.querySelector('#cinematic');
      const nominalRange = Math.max(1, section.offsetHeight - innerHeight);
      const documentMax = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const error = targetProgress - currentProgress;
      // Feedback control instead of assuming that CSS section height maps 1:1
      // to ScrollTrigger progress in every browser/viewport configuration.
      const correction = error * nominalRange * 1.45;
      const nextY = Math.min(documentMax, Math.max(0, scrollY + correction));
      window.scrollTo({ top: nextY, left: 0, behavior: 'auto' });
    }, { currentProgress: current, targetProgress: target });

    await page.waitForTimeout(320);
  }

  const final = await getProgress(page);
  expect(Math.abs(final - target), `progress ${final} should converge near ${target}`).toBeLessThanOrEqual(tolerance + 0.01);
  return final;
}

test('scene mapping renders all five product checkpoints deterministically', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto('/jj-pure-poc.html?debug=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#three-canvas')).toBeVisible();
  await expect(page.locator('#progress-readout')).toBeVisible();

  const webgl = await page.evaluate(() => {
    const c = document.querySelector('#three-canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  });
  expect(webgl).toBeTruthy();

  for (const cp of checkpoints) {
    await driveProgress(page, cp.progress);
    await page.waitForTimeout(120);
    const opacity = Number(await page.locator(cp.selector).evaluate((el) => getComputedStyle(el).opacity));
    expect(opacity, `${cp.name} copy should be visually active`).toBeGreaterThan(0.20);
    await page.screenshot({ path: `test-results/jj-pure-${cp.name}.png`, fullPage: false });
  }

  await driveProgress(page, 0.18);
  const reversed = await getProgress(page);
  expect(reversed).toBeLessThan(0.24);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Lenis smooth-scroll transport moves forward and responds to reverse input', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto('/jj-pure-poc.html?debug=1', { waitUntil: 'networkidle' });
  const start = await getProgress(page);

  await page.mouse.wheel(0, 4200);
  await expect.poll(() => getProgress(page), {
    timeout: 8000,
    intervals: [200, 300, 450],
  }).toBeGreaterThan(start + 0.015);

  await page.waitForTimeout(1200);
  const forward = await getProgress(page);

  // Use a strong reverse gesture and allow Lenis to settle before judging.
  await page.mouse.wheel(0, -9000);
  await expect.poll(() => getProgress(page), {
    timeout: 9000,
    intervals: [250, 350, 500],
  }).toBeLessThan(forward - 0.01);

  expect(errors, errors.join('\n')).toEqual([]);
});

test('mobile fallback preserves the BRIGHT scene without browser errors', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto('/jj-pure-poc.html?debug=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#three-canvas')).toBeVisible();
  await driveProgress(page, 0.58, 0.035);
  await page.waitForTimeout(120);

  const opacity = Number(await page.locator('.copy-bright').evaluate((el) => getComputedStyle(el).opacity));
  expect(opacity).toBeGreaterThan(0.20);
  await page.screenshot({ path: 'test-results/jj-pure-mobile-bright.png', fullPage: false });
  expect(errors, errors.join('\n')).toEqual([]);
});
