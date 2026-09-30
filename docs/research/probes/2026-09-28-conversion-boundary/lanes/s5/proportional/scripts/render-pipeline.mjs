// Main-thread rendering-pipeline time per stream from the saved traces: style
// recalculation, layout, pre-paint, paint and layerization, within the stream
// window (start mark to last output change), per preview commit.
// Usage: node render-pipeline.mjs <matrix-dir> <trace-dir> [out.json]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [matrixDir, traceDir, out] = process.argv.slice(2);
const NAMES = ['UpdateLayoutTree', 'Layout', 'PrePaint', 'Paint', 'Layerize'];
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const r2 = (n) => Math.round(n * 100) / 100;
const cells = readdirSync(matrixDir)
  .filter((f) => f.endsWith('.json') && !f.startsWith('budget'))
  .map((f) => JSON.parse(readFileSync(path.join(matrixDir, f), 'utf8')))
  .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
const rows = [];
for (const [index, cell] of cells.entries()) {
  const from = Date.parse(cell.startedAt);
  const to = index + 1 < cells.length ? Date.parse(cells[index + 1].startedAt) : Infinity;
  const result = {};
  for (const arm of ['baseline', 'candidate']) {
    const prefix = `${cell.composition}-${arm}-`;
    const files = readdirSync(traceDir)
      .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
      .map((f) => [Number(f.slice(prefix.length).split('.')[0]), f])
      .filter(([ms]) => ms >= from && ms < to)
      .sort((a, b) => a[0] - b[0])
      .map(([, f]) => path.join(traceDir, f));
    const streams = cell.streams.filter((s) => s.arm === arm);
    const measured = files
      .map((file, i) => [file, streams[i]])
      .filter(([, s]) => s.role.startsWith('pair-'));
    const perStream = measured.map(([file, s]) => {
      const events = JSON.parse(readFileSync(file, 'utf8'));
      const start = events.find((e) => e.name === 's5-start');
      const main = events.filter((e) => e.pid === start.pid && e.tid === start.tid);
      const marks = main.filter((e) => e.name === 's5-batch').map((e) => e.ts).sort((a, b) => a - b);
      const end = marks.at(-1);
      const sums = Object.fromEntries(NAMES.map((n) => [n, 0]));
      for (const e of main) {
        if (e.ph !== 'X' || !NAMES.includes(e.name)) continue;
        if (e.ts < start.ts || e.ts > end) continue;
        sums[e.name] += (e.dur ?? 0) / 1000;
      }
      const total = Object.values(sums).reduce((a, b) => a + b, 0);
      const commits = marks.length - 1;
      return { commits, perCommitMs: r2(total / commits), sums: Object.fromEntries(Object.entries(sums).map(([k, v]) => [k, r2(v)])), totalMs: r2(total) };
    });
    result[arm] = {
      perCommitMs: r2(median(perStream.map((s) => s.perCommitMs))),
      totalMs: r2(median(perStream.map((s) => s.totalMs))),
      byEvent: Object.fromEntries(NAMES.map((n) => [n, r2(median(perStream.map((s) => s.sums[n])))])),
      streams: perStream,
    };
  }
  rows.push({ cell: cell.cell, ...result });
  console.log(`${cell.cell}: candidate style+layout+paint ${result.candidate.totalMs} ms per stream, ${result.candidate.perCommitMs} per commit ${JSON.stringify(result.candidate.byEvent)} | baseline ${result.baseline.perCommitMs} per commit`);
}
if (out) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
