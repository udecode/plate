// Per-stream table (load, profile split, finals, hot-function tallies) and
// per-cell medians over the measured pairs.
// Usage: node stream-table.mjs <matrix-dir> [out.json]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , dir, out] = process.argv;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10);
const cells = readdirSync(dir)
  .filter((f) => f.endsWith('.json') && !f.startsWith('budget'))
  .map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')));
const rows = cells.map((cell) => {
  const streams = cell.streams.map((s) => ({
    arm: s.arm,
    role: s.role,
    load1: r1(s.loadavg[0]),
    a: r1(s.profile?.stream.parse),
    b: r1(s.profile?.stream.transaction),
    c: r1(s.profile?.stream.react),
    busy: r1(s.trace?.totalMs),
    finalMs: r1(s.trace?.finalWorkMs ?? s.trace?.lastArrivalTaskMs),
    wallS: r1(s.page.wallMs / 1000),
    functions: s.profile?.functions ?? null,
  }));
  const pairs = streams.filter((s) => s.role.startsWith('pair-'));
  const med = (arm) => {
    const list = pairs.filter((s) => s.arm === arm);
    if (list.length === 0) return null;
    const names = Object.keys(list[0].functions ?? {});
    return {
      load1: r1(median(list.map((s) => s.load1))),
      a: r1(median(list.map((s) => s.a))),
      b: r1(median(list.map((s) => s.b))),
      c: r1(median(list.map((s) => s.c))),
      busy: r1(median(list.map((s) => s.busy))),
      finalMs: r1(median(list.map((s) => s.finalMs))),
      functions: Object.fromEntries(names.map((n) => [n, r1(median(list.map((s) => s.functions[n])))])),
    };
  };
  return { cell: cell.cell, status: cell.status, medians: { baseline: med('baseline'), candidate: med('candidate') }, streams };
});
if (out) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
for (const row of rows.sort((x, y) => x.cell.localeCompare(y.cell))) {
  console.log(`${row.cell} (${row.status})`);
  for (const s of row.streams) {
    const f = s.functions ?? {};
    console.log(
      `  ${s.arm.padEnd(9)} ${s.role.padEnd(7)} load ${String(s.load1).padStart(4)} a ${s.a} b ${s.b} c ${s.c} busy ${s.busy} final ${s.finalMs} | assert ${f.assertDocument} project ${f.createProjectedEditorView} json ${f.isEditorJsonValue} update ${f.updateEditor} projRead ${f.withEditorDocumentProjection}`
    );
  }
}
