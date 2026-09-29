// Self time per function inside the strict-final task, averaged per arm, then diffed.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
const [profDir, traceDir] = process.argv.slice(2);
const files = (dir) => readdirSync(dir).sort();
const finalWindow = (events) => {
  const start = events.find((e) => e.name === 's5-start');
  const main = events.filter((e) => e.pid === start.pid && e.tid === start.tid);
  const calls = main.filter((e) => e.name === 'FunctionCall' && ['__s5DemoArrival', '__s5CloseTick'].includes(e.args?.data?.functionName)).map((e) => e.ts).sort((a, b) => a - b);
  const last = calls.at(-1);
  const task = main.find((e) => e.name === 'RunTask' && e.ph === 'X' && e.ts <= last && e.ts + e.dur >= last);
  return [task.ts, task.ts + task.dur];
};
const selfIn = (profile, [from, to]) => {
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
  const self = new Map(); const incl = new Map();
  let t = profile.startTime;
  for (let i = 0; i < profile.samples.length; i++) {
    t += profile.timeDeltas[i] ?? 0;
    const w = Math.max(0, profile.timeDeltas[i + 1] ?? 0);
    if (t < from || t > to) continue;
    const leaf = byId.get(profile.samples[i]);
    const key = (n) => n.callFrame.functionName || '(anon)';
    self.set(key(leaf), (self.get(key(leaf)) ?? 0) + w);
    const seen = new Set();
    for (let at = leaf.id; at !== undefined; at = parent.get(at)) { const k = key(byId.get(at)); if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) ?? 0) + w); } }
  }
  return { self, incl };
};
const arms = { baseline: [], candidate: [] };
const profs = files(profDir); const traces = files(traceDir);
for (let i = 0; i < profs.length; i++) {
  const arm = profs[i].includes('baseline') ? 'baseline' : 'candidate';
  const profile = JSON.parse(readFileSync(path.join(profDir, profs[i]), 'utf8'));
  const events = JSON.parse(readFileSync(path.join(traceDir, traces[i]), 'utf8'));
  arms[arm].push(selfIn(profile, finalWindow(events)));
}
const avg = (list, kind) => { const m = new Map(); for (const r of list) for (const [k, v] of r[kind]) m.set(k, (m.get(k) ?? 0) + v / list.length); return m; };
for (const kind of ['self', 'incl']) {
  const b = avg(arms.baseline, kind), c = avg(arms.candidate, kind);
  const keys = new Set([...b.keys(), ...c.keys()]);
  const rows = [...keys].map((k) => [k, (b.get(k) ?? 0) / 1000, (c.get(k) ?? 0) / 1000]).map(([k, x, y]) => [k, x, y, y - x]);
  console.log(`--- ${kind}: largest candidate − baseline (ms), n=${arms.baseline.length}/${arms.candidate.length}`);
  for (const [k, x, y, d] of rows.sort((p, q) => q[3] - p[3]).slice(0, kind === 'self' ? 16 : 22)) console.log(`${d.toFixed(2).padStart(7)}  ${x.toFixed(2).padStart(7)} → ${y.toFixed(2).padStart(7)}  ${k}`);
}
