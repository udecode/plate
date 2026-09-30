// Inclusive and self time of the frames below the nearest `anchor` frame
// (for example flushPassiveEffects or renderRootSync) across CPU profiles,
// averaged per profile. Frames named `read` or anonymous get a bundle snippet.
// Usage: node under-frame.mjs <chunks-dir> <anchor> <top> <profile...>
import { readFileSync } from 'node:fs';
import path from 'node:path';

const [chunksDir, anchor, topArg, ...files] = process.argv.slice(2);
const top = Number(topArg);
const chunkText = new Map();
const snippet = ({ columnNumber, lineNumber, url }) => {
  const file = path.join(chunksDir, url.split('/_next/static/chunks/')[1] ?? '');
  if (!chunkText.has(file)) {
    try {
      chunkText.set(file, readFileSync(file, 'utf8').split('\n'));
    } catch {
      chunkText.set(file, null);
    }
  }
  return chunkText.get(file)?.[lineNumber]?.slice(columnNumber, columnNumber + 80) ?? '';
};
const keyOf = (f) => `${f.functionName || '(anon)'}@${f.url.split('/').pop()}:${f.columnNumber}`;
const label = (f) => (!f.functionName || f.functionName === 'read' ? `${keyOf(f)} «${snippet(f)}»` : keyOf(f));
const incl = new Map();
const self = new Map();
let total = 0;
for (const file of files) {
  const profile = JSON.parse(readFileSync(file, 'utf8'));
  const byId = new Map(profile.nodes.map((node) => [node.id, node]));
  const parent = new Map();
  for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id);
  const cache = new Map();
  const below = (id) => {
    if (cache.has(id)) return cache.get(id);
    const frames = [];
    for (let at = id; at !== undefined; at = parent.get(at)) frames.push(byId.get(at).callFrame);
    frames.reverse();
    const at = frames.findLastIndex((f) => f.functionName === anchor);
    const result = at === -1 ? null : frames.slice(at);
    cache.set(id, result);
    return result;
  };
  for (const [index, id] of profile.samples.entries()) {
    const ms = Math.max(0, profile.timeDeltas[index + 1] ?? 0) / 1000;
    const frames = below(id);
    if (!frames) continue;
    total += ms;
    const seen = new Map(frames.map((f) => [keyOf(f), f]));
    for (const [key, f] of seen) {
      const entry = incl.get(key) ?? { f, ms: 0 };
      entry.ms += ms;
      incl.set(key, entry);
    }
    const leaf = frames.at(-1);
    const entry = self.get(keyOf(leaf)) ?? { f: leaf, ms: 0 };
    entry.ms += ms;
    self.set(keyOf(leaf), entry);
  }
}
const n = files.length;
console.log(`${anchor}: ${(total / n).toFixed(1)} ms per profile over ${n} profiles`);
console.log('by inclusive (ms per profile):');
for (const { f, ms } of [...incl.values()].sort((a, b) => b.ms - a.ms).slice(0, top)) console.log(`  ${(ms / n).toFixed(1).padStart(8)}  ${label(f)}`);
console.log('by self (ms per profile):');
for (const { f, ms } of [...self.values()].sort((a, b) => b.ms - a.ms).slice(0, top)) console.log(`  ${(ms / n).toFixed(1).padStart(8)}  ${label(f)}`);
