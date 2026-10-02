import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { adb, serve, connect, visiblePage, closeOthers, dumpWindows, gboardKeys, sleep, tap, serial } from './kit.mjs';
const server = await serve(new URL('./www', import.meta.url).pathname, 8765);
adb('reverse', 'tcp:8765', 'tcp:8765');
adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'http://localhost:8765/?ac', 'com.android.chrome');
await sleep(2500);
const browser = await connect();
const page = await visiblePage(browser, '?ac');
await closeOthers(browser, page);
const r = await page.evaluate(() => { const el = document.getElementById('ce'); el.textContent = ''; document.activeElement?.blur(); return el.getBoundingClientRect().toJSON(); });
await sleep(700);
tap((r.left + 20) * 2.625, 289 + (r.top + r.height / 2) * 2.625); await sleep(1200);
const keys = gboardKeys(dumpWindows());
const out = [];
for (const word of ['teh', 'becuase', 'recieve']) {
  await page.evaluate(() => { window.__probe = []; });
  for (const ch of word) { tap(keys[ch].x, keys[ch].y); await sleep(300); }
  await sleep(1200);
  const strip = Object.keys(gboardKeys(dumpWindows())).filter((k) => !/^[a-z]$/.test(k)).slice(0, 7);
  if (word === 'teh') writeFileSync(new URL('./ac-strip.png', import.meta.url), execFileSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p']));
  tap(keys.Space.x, keys.Space.y); await sleep(1200);
  const events = await page.evaluate(() => window.__probe.filter((e) => e.id === 'ce' && !e.type.startsWith('pointer') && e.type !== 'keyup').map((e) => `${e.type}:${e.inputType ?? e.key}${e.data != null ? ':' + JSON.stringify(e.data) : ''}`));
  out.push({ word, strip, text: await page.evaluate(() => document.getElementById('ce').innerText), events: events.slice(-6) });
}
console.log(JSON.stringify(out, null, 1));
await browser.close().catch(() => {}); server.close();
