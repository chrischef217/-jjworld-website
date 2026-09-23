import { test, expect } from '@playwright/test';

test.setTimeout(90_000);

const checkpoints = [
  { name: 'calm', progress: 0.16 },
  { name: 'plump', progress: 0.36 },
  { name: 'bright', progress: 0.58 },
  { name: 'serum', progress: 0.79 },
  { name: 'cream', progress: 0.94 },
];

async function getProgress(page) {
  return Number(await page.locator('#progress-readout').textContent());
}

async function driveProgress(page, target, tolerance = 0.025) {
  for (let attempt = 0; attempt < 22; attempt++) {
    const current = await getProgress(page);
    if (Math.abs(current - target) <= tolerance) return current;

    await page.evaluate(({ currentProgress, targetProgress }) => {
      const section = document.querySelector('#cinematic');
      const nominalRange = Math.max(1, section.offsetHeight - innerHeight);
      const documentMax = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const error = targetProgress - currentProgress;
      const correction = error * nominalRange * 1.45;
      const nextY = Math.min(documentMax, Math.max(0, scrollY + correction));
      window.scrollTo({ top: nextY, left: 0, behavior: 'auto' });
    }, { currentProgress: current, targetProgress: target });

    await page.waitForTimeout(320);
  }

  const final = await getProgress(page);
  expect(Math.abs(final - target), `progress ${final} should converge near ${target}`).toBeLessThanOrEqual(tolerance + 0.015);
  return final;
}

function collectBrowserErrors(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

test('scene mapping reaches all five cinematic checkpoints and renders visual evidence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = collectBrowserErrors(page);

  await page.goto('/jj-pure-poc.html?debug=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#three-canvas')).toBeVisible();
  await expect(page.locator('#progress-readout')).toBeVisible();

  const webgl = await page.evaluate(() => {
    const c = document.querySelector('#three-canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  });
  expect(webgl).toBeTruthy();

  for (const cp of checkpoints) {
    const reached = await driveProgress(page, cp.progress);
    expect(Math.abs(reached - cp.progress)).toBeLessThan(0.05);
    await page.waitForTimeout(180);
    await page.screenshot({ path: `test-results/jj-pure-${cp.name}.png`, fullPage: false });
  }

  const high = await getProgress(page);
  await driveProgress(page, 0.18, 0.035);
  const reversed = await getProgress(page);
  expect(reversed).toBeLessThan(high - 0.20);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Lenis smooth-scroll transport moves forward and responds to reverse input', async ({ page }) => {
  const errors = collectBrowserErrors(page);

  await page.goto('/jj-pure-poc.html?debug=1', { waitUntil: 'networkidle' });
  const start = await getProgress(page);

  await page.mouse.wheel(0, 4200);
  await expect.poll(() => getProgress(page), {
    timeout: 8000,
    intervals: [200, 300, 450],
  }).toBeGreaterThan(start + 0.015);

  await page.waitForTimeout(1200);
  const forward = await getProgress(page);

  await page.mouse.wheel(0, -9000);
  await expect.poll(() => getProgress(page), {
    timeout: 9000,
    intervals: [250, 350, 500],
  }).toBeLessThan(forward - 0.01);

  expect(errors, errors.join('\n')).toEqual([]);
});

test('mobile reduced-motion fallback reaches BRIGHT without browser errors', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = collectBrowserErrors(page);

  await page.goto('/jj-pure-poc.html?debug=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#three-canvas')).toBeVisible();
  const reached = await driveProgress(page, 0.58, 0.04);
  expect(Math.abs(reached - 0.58)).toBeLessThan(0.06);
  await page.waitForTimeout(180);
  await page.screenshot({ path: 'test-results/jj-pure-mobile-bright.png', fullPage: false });
  expect(errors, errors.join('\n')).toEqual([]);
});
