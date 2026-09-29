// Per-cell medians over the three measured pairs, splice (verdict-2) vs projection,
// raw and normalized by the same pair's baseline stream.
// Usage: node median-compare.mjs <v2-matrix-dir> <proj-matrix-dir> [out.json]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , v2Dir, projDir, out] = process.argv;
const load = (dir) =>
  new Map(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json') && !f.startsWith('budget'))
      .map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')))
      .map((r) => [r.cell, r])
  );
const median = (v) => {
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const r1 = (n) => Math.round(n * 10) / 10;
const metrics = {
  a: (s) => s.profile.stream.parse,
  b: (s) => s.profile.stream.transaction,
  c: (s) => s.profile.stream.react,
  busy: (s) => s.trace.totalMs,
  final: (s) => s.trace.finalWorkMs || s.trace.lastArrivalTaskMs,
};
const cell = (receipt) => {
  const pairs = receipt.streams.filter((s) => s.role.startsWith('pair-'));
  const roles = [...new Set(pairs.map((s) => s.role))];
  return Object.fromEntries(
    Object.entries(metrics).map(([k, f]) => {
      const cand = roles.map((role) => f(pairs.find((s) => s.role === role && s.arm === 'candidate')));
      const base = roles.map((role) => f(pairs.find((s) => s.role === role && s.arm === 'baseline')));
      return [k, { candidate: r1(median(cand)), baseline: r1(median(base)), ratio: Math.round(median(cand.map((c, i) => c / base[i])) * 1000) / 1000 }];
    })
  );
};
const v2 = load(v2Dir);
const pj = load(projDir);
const rows = [...pj.keys()].sort().map((name) => {
  const s = cell(v2.get(name));
  const p = cell(pj.get(name));
  return {
    cell: name,
    ...Object.fromEntries(
      Object.keys(metrics).map((k) => [
        k,
        {
          splice: s[k].candidate,
          projection: p[k].candidate,
          rawDeltaPercent: r1((p[k].candidate / s[k].candidate - 1) * 100),
          baselineDriftPercent: r1((p[k].baseline / s[k].baseline - 1) * 100),
          ratioToBaseline: { splice: s[k].ratio, projection: p[k].ratio },
          normalizedDeltaPercent: r1((p[k].ratio / s[k].ratio - 1) * 100),
        },
      ])
    ),
  };
});
if (out) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
for (const row of rows) {
  console.log(row.cell);
  for (const k of Object.keys(metrics)) {
    const m = row[k];
    console.log(`  ${k.padEnd(5)} splice ${m.splice} -> projection ${m.projection} (raw ${m.rawDeltaPercent}%, baseline drift ${m.baselineDriftPercent}%, normalized ${m.normalizedDeltaPercent}%; cand/base ${m.ratioToBaseline.splice} -> ${m.ratioToBaseline.projection})`);
  }
}
