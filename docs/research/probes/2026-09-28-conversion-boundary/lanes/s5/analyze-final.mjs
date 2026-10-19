// Breaks down the task containing the last s5-batch mark (the strict final) by event self time.
import { readFileSync } from 'node:fs';
for (const file of process.argv.slice(2)) {
  const events = JSON.parse(readFileSync(file, 'utf8'));
  const start = events.find((e) => e.name === 's5-start');
  const main = events.filter((e) => e.pid === start.pid && e.tid === start.tid);
  const marks = main.filter((e) => e.name === 's5-batch').map((e) => e.ts).sort((a, b) => a - b);
  const end = marks.at(-1);
  const task = main.find((e) => e.name === 'RunTask' && e.ph === 'X' && e.ts <= end && e.ts + e.dur >= end);
  const inside = main.filter((e) => e.ph === 'X' && e.name !== 'RunTask' && e.ts >= task.ts && e.ts + (e.dur ?? 0) <= task.ts + task.dur).sort((a, b) => a.ts - b.ts || b.dur - a.dur);
  const self = new Map(); const stack = [];
  for (const e of inside) {
    while (stack.length && stack.at(-1).ts + stack.at(-1).dur <= e.ts) stack.pop();
    if (stack.length) { const p = stack.at(-1); self.set(p, (self.get(p) ?? p.dur) - e.dur); }
    if (!self.has(e)) self.set(e, e.dur); stack.push(e);
  }
  const byName = new Map();
  for (const [e, t] of self) byName.set(e.name, (byName.get(e.name) ?? 0) + t);
  const gc = inside.filter((e) => /GC|gc/.test(e.name) && !/SCAVENGER_|MC_|V8\.GC_/.test(e.name)).map((e) => `${e.name}:${(e.dur / 1000).toFixed(1)}`);
  console.log(file.split('/').pop(), 'final task ms', (task.dur / 1000).toFixed(1), '| top self:', [...byName].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, t]) => `${n} ${(t / 1000).toFixed(1)}`).join(', '), '| gc:', gc.join(' '));
}
