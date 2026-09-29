// Breaks down publish tasks (tasks with an s5-batch mark or __s5Preview32) by child event self time.
import { readFileSync } from 'node:fs';
const events = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const start = events.find((e) => e.name === 's5-start');
const main = events.filter((e) => e.pid === start.pid && e.tid === start.tid);
const marks = main.filter((e) => e.name === 's5-batch').map((e) => e.ts).sort((a, b) => a - b);
const end = marks.at(-1);
const tasks = main.filter((e) => e.name === 'RunTask' && e.ph === 'X' && e.ts + e.dur >= start.ts && e.ts <= end).sort((a, b) => a.ts - b.ts);
const xs = main.filter((e) => e.ph === 'X' && e.name !== 'RunTask').sort((a, b) => a.ts - b.ts || b.dur - a.dur);
const names = new Map();
const byTask = [];
for (const task of tasks) {
  const inside = xs.filter((e) => e.ts >= task.ts && e.ts + (e.dur ?? 0) <= task.ts + task.dur);
  const hasMark = marks.some((m) => m >= task.ts && m <= task.ts + task.dur);
  const preview = inside.some((e) => e.name === 'FunctionCall' && e.args?.data?.functionName === '__s5Preview32');
  if (!hasMark && !preview) continue;
  // self time per event name: dur minus direct children
  const stack = [];
  const self = new Map();
  for (const e of inside) {
    while (stack.length && stack.at(-1).ts + stack.at(-1).dur <= e.ts) stack.pop();
    if (stack.length) { const p = stack.at(-1); self.set(p, (self.get(p) ?? p.dur) - e.dur); }
    self.set(e, self.get(e) ?? e.dur);
    stack.push(e);
  }
  const top = inside.filter((e) => !inside.some((o) => o !== e && o.ts <= e.ts && o.ts + o.dur >= e.ts + e.dur && o.dur > e.dur));
  let covered = 0;
  for (const [e, t] of self) { names.set(e.name, (names.get(e.name) ?? 0) + t); }
  for (const e of top) covered += e.dur;
  names.set('(task uncovered)', (names.get('(task uncovered)') ?? 0) + task.dur - covered);
  byTask.push({ dur: task.dur, n: inside.length });
}
const total = byTask.reduce((s, t) => s + t.dur, 0);
console.log('publish tasks', byTask.length, 'total ms', (total / 1000).toFixed(1), 'durations ms', byTask.map((t) => (t.dur / 1000).toFixed(0)).join(' '));
for (const [n, t] of [...names].sort((a, b) => b[1] - a[1]).slice(0, 18)) console.log(n.padEnd(40), (t / 1000).toFixed(1));
