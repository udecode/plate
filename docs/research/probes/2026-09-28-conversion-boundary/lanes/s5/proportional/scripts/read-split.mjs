// Splits the static renderer's decoration source reads (samples under the Plate
// source wrapper below the static Children) by where the time goes: the code
// highlighter by path (early checks and identity hits, index lookup through
// view.key, text, highlighting), the AI end marker, and the wrapper and guard
// around the bodies. Reported per preview commit (median of the measured
// candidate streams), for the deferred render (renderRootConcurrent), for
// urgent renders (renderRootSync) and in total.
// Usage: node read-split.mjs <matrix-dir> <profile-dir> <arrow-key> <highlighter-body-key> <end-marker-body-key|none> [out.json]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [matrixDir, profileDir, arrowKey, highlighterKey, endMarkerKey, out] = process.argv.slice(2);
const keyOf = (f) => `${f.functionName || '(anon)'}@${f.url.split('/').pop()}:${f.columnNumber}`;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const r2 = (n) => Math.round(n * 100) / 100;
const INDEX = new Set(['materialize', 'keyAt', 'getNodeKey', 'getStateNodeKey', 'buildSnapshotIndex']);
const HIGHLIGHT = new Set(['highlight', 'highlightAuto', 'parseNodes', '_highlight', 'processLexeme', 'processBuffer']);
const LOOKUP = new Set(['plugin', 'getPlugin', 'resolveCodeBlock', 'getCompiledPlatePlugin']);
const PARTS = ['highlighter: early checks and identity hits', 'highlighter: re-path (atBlockPath)', 'highlighter: view.key and index', 'highlighter: text', 'highlighter: highlight and tokens', 'highlighter: plugin and store lookups', 'highlighter: other', 'end marker', 'wrapper and guard'];
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
  const wrappers = new Set();
  for (const node of profile.nodes) {
    if (keyOf(node.callFrame) !== arrowKey) continue;
    const frames = stackOf(node.id);
    const guard = frames.findLastIndex((f) => f.functionName === 'withDocumentViewRead');
    if (guard > 0) wrappers.add(keyOf(frames[guard - 1]));
  }
  const cache = new Map();
  const classify = (id) => {
    if (cache.has(id)) return cache.get(id);
    const frames = stackOf(id);
    let result = null;
    const w = frames.findIndex((f) => wrappers.has(keyOf(f)));
    const children = w === -1 ? -1 : frames.slice(0, w).findLastIndex((f) => f.functionName === 'Children');
    if (w !== -1 && children !== -1) {
      const phase = frames.slice(0, w).some((f) => f.functionName === 'renderRootConcurrent')
        ? 'deferred'
        : frames.slice(0, w).some((f) => f.functionName === 'renderRootSync')
          ? 'urgent'
          : 'other';
      const arrow = frames.findIndex((f, i) => i > w && keyOf(f) === arrowKey);
      const body = arrow !== -1 && arrow + 1 < frames.length ? frames[arrow + 1] : null;
      let part = 'wrapper and guard';
      if (body && keyOf(body) === endMarkerKey) part = 'end marker';
      else if (body && body.functionName === 'atBlockPath') part = 'highlighter: re-path (atBlockPath)';
      else if (body && keyOf(body) === highlighterKey) {
        const below = frames.slice(arrow + 2).map((f) => f.functionName);
        part = below.some((n) => INDEX.has(n) || n === 'key')
          ? 'highlighter: view.key and index'
          : below.some((n) => HIGHLIGHT.has(n))
            ? 'highlighter: highlight and tokens'
            : below.includes('atBlockPath')
              ? 'highlighter: re-path (atBlockPath)'
              : below.includes('string')
                ? 'highlighter: text'
                : below.some((n) => LOOKUP.has(n)) || (below[0] === 'get' && below.length <= 3)
                  ? 'highlighter: plugin and store lookups'
                  : below.length === 0 || below.every((n) => ['isElement', 'isParent', 'freeze', 'get', 'has', ''].includes(n))
                    ? 'highlighter: early checks and identity hits'
                    : 'highlighter: other';
      } else if (body) part = 'wrapper and guard';
      result = { part, phase };
    }
    cache.set(id, result);
    return result;
  };
  const sums = { deferred: {}, urgent: {}, other: {} };
  for (const [index, id] of profile.samples.entries()) {
    const ms = Math.max(0, profile.timeDeltas[index + 1] ?? 0) / 1000;
    const c = classify(id);
    if (!c) continue;
    sums[c.phase][c.part] = (sums[c.phase][c.part] ?? 0) + ms;
  }
  return sums;
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
  const measured = cell.streams.filter((s) => s.arm === 'candidate');
  const pairs = files.map((file, i) => [file, measured[i]]).filter(([, s]) => s.role.startsWith('pair-'));
  const streams = pairs.map(([file, s]) => ({ commits: Math.max(1, s.page.outputBatches - 1), sums: analyze(file) }));
  const perCommit = (phase) =>
    Object.fromEntries(
      PARTS.map((part) => [
        part,
        r2(median(streams.map((s) => (phase === 'total' ? (s.sums.deferred[part] ?? 0) + (s.sums.urgent[part] ?? 0) + (s.sums.other[part] ?? 0) : (s.sums[phase][part] ?? 0)) / s.commits))),
      ])
    );
  const row = { cell: cell.cell, deferred: perCommit('deferred'), urgent: perCommit('urgent'), total: perCommit('total') };
  const sum = (o) => r2(Object.values(o).reduce((a, b) => a + b, 0));
  row.deferredSum = sum(row.deferred);
  row.urgentSum = sum(row.urgent);
  row.totalSum = sum(row.total);
  rows.push(row);
  console.log(`${cell.cell}: source reads per commit, deferred ${row.deferredSum} ms, urgent ${row.urgentSum} ms, total ${row.totalSum} ms`);
  for (const part of PARTS) {
    if (row.total[part] > 0) console.log(`  ${part.padEnd(48)} deferred ${String(row.deferred[part]).padStart(6)}  urgent ${String(row.urgent[part]).padStart(6)}  total ${String(row.total[part]).padStart(6)}`);
  }
}
if (out) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
