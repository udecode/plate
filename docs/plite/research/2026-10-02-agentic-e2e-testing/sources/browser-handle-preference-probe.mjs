import { chromium, devices, firefox, webkit } from '/Users/zbeyens/git/plate-2/node_modules/.pnpm/playwright-core@1.61.0/node_modules/playwright-core/index.mjs';

const URL = 'http://127.0.0.1:3399/examples/plite/richtext';
const POINT = { path: [0, 0], offset: 4 };
const profiles = [
  { name: 'chromium', type: chromium, context: {} },
  { name: 'firefox', type: firefox, context: {} },
  { name: 'webkit', type: webkit, context: {} },
  { name: 'mobile', type: chromium, context: (({ defaultBrowserType, ...d }) => d)(devices['Pixel 5']) },
  { name: 'mobile-webkit', type: webkit, context: (({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']) },
];

const readState = (page) => page.evaluate(() => {
  const h = document.querySelector('[data-editor="true"]').__pliteBrowserHandle;
  const s = h.getInputState();
  return { pref: s.modelSelectionPreference, preferModel: s.preferModelSelection, origin: s.selectionChangeOrigin, guard: s.modelOwnedTextInputGuard, sel: h.getModelSelection() };
});
const kernelSince = (page, n) => page.evaluate((count) => {
  const h = document.querySelector('[data-editor="true"]').__pliteBrowserHandle;
  return h.getKernelTrace().slice(count).filter((e) => e.eventFamily === 'beforeinput' || e.eventFamily === 'keydown' || e.eventFamily === 'input')
    .map((e) => ({ family: e.eventFamily, ownership: e.ownership, nativeAllowed: e.nativeAllowed, command: e.command?.kind ?? null, intent: e.intent?.kind ?? e.intent ?? null }));
}, n);
const traceLength = (page) => page.evaluate(() => document.querySelector('[data-editor="true"]').__pliteBrowserHandle.getKernelTrace().length);

const runMode = async (page, mode) => {
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => !!document.querySelector('[data-editor="true"]')?.__pliteBrowserHandle);
  if (mode === 'handle') {
    await page.evaluate((point) => {
      const root = document.querySelector('[data-editor="true"]');
      root.focus();
      root.__pliteBrowserHandle.selectRange({ anchor: point, focus: point });
    }, POINT);
  } else {
    const rect = await page.evaluate((point) => {
      const h = document.querySelector('[data-editor="true"]').__pliteBrowserHandle;
      const dom = h.resolveDOMPoint(point);
      const range = document.createRange(); range.setStart(dom.node ?? dom[0], dom.offset ?? dom[1]); range.collapse(true);
      const r = range.getClientRects()[0] ?? range.getBoundingClientRect();
      return { x: r.left, y: r.top + r.height / 2 };
    }, POINT);
    await page.mouse.click(rect.x, rect.y);
  }
  await page.waitForTimeout(200);
  const before = await readState(page);
  let n = await traceLength(page);
  await page.keyboard.type('x');
  await page.waitForTimeout(150);
  const typed = await kernelSince(page, n);
  const afterType = await readState(page);
  n = await traceLength(page);
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(150);
  const deleted = await kernelSince(page, n);
  const text = await page.evaluate(() => document.querySelector('[data-editor="true"]').__pliteBrowserHandle.getBlockText(0));
  return { before, typed, afterType: { pref: afterType.pref, origin: afterType.origin }, deleted, text: text.slice(0, 20) };
};

const out = {};
for (const p of profiles) {
  const browser = await p.type.launch();
  try {
    const context = await browser.newContext(p.context);
    const page = await context.newPage();
    out[p.name] = { handle: await runMode(page, 'handle'), click: await runMode(page, 'click') };
  } catch (e) { out[p.name] = { error: String(e).slice(0, 300) }; }
  await browser.close();
}
console.log(JSON.stringify(out, null, 1));
