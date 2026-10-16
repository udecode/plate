import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(new URL('../../../../../apps/plite/package.json', import.meta.url));
const { chromium, webkit, firefox } = require('@playwright/test');

const [refUrl, testUrl, outDir, engineName = 'chromium'] = process.argv.slice(2);
const engines = { chromium, webkit, firefox };
mkdirSync(outDir, { recursive: true });

const observe = (page) =>
  page.evaluate(() => {
    const root = document.querySelector('[contenteditable="true"]');
    const sel = window.getSelection();
    const range = sel.rangeCount ? sel.getRangeAt(0) : null;
    const rect = range ? range.getBoundingClientRect() : null;
    const blocks = [...root.children].map((el) => el.innerText.replace(/﻿/g, ''));
    let focusTextOffset = null;
    if (sel.focusNode && root.contains(sel.focusNode)) {
      const before = document.createRange();
      before.setStart(root, 0);
      before.setEnd(sel.focusNode, sel.focusOffset);
      focusTextOffset = before.toString().replace(/﻿/g, '').length;
    }
    return {
      blocks,
      selected: sel.toString().replace(/﻿/g, ''),
      collapsed: sel.isCollapsed,
      focusInEditor: root.contains(document.activeElement) || document.activeElement === root,
      focusTextOffset,
      caretMeasurable: rect ? rect.height > 0 : null,
    };
  });

const journey = async (url, label) => {
  const browser = await engines[engineName].launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));
  await page.goto(url, { waitUntil: 'networkidle' });
  const root = page.locator('[contenteditable="true"]').first();
  await root.waitFor();
  const steps = [];
  const step = async (name, act) => {
    await act();
    await page.waitForTimeout(150);
    steps.push({ name, ...(await observe(page)) });
  };
  const first = root.locator(':scope > *').first();
  const box = await first.boundingBox();
  await step('click-first-block-start', () => page.mouse.click(box.x + 2, box.y + box.height / 2));
  await step('end', () => page.keyboard.press('End'));
  await step('type', () => page.keyboard.type('XY', { delay: 30 }));
  await step('enter', () => page.keyboard.press('Enter'));
  await step('type-new-line', () => page.keyboard.type('Z', { delay: 30 }));
  await step('shift-up', () => page.keyboard.press('Shift+ArrowUp'));
  await step('shift-down', () => page.keyboard.press('Shift+ArrowDown'));
  await step('backspace-word', () => page.keyboard.press('Alt+Backspace'));
  await step('undo', () => page.keyboard.press('Meta+z'));
  await step('dblclick-word', async () => {
    const b2 = await root.locator(':scope > *').nth(1).boundingBox();
    await page.mouse.dblclick(b2.x + 30, b2.y + 8);
  });
  await page.screenshot({ path: `${outDir}/${label}-${engineName}.png` });
  await browser.close();
  return { url, steps, errors };
};

const safe = (url, label) =>
  Promise.race([
    journey(url, label),
    new Promise((_, reject) => setTimeout(() => reject(new Error('journey over 90s')), 90_000)),
  ]).catch((e) => ({ url, steps: [], errors: [], failed: String(e.message).split('\n')[0].slice(0, 200) }));
const ref = await safe(refUrl, 'ref');
const test = await safe(testUrl, 'test');
if (ref.failed || test.failed) {
  console.log(`journey failed ref=${ref.failed ?? 'ok'} test=${test.failed ?? 'ok'}`);
}
const diffs = ref.steps.slice(0, test.steps.length).map((r, i) => {
  const t = test.steps[i];
  const fields = ['blocks', 'selected', 'collapsed', 'focusInEditor', 'focusTextOffset', 'caretMeasurable'].filter(
    (f) => JSON.stringify(r[f]) !== JSON.stringify(t[f])
  );
  return { step: r.name, fields, ref: Object.fromEntries(fields.map((f) => [f, r[f]])), test: Object.fromEntries(fields.map((f) => [f, t[f]])) };
});
const result = { engine: engineName, ref, test, diffs };
writeFileSync(`${outDir}/differential-${engineName}.json`, JSON.stringify(result, null, 2));
for (const d of diffs) console.log(`${d.step}: ${d.fields.length ? 'DIFF ' + JSON.stringify({ ref: d.ref, test: d.test }) : 'same'}`);
console.log(`errors ref=${ref.errors.length} test=${test.errors.length}`);
process.exit(0);
