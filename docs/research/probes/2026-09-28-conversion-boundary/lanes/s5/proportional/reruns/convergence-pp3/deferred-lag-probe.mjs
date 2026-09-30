// Replays the two static-demo correctness flows that read the output right
// after an urgent status or heading update, and measures in the page how long
// the output takes to equal the expected text after that update (or whether it
// never does within 5 s).
// Usage: node deferred-lag-probe.mjs <baseURL> <repeats>
import { createRequire } from 'node:module';
const require = createRequire('/Users/zbeyens/git/plate-2/apps/www/package.json');
const { chromium } = require('@playwright/test');
const [base, repeatArg] = process.argv.slice(2);
const repeats = Number(repeatArg ?? 5);
const answerUnit = (i) => `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const source6000 = Array.from({ length: 2000 }, (_, i) => answerUnit(i)).join('\n').slice(0, 6000);
const root = '[data-s5-output] [data-editor="true"]';
const browser = await chromium.launch();

const open = async (source) => {
  const context = await browser.newContext({ baseURL: base, viewport: { height: 720, width: 1280 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.stack ?? e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/blocks/markdown-streaming-demo', { waitUntil: 'commit' });
  await page.getByRole('heading', { name: /^Chunks/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByLabel('Preview', { exact: true }).selectOption('static');
  if (source !== null) {
    await page.getByLabel('Markdown source').fill(source);
    await page.getByLabel('Chunk size', { exact: true }).selectOption('64');
  }
  await page.getByLabel('Chunk delay', { exact: true }).selectOption('10');
  await page.getByRole('heading', { name: 'Editor Output' }).evaluate((h) => h.parentElement.setAttribute('data-s5-output', ''));
  return { context, errors, page };
};
const text = (page) => page.evaluate((sel) => document.querySelector(sel)?.textContent ?? null, root);
const settle = async (page, quiet = 300) => {
  let last = null;
  for (;;) {
    const now = await text(page);
    if (now === last) return now;
    last = now;
    await page.waitForTimeout(quiet);
  }
};
// Watches, in the page, for the urgent marker (status or heading text) and for
// the output text to equal `expected`; resolves with both times.
const watch = (page, marker, expected) =>
  page.evaluate(
    ({ marker, expected, sel }) => {
      const state = { markerAt: null, matchAt: null, outputAtMarker: null };
      window.__lag = state;
      const check = () => {
        const now = performance.now();
        const markerEl = document.querySelector(marker.selector);
        if (state.markerAt === null && markerEl && markerEl.textContent === marker.text) {
          state.markerAt = now;
          state.outputAtMarker = document.querySelector(sel)?.textContent ?? null;
        }
        if (state.matchAt === null && document.querySelector(sel)?.textContent === expected) state.matchAt = now;
      };
      new MutationObserver(check).observe(document.body, { characterData: true, childList: true, subtree: true });
      check();
    },
    { expected, marker, sel: root }
  );
const result = async (page) => {
  const deadline = Date.now() + 5000;
  let state;
  do {
    state = await page.evaluate(() => window.__lag);
    if (state.markerAt !== null && state.matchAt !== null) break;
    await page.waitForTimeout(20);
  } while (Date.now() < deadline);
  return {
    lagMs: state.markerAt !== null && state.matchAt !== null ? Math.round((state.matchAt - state.markerAt) * 10) / 10 : null,
    matched: state.matchAt !== null,
    outputMatchedAtMarker: state.outputAtMarker !== null && state.matchAt !== null && state.matchAt <= state.markerAt,
    finalEqualsExpected: null,
  };
};

const rows = [];
for (let i = 0; i < repeats; i += 1) {
  // Flow 1: stream the columns scenario, reset, then strict-parse via the last chunk button.
  {
    const { context, errors, page } = await open(null);
    await page.getByLabel('Scenario', { exact: true }).selectOption('columns');
    await page.getByRole('button', { name: 'Start streaming', exact: true }).click();
    await page.locator('[data-stream-status="finished"]').waitFor({ timeout: 30000 });
    const streamed = await settle(page);
    await page.getByRole('button', { name: 'Reset streaming', exact: true }).click();
    await settle(page);
    await watch(page, { selector: '[data-stream-status]', text: 'Finished: strict parse' }, streamed);
    await page.locator('button:has-text("paragraph")').last().click();
    const r = await result(page);
    r.finalEqualsExpected = (await settle(page)) === streamed;
    rows.push({ errors, flow: 'strict-after-reset', repeat: i, ...r });
    await context.close();
  }
  // Flow 2: pause a 6000-character stream, then Previous and Next chunk.
  {
    const { context, errors, page } = await open(source6000);
    const heading = page.getByRole('heading', { name: /^Chunks/ });
    await page.getByRole('button', { name: 'Start streaming', exact: true }).click();
    for (const until = Date.now() + 30000; Date.now() < until; ) {
      if (/\((2\d|[3-9]\d)\//.test((await heading.textContent()) ?? '')) break;
      await page.waitForTimeout(5);
    }
    await page.getByRole('button', { name: 'Pause streaming', exact: true }).click();
    await page.locator('[data-stream-status]', { hasText: 'Paused: partial preview' }).waitFor({ timeout: 10000 });
    const streamed = await settle(page);
    const headingText = await heading.textContent();
    const position = Number(/\((\d+)\//.exec(headingText)[1]);
    await page.getByRole('button', { name: 'Previous chunk', exact: true }).click();
    await page.locator('h1,h2,h3,h4', { hasText: `Chunks (${position - 1}/` }).first().waitFor({ timeout: 10000 });
    const headingSelector = await heading.evaluate((h) => {
      h.setAttribute('data-lag-heading', '');
      return '[data-lag-heading]';
    });
    await watch(page, { selector: headingSelector, text: headingText }, streamed);
    await page.getByRole('button', { name: 'Next chunk', exact: true }).click();
    const r = await result(page);
    r.finalEqualsExpected = (await settle(page)) === streamed;
    rows.push({ errors, flow: 'previous-next', position, repeat: i, ...r });
    await context.close();
  }
}
await browser.close();
console.log(JSON.stringify({ base, rows }, null, 1));
