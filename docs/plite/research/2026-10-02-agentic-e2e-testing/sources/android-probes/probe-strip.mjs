import { writeFileSync } from 'node:fs';
import { adb, serve, connect, visiblePage, closeOthers, dumpWindows, gboardNodes, sleep, tap } from './kit.mjs';
const server = await serve(new URL('./www', import.meta.url).pathname, 8765);
adb('reverse', 'tcp:8765', 'tcp:8765');
adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'http://localhost:8765/?strip', 'com.android.chrome');
await sleep(2500);
const browser = await connect();
const page = await visiblePage(browser, '?strip');
await closeOthers(browser, page);
const out = {};
for (const target of ['ta', 'ce']) {
  const r = await page.evaluate((id) => { const el = document.getElementById(id); if (id === 'ta') el.value = ''; else el.textContent = ''; window.__probe = []; document.activeElement?.blur(); return el.getBoundingClientRect().toJSON(); }, target);
  await sleep(700);
  tap((r.left + 20) * 2.625, 289 + (r.top + r.height / 2) * 2.625); await sleep(1200);
  const keys = Object.fromEntries(gboardNodes(dumpWindows()).filter((n) => /^[a-z]$/i.test(n.desc)).map((n) => [n.desc.toLowerCase(), n]));
  await page.evaluate(() => { window.__probe = []; });
  for (const ch of 'hel') { tap(keys[ch].x, keys[ch].y); await sleep(300); }
  await sleep(800);
  const nodes = gboardNodes(dumpWindows());
  const keyTop = Math.min(...Object.values(keys).map((k) => k.bounds[1]));
  const strip = nodes.filter((n) => n.bounds[3] <= keyTop && (n.text || n.desc) && !/^[a-z]$/i.test(n.desc));
  const typed = await page.evaluate((id) => ({ value: id === 'ta' ? document.getElementById(id).value : document.getElementById(id).textContent, events: window.__probe.filter((e) => e.id === id) }), target);
  const candidate = strip.find((n) => /^hel/i.test(n.text || n.desc) && (n.text || n.desc).toLowerCase() !== 'hel') ?? strip[1];
  await page.evaluate(() => { window.__probe = []; });
  if (candidate) { tap(candidate.x, candidate.y); await sleep(1000); }
  const after = await page.evaluate((id) => ({ value: id === 'ta' ? document.getElementById(id).value : document.getElementById(id).textContent, events: window.__probe.filter((e) => e.id === id && !e.type.startsWith('pointer')) }), target);
  out[target] = { strip: strip.map((n) => ({ label: n.text || n.desc, bounds: n.bounds })), typedValue: typed.value, typedEvents: typed.events.filter((e) => !e.type.startsWith('pointer')).map((e) => `${e.type}:${e.inputType ?? e.key}:${e.data ?? ''}`), tapped: candidate?.text || candidate?.desc, afterValue: after.value, stripTapEvents: after.events.map((e) => `${e.type}:${e.inputType ?? e.key}:${JSON.stringify(e.data)}:${e.trusted ? 't' : 'u'}`) };
}
writeFileSync(new URL('./strip-result.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close().catch(() => {}); server.close();
