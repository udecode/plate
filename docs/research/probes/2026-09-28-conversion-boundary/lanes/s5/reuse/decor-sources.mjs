// Breaks EditorStatic's block decoration read (`visit` under the static
// `Children` component) down by decoration source across CPU profiles. The
// source body is the frame the Plate wrapper calls through Reflect.apply;
// everything above it (the source `read` wrapper, withDocumentViewRead, the
// plugin context) is wrapper cost. Frames named `read` or anonymous get a
// bundle snippet so they can be identified.
// Usage: node decor-sources.mjs <chunks-dir> <top> <profile...>
import { readFileSync } from 'node:fs';
import path from 'node:path';

const [chunksDir, topArg, ...files] = process.argv.slice(2);
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
  return chunkText.get(file)?.[lineNumber]?.slice(columnNumber, columnNumber + 90) ?? '';
};
const keyOf = (f) => `${f.functionName || '(anon)'}@${f.url.split('/').pop()}:${f.columnNumber}`;
const label = (f) => {
  const key = keyOf(f);
  return !f.functionName || f.functionName === 'read' ? `${key} «${snippet(f)}»` : key;
};
const add = (map, key, frame, incl, self) => {
  const entry = map.get(key) ?? { frame, incl: 0, self: 0 };
  entry.incl += incl;
  entry.self += self;
  map.set(key, entry);
};
let total = 0;
let wrapperSelf = 0;
const wrapper = new Map();
const sources = new Map();

for (const file of files) {
  const profile = JSON.parse(readFileSync(file, 'utf8'));
  const byId = new Map(profile.nodes.map((node) => [node.id, node]));
  const parent = new Map();
  for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id);
  const cache = new Map();
  const below = (id) => {
    if (cache.has(id)) return cache.get(id);
    const stack = [];
    for (let at = id; at !== undefined; at = parent.get(at)) stack.push(byId.get(at).callFrame);
    let result = null;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      if (stack[i].functionName === 'visit' && stack.slice(i + 1).some((f) => f.functionName === 'Children')) {
        result = stack.slice(0, i).reverse().filter((f) => f.functionName !== 'visit');
        break;
      }
    }
    cache.set(id, result);
    return result;
  };
  for (const [index, id] of profile.samples.entries()) {
    const ms = Math.max(0, profile.timeDeltas[index + 1] ?? 0) / 1000;
    const frames = below(id);
    if (!frames) continue;
    total += ms;
    // The source body is the callee of the `Reflect.apply(decorate.read ...)` arrow.
    const applyAt = frames.findIndex((f) => snippet(f).startsWith('()=>Reflect.apply(decorate.read'));
    if (applyAt === -1 || applyAt + 1 >= frames.length) {
      const leaf = frames.at(-1);
      if (leaf) add(wrapper, keyOf(leaf), leaf, 0, ms);
      else wrapperSelf += ms;
      for (const f of new Map(frames.map((f) => [keyOf(f), f])).values()) add(wrapper, keyOf(f), f, ms, 0);
      continue;
    }
    const body = frames[applyAt + 1];
    const source = sources.get(keyOf(body)) ?? { body, incl: 0, self: 0, callees: new Map(), direct: new Map() };
    source.incl += ms;
    const rest = frames.slice(applyAt + 2);
    if (rest.length === 0) source.self += ms;
    // First frame under the body: which call inside decorate.read the time is in,
    // labelled with the deepest named frame of the read chain below it.
    if (rest.length > 0) {
      const named = rest.find((f) => ['children', 'parent', 'key', 'plugin', 'string', 'highlight', 'last', 'get', 'api', 'nodes'].includes(f.functionName));
      add(source.direct, `${keyOf(rest[0])} -> ${named ? keyOf(named) : '(inline)'}`, rest[0], ms, rest.length === 1 ? ms : 0);
    }
    const seen = new Map(rest.map((f) => [keyOf(f), f]));
    for (const [key, f] of seen) add(source.callees, key, f, ms, 0);
    const leaf = rest.at(-1);
    if (leaf) add(source.callees, keyOf(leaf), leaf, 0, ms);
    sources.set(keyOf(body), source);
    // Wrapper frames above the body still count as wrapper inclusive time.
    for (const f of new Map(frames.slice(0, applyAt + 1).map((f) => [keyOf(f), f])).values()) add(wrapper, `above:${keyOf(f)}`, f, 0, 0);
  }
}
const sourceTotal = [...sources.values()].reduce((sum, s) => sum + s.incl, 0);
console.log(`block decoration read total ${total.toFixed(1)} ms over ${files.length} profiles; decorate.read bodies ${sourceTotal.toFixed(1)} ms; outside the bodies ${(total - sourceTotal).toFixed(1)} ms`);
console.log('outside the bodies, by frame (inclusive / self ms):');
for (const [, e] of [...wrapper].filter(([k]) => !k.startsWith('above:')).sort((a, b) => b[1].incl - a[1].incl).slice(0, top)) {
  console.log(`  ${e.incl.toFixed(1).padStart(8)} ${e.self.toFixed(1).padStart(8)}  ${label(e.frame)}`);
}
for (const s of [...sources.values()].sort((a, b) => b.incl - a.incl)) {
  console.log(`source ${label(s.body)}: inclusive ${s.incl.toFixed(1)} ms, self ${s.self.toFixed(1)} ms`);
  console.log('  first call under the body (-> first named call below it):');
  for (const [key, e] of [...s.direct].sort((a, b) => b[1].incl - a[1].incl).slice(0, top)) {
    console.log(`  ${e.incl.toFixed(1).padStart(8)} ${e.self.toFixed(1).padStart(8)}  ${key}${!e.frame.functionName || e.frame.functionName === 'read' ? ` «${snippet(e.frame)}»` : ''}`);
  }
  console.log('  by inclusive:');
  for (const [, e] of [...s.callees].sort((a, b) => b[1].incl - a[1].incl).slice(0, top)) {
    console.log(`  ${e.incl.toFixed(1).padStart(8)} ${e.self.toFixed(1).padStart(8)}  ${label(e.frame)}`);
  }
  console.log('  by self:');
  for (const [, e] of [...s.callees].sort((a, b) => b[1].self - a[1].self).slice(0, top)) {
    console.log(`  ${e.incl.toFixed(1).padStart(8)} ${e.self.toFixed(1).padStart(8)}  ${label(e.frame)}`);
  }
}
