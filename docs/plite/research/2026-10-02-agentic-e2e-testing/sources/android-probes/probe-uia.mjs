import { writeFileSync } from 'node:fs';
import { adb, serve, connect, findPage, dumpWindows, gboardNodes, sleep, tap } from './kit.mjs';

const server = await serve(new URL('./www', import.meta.url).pathname, 8765);
adb('reverse', 'tcp:8765', 'tcp:8765');
const CONTENT_TOP = 292, DPR = 2.625;

const launch = async () => {
  adb('shell', 'am', 'force-stop', 'com.android.chrome');
  adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'http://localhost:8765/?uia', 'com.android.chrome');
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try { const b = await connect(); const p = findPage(b, 'localhost:8765'); if (p) return { browser: b, page: p }; await b.close(); } catch {}
  }
  throw new Error('chrome did not come up');
};
const focusTextarea = async (page) => {
  const r = await page.evaluate(() => { const el = document.getElementById('ta'); el.value = ''; window.__probe = []; return el.getBoundingClientRect().toJSON(); });
  tap((r.left + r.width / 2) * DPR, CONTENT_TOP + (r.top + r.height / 2) * DPR);
  await sleep(1200);
};
const workload = (page) => page.evaluate(() => {
  const times = [];
  for (let run = 0; run < 5; run++) {
    const host = document.createElement('div'); document.body.append(host);
    const t0 = performance.now();
    for (let i = 0; i < 300; i++) { const n = document.createElement('p'); n.textContent = 'row ' + i; host.append(n); host.offsetHeight; }
    times.push(performance.now() - t0); host.remove();
  }
  times.sort((a, b) => a - b); return times[2];
});
const typeWord = async (page, keys, word) => {
  await page.evaluate(() => { window.__probe = []; });
  for (const ch of word) { const k = keys[ch.toUpperCase()]; tap(k.x, k.y); await sleep(250); }
  await sleep(600);
  return page.evaluate(() => ({ value: document.getElementById('ta').value, events: window.__probe.filter((e) => e.id === 'ta' && !e.type.startsWith('pointer')) }));
};
const signature = (events) => events.map((e) => `${e.type}:${e.key ?? e.inputType ?? ''}${e.trusted ? '' : '!untrusted'}`).join(' ');

// Calibrate the key map once from a dump.
let { browser, page } = await launch();
await focusTextarea(page);
const keys = Object.fromEntries(gboardNodes(dumpWindows()).filter((n) => /^[a-z]$/i.test(n.desc)).map((n) => [n.desc.toUpperCase(), n]));
console.log('keys', Object.keys(keys).length);
await browser.close().catch(() => {});

const results = [];
for (let run = 1; run <= 3; run++) {
  for (const condition of ['no-dump', 'after-dump', 'after-force-stop']) {
    if (condition !== 'after-dump') ({ browser, page } = await launch());
    await focusTextarea(page);
    if (condition === 'after-dump') dumpWindows();
    const typed = await typeWord(page, keys, 'hello');
    const ms = await workload(page);
    const bound = adb('shell', 'dumpsys', 'accessibility').match(/Bound services:\{([^}]*)\}/)?.[1] ?? '?';
    results.push({ run, condition, value: typed.value, events: typed.events.length, signature: signature(typed.events), workloadMs: Math.round(ms * 10) / 10, boundServices: bound });
    console.log(JSON.stringify(results.at(-1)).slice(0, 220));
    if (condition !== 'no-dump') await browser.close().catch(() => {});
  }
}
writeFileSync(new URL('./uia-result.json', import.meta.url), JSON.stringify(results, null, 1));
server.close();
