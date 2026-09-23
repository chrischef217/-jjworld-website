import { test, expect } from '@playwright/test';

test.setTimeout(120_000);

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
    window.scrollTo({ top: section.offsetTop + max * p, left: 0, behavior: 'auto' });
  }, progress);

  await expect.poll(async () => {
    return Number(await page.locator('#progress-readout').textContent());
  }, {
    timeout: 10_000,
    intervals: [250, 350, 500],
    message: `scroll-linked progress should converge near ${progress}`
  }).toBeGreaterThan(progress - 0.085);

  await expect.poll(async () => {
    return Number(await page.locator('#progress-readout').textContent());
  }, {
    timeout: 10_000,
    intervals: [250, 350, 500],
  }).toBeLessThan(progress + 0.085);
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

    await expect.poll(async () => {
      return Number(await page.locator(cp.selector).evaluate((el) => getComputedStyle(el).opacity));
    }, { timeout: 6000 }).toBeGreaterThan(0.30);

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

  await expect.poll(async () => {
    return Number(await page.locator('.copy-bright').evaluate((el) => getComputedStyle(el).opacity));
  }, { timeout: 6000 }).toBeGreaterThan(0.30);

  await page.screenshot({ path: 'test-results/jj-pure-mobile-bright.png', fullPage: false });
  expect(errors, errors.join('\n')).toEqual([]);
});
