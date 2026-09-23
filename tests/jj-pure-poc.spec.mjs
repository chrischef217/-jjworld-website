import { test, expect } from '@playwright/test';

const checkpoints = [
  { name: 'calm', progress: 0.16, selector: '.copy-calm' },
  { name: 'plump', progress: 0.36, selector: '.copy-plump' },
  { name: 'bright', progress: 0.58, selector: '.copy-bright' },
  { name: 'serum', progress: 0.79, selector: '.copy-serum' },
  { name: 'cream', progress: 0.94, selector: '.copy-cream' },
];

async function scrollToProgress(page, progress) {
  await page.evaluate((p) => {
    const section = document.querySelector('#cinematic');
    const max = section.offsetHeight - innerHeight;
    window.scrollTo(0, section.offsetTop + max * p);
  }, progress);
  await page.waitForTimeout(1400);
}

test('JJ PURE cinematic POC renders and follows scroll in both directions', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto('/jj-pure-poc.html?debug=1', { waitUntil: 'networkidle' });

  const canvas = page.locator('#three-canvas');
  await expect(canvas).toBeVisible();
  await expect(page.locator('#progress-readout')).toBeVisible();

  const webgl = await page.evaluate(() => {
    const c = document.querySelector('#three-canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  });
  expect(webgl).toBeTruthy();

  for (const cp of checkpoints) {
    await scrollToProgress(page, cp.progress);
    const readout = Number(await page.locator('#progress-readout').textContent());
    expect(readout).toBeGreaterThan(cp.progress - 0.09);
    expect(readout).toBeLessThan(cp.progress + 0.09);

    const opacity = Number(await page.locator(cp.selector).evaluate((el) => getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.35);

    await page.screenshot({ path: `test-results/jj-pure-${cp.name}.png`, fullPage: false });
  }

  await scrollToProgress(page, 0.18);
  const reversed = Number(await page.locator('#progress-readout').textContent());
  expect(reversed).toBeLessThan(0.30);

  const fpsText = await page.locator('#fps-readout').textContent();
  console.log(`debug fps snapshot: ${fpsText}`);

  expect(errors, errors.join('\n')).toEqual([]);
});

test('JJ PURE POC mobile layout remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto('/jj-pure-poc.html?debug=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#three-canvas')).toBeVisible();
  await scrollToProgress(page, 0.58);
  await expect(page.locator('.copy-bright')).toBeVisible();
  await page.screenshot({ path: 'test-results/jj-pure-mobile-bright.png', fullPage: false });
  expect(errors, errors.join('\n')).toEqual([]);
});
