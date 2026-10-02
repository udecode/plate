import { writeFileSync } from 'node:fs';
import { adb, serve, connect, visiblePage, closeOthers, sleep, tap } from './kit.mjs';
const server = await serve(new URL('./www', import.meta.url).pathname, 8765);
adb('reverse', 'tcp:8765', 'tcp:8765');
adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'http://localhost:8765/?tap', 'com.android.chrome');
await sleep(2500);
const browser = await connect();
const page = await visiblePage(browser, 'localhost:8765/?tap');
await closeOthers(browser, page);
// Calibration tap on blank body area: read pointerdown client coords.
await page.evaluate(() => { window.__taps = []; addEventListener('pointerdown', (e) => window.__taps.push({ x: e.clientX, y: e.clientY, trusted: e.isTrusted }), true); });
const metrics = await page.evaluate(() => ({ dpr: devicePixelRatio, vvTop: visualViewport.offsetTop, scale: visualViewport.scale }));
await page.evaluate(() => document.activeElement?.blur()); await sleep(800);
const calibScreen = { x: 540, y: 1100 };
tap(calibScreen.x, calibScreen.y); await sleep(600);
const calib = await page.evaluate(() => window.__taps.at(-1));
const offsetX = calibScreen.x - calib.x * metrics.dpr;
const offsetY = calibScreen.y - calib.y * metrics.dpr;
const results = { metrics, calib, offsetX, offsetY, cases: [] };
for (const [index, offset] of [4, 10, 15, 15, 7].entries()) {
  const before = await page.evaluate(() => window.__taps.length);
  if (index === 3) { await page.evaluate(() => document.activeElement?.blur()); await sleep(800); }
  const target = await page.evaluate((o) => {
    const text = document.getElementById('ce').firstChild;
    const range = document.createRange(); range.setStart(text, o - 1); range.setEnd(text, o);
    const r = range.getBoundingClientRect();
    return { x: r.right - 1, y: r.top + r.height / 2, char: text.data[o - 1] };
  }, offset);
  const sx = offsetX + target.x * metrics.dpr, sy = offsetY + target.y * metrics.dpr;
  tap(sx, sy); await sleep(1500);
  const got = await page.evaluate((b) => { const s = getSelection(); return { node: s.anchorNode?.nodeName, offset: s.anchorOffset, active: document.activeElement?.id, newTaps: window.__taps.length - b, tap: window.__taps.at(-1) }; }, before);
  results.cases.push({ wantOffset: offset, target, screen: [Math.round(sx), Math.round(sy)], got, tapErrorPx: [Math.round((got.tap.x - target.x) * metrics.dpr), Math.round((got.tap.y - target.y) * metrics.dpr)] });
}
console.log(JSON.stringify(results, null, 1));
writeFileSync(new URL('./tap-result.json', import.meta.url), JSON.stringify(results, null, 1));
await browser.close().catch(() => {}); server.close();
