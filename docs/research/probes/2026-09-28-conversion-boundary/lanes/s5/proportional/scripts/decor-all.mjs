// Every decoration source read the static renderer makes, per stream: samples
// whose stack holds the Plate source wrapper (`read` in
// getPlateDecorationSources) below the static `Children` component. Unlike the
// harness tally `staticBlockDecorations` (only reads under `visit`), this also
// counts reads Children makes per node outside `visit`, so it compares runs
// whose renderer read decorations in different places. Split: under `visit`
// (a block's subtree read) or not (Children's own per-node read).
// The wrapper is found structurally: the caller of `withDocumentViewRead` on
// stacks that reach the `() => Reflect.apply(decorate.read ...)` arrow, whose
// frame key is given (functionName@chunk:column, as decor-sources.mjs prints).
// Usage: node decor-all.mjs <matrix-dir> <profile-dir> <arrow-key> <children-key|any> [out.json]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [matrixDir, profileDir, arrowKey, childrenKey, out] = process.argv.slice(2);
const keyOf = (f) => `${f.functionName || '(anon)'}@${f.url.split('/').pop()}:${f.columnNumber}`;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const r1 = (n) => Math.round(n * 10) / 10;
const cells = readdirSync(matrixDir)
  .filter((f) => f.endsWith('.json') && !f.startsWith('budget'))
  .map((f) => JSON.parse(readFileSync(path.join(matrixDir, f), 'utf8')))
  .sort((a, b) => a.startedAt.localeCompare(b.startedAt));

const analyze = (file) => {
  const profile = JSON.parse(readFileSync(file, 'utf8'));
  const byId = new Map(profile.nodes.map((node) => [node.id, node]));
  const parent = new Map();
  for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id);
  const stackOf = (id) => {
    const frames = [];
    for (let at = id; at !== undefined; at = parent.get(at)) frames.push(byId.get(at).callFrame);
    return frames.reverse();
  };
  // Pass 1: wrapper keys from stacks that reach the arrow.
  const wrappers = new Map();
  for (const node of profile.nodes) {
    if (keyOf(node.callFrame) !== arrowKey) continue;
    const frames = stackOf(node.id);
    const guard = frames.findLastIndex((f) => f.functionName === 'withDocumentViewRead');
    if (guard > 0) wrappers.set(keyOf(frames[guard - 1]), (wrappers.get(keyOf(frames[guard - 1])) ?? 0) + 1);
  }
  const wrapperKeys = new Set(wrappers.keys());
  const result = { bodies: {}, direct: 0, underVisit: 0, childrenKeys: {}, total: 0, wrapperKeys: [...wrapperKeys] };
  const cache = new Map();
  const classify = (id) => {
    if (cache.has(id)) return cache.get(id);
    const frames = stackOf(id);
    const w = frames.findIndex((f) => wrapperKeys.has(keyOf(f)));
    let kind = null;
    if (w !== -1) {
      const above = frames.slice(0, w);
      const children = above.findLast((f) => f.functionName === 'Children');
      if (children && (childrenKey === 'any' || keyOf(children) === childrenKey)) {
        const from = above.lastIndexOf(children);
        // The source body is the arrow's callee; time above it is wrapper cost.
        const arrow = frames.findIndex((f, i) => i > w && keyOf(f) === arrowKey);
        const body = arrow !== -1 && arrow + 1 < frames.length ? keyOf(frames[arrow + 1]) : '(wrapper and guard)';
        kind = { body, children: keyOf(children), visit: above.slice(from + 1).some((f) => f.functionName === 'visit') };
      }
    }
    cache.set(id, kind);
    return kind;
  };
  for (const [index, id] of profile.samples.entries()) {
    const ms = Math.max(0, profile.timeDeltas[index + 1] ?? 0) / 1000;
    const kind = classify(id);
    if (!kind) continue;
    result.total += ms;
    if (kind.visit) result.underVisit += ms;
    else result.direct += ms;
    result.childrenKeys[kind.children] = (result.childrenKeys[kind.children] ?? 0) + ms;
    result.bodies[kind.body] = (result.bodies[kind.body] ?? 0) + ms;
  }
  return result;
};

const rows = [];
for (const [index, cell] of cells.entries()) {
  const from = Date.parse(cell.startedAt);
  const to = index + 1 < cells.length ? Date.parse(cells[index + 1].startedAt) : Infinity;
  const prefix = `${cell.composition}-candidate-`;
  const files = readdirSync(profileDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.cpuprofile'))
    .map((f) => [Number(f.slice(prefix.length).split('.')[0]), f])
    .filter(([ms]) => ms >= from && ms < to)
    .sort((a, b) => a[0] - b[0])
    .map(([, f]) => path.join(profileDir, f));
  const measured = files.slice(1);
  const streams = measured.map((file) => ({ file: path.basename(file), ...analyze(file) }));
  const row = {
    cell: cell.cell,
    decorationReadsMs: r1(median(streams.map((s) => s.total))),
    directMs: r1(median(streams.map((s) => s.direct))),
    underVisitMs: r1(median(streams.map((s) => s.underVisit))),
    streams: streams.map((s) => ({
      ...s,
      direct: r1(s.direct),
      total: r1(s.total),
      underVisit: r1(s.underVisit),
      childrenKeys: Object.fromEntries(Object.entries(s.childrenKeys).map(([k, v]) => [k, r1(v)])),
      bodies: Object.fromEntries(Object.entries(s.bodies).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, r1(v)])),
    })),
  };
  // Median per source body over the measured streams.
  const bodyKeys = [...new Set(streams.flatMap((s) => Object.keys(s.bodies)))];
  row.bodiesMs = Object.fromEntries(
    bodyKeys
      .map((k) => [k, r1(median(streams.map((s) => s.bodies[k] ?? 0)))])
      .sort((a, b) => b[1] - a[1])
  );
  rows.push(row);
  console.log(`${row.cell}: static decoration reads ${row.decorationReadsMs} ms (direct ${row.directMs}, under visit ${row.underVisitMs}) | wrappers ${JSON.stringify(streams[0]?.wrapperKeys)} | Children ${JSON.stringify(Object.keys(streams[0]?.childrenKeys ?? {}))}`);
  console.log(`  by source body (median ms per stream): ${Object.entries(row.bodiesMs).slice(0, 6).map(([k, v]) => `${k} ${v}`).join(' | ')}`);
}
if (out) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
