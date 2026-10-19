import { readFileSync } from 'node:fs';
const profile = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const top = Number(process.argv[3] ?? 30);
const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
const parent = new Map();
for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const selfUs = new Map();
for (let i = 0; i < profile.samples.length; i++) {
  const id = profile.samples[i]; const dt = profile.timeDeltas[i + 1] ?? 0;
  selfUs.set(id, (selfUs.get(id) ?? 0) + dt);
}
const label = (n) => `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`;
const self = new Map(); const incl = new Map();
for (const [id, us] of selfUs) {
  const n = nodes.get(id); self.set(label(n), (self.get(label(n)) ?? 0) + us);
  const seen = new Set(); let cur = id;
  while (cur !== undefined) { const l = label(nodes.get(cur)); if (!seen.has(l)) { seen.add(l); incl.set(l, (incl.get(l) ?? 0) + us); } cur = parent.get(cur); }
}
const total = [...selfUs.values()].reduce((a, b) => a + b, 0);
console.log('total sampled ms', (total / 1000).toFixed(0));
console.log('--- self');
for (const [l, us] of [...self].sort((a, b) => b[1] - a[1]).slice(0, top)) console.log((us / 1000).toFixed(1).padStart(8), l);
console.log('--- inclusive');
for (const [l, us] of [...incl].sort((a, b) => b[1] - a[1]).slice(0, top)) console.log((us / 1000).toFixed(1).padStart(8), l);
