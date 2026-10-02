import { writeFileSync } from 'node:fs';
import { adb, serve, connect, visiblePage, closeOthers, dumpWindows, gboardKeys, sleep, tap } from './kit.mjs';
const server = await serve(new URL('./www', import.meta.url).pathname, 8765);
adb('reverse', 'tcp:8765', 'tcp:8765');
adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'http://localhost:8765/?ko', 'com.android.chrome');
await sleep(2500);
const browser = await connect();
const page = await visiblePage(browser, '?ko');
await closeOthers(browser, page);
const fmt = (events) => events.filter((e) => !e.type.startsWith('pointer') && e.type !== 'keyup').map((e) => `${e.type}:${e.inputType ?? e.key}${e.data != null ? ':' + JSON.stringify(e.data) : ''}${e.isComposing ? ':c' : ''}`);
const out = {};
for (const id of ['ce', 'ta']) {
  const r = await page.evaluate((id) => { const el = document.getElementById(id); if (id === 'ta') el.value = ''; else el.textContent = ''; document.activeElement?.blur(); return el.getBoundingClientRect().toJSON(); }, id);
  await sleep(700);
  tap((r.left + 20) * 2.625, 289 + (r.top + r.height / 2) * 2.625); await sleep(1200);
  let keys = gboardKeys(dumpWindows());
  const langKey = Object.entries(keys).find(([k, v]) => /language|globe/i.test(k) || /switch_to_next_language/.test(v.id));
  out[id] = { langKey: langKey?.[0], before: Object.keys(keys).filter((k) => k.length === 1).slice(0, 12).join('') };
  out[id].after = Object.keys(keys).filter((k) => k.length === 1).slice(0, 30).join('');
  const steps = [];
  for (const label of ['히읗', '아', '니은', '기역', '으', '리을', '스페이스', '입력']) {
    await page.evaluate(() => { window.__probe = []; });
    const key = keys[label];
    if (!key) { steps.push({ label, missing: true }); continue; }
    tap(key.x, key.y); await sleep(700);
    steps.push({ label, value: await page.evaluate((id) => id === 'ta' ? document.getElementById(id).value : document.getElementById(id).innerText, id), events: fmt(await page.evaluate((id) => window.__probe.filter((e) => e.id === id), id)) });
  }
  out[id].steps = steps;
}
writeFileSync(new URL('./korean-result.json', import.meta.url), JSON.stringify(out, null, 1));
for (const [id, o] of Object.entries(out)) { console.log(id, 'lang', o.langKey, 'before', o.before, 'after', o.after); for (const s of o.steps) console.log('  ', s.label, JSON.stringify(s.value), (s.events ?? []).join(' '), s.missing ? 'MISSING' : ''); }
await browser.close().catch(() => {}); server.close();
