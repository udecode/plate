// Aggregates the caller chains (up to `depth` frames above) of a frame key.
// Usage: node callers-of.mjs <frame-key> <depth> <profile...>
import { readFileSync } from 'node:fs';
const [target, depthArg, ...files] = process.argv.slice(2);
const depth = Number(depthArg);
const keyOf = (f) => `${f.functionName || '(anon)'}@${f.url.split('/').pop()}:${f.columnNumber}`;
const chains = new Map();
let total = 0;
for (const file of files) {
  const profile = JSON.parse(readFileSync(file, 'utf8'));
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
  for (const [i, id] of profile.samples.entries()) {
    const ms = Math.max(0, profile.timeDeltas[i + 1] ?? 0) / 1000;
    const frames = [];
    for (let at = id; at !== undefined; at = parent.get(at)) frames.push(byId.get(at).callFrame);
    frames.reverse();
    const at = frames.findIndex((f) => keyOf(f) === target);
    if (at === -1) continue;
    total += ms;
    const chain = frames.slice(Math.max(0, at - depth), at).map((f) => f.functionName || '(anon)').join(' > ');
    chains.set(chain, (chains.get(chain) ?? 0) + ms);
  }
}
console.log(`${target}: ${(total / files.length).toFixed(1)} ms per profile`);
for (const [chain, ms] of [...chains].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${(ms / files.length).toFixed(1).padStart(7)}  ${chain}`);
