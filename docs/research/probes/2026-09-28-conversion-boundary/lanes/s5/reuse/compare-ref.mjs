// Per-cell medians over the three measured pairs: a reference run's candidate
// against this run's candidate, raw and normalized by each run's same-pair
// baseline, for a (parse), b (publication), c (React), busy, final and
// arrival p95.
// Usage: node compare-ref.mjs <reference-matrix-dir> <matrix-dir> [out.json]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , refDir, runDir, out] = process.argv;
const load = (dir) =>
  new Map(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json') && !f.startsWith('budget'))
      .map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')))
      .filter((r) => r.status === 'complete')
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
  arrival: (s) => s.page.latencyP95Ms,
};
const cell = (receipt) => {
  const pairs = receipt.streams.filter((s) => s.role.startsWith('pair-'));
  const roles = [...new Set(pairs.map((s) => s.role))];
  const pick = (role, arm) => pairs.find((s) => s.role === role && s.arm === arm);
  return Object.fromEntries(
    Object.entries(metrics).map(([k, f]) => {
      const cand = roles.map((role) => f(pick(role, 'candidate')));
      const base = roles.map((role) => f(pick(role, 'baseline')));
      return [
        k,
        {
          baseline: r1(median(base)),
          candidate: r1(median(cand)),
          ratio: Math.round(median(cand.map((c, i) => c / base[i])) * 1000) / 1000,
        },
      ];
    })
  );
};
const ref = load(refDir);
const run = load(runDir);
const rows = [...run.keys()]
  .filter((name) => ref.has(name))
  .sort()
  .map((name) => {
    const was = cell(ref.get(name));
    const now = cell(run.get(name));
    return {
      cell: name,
      ...Object.fromEntries(
        Object.keys(metrics).map((k) => [
          k,
          {
            baseline: now[k].baseline,
            candidate: now[k].candidate,
            candidateVsBaseline: now[k].ratio,
            reference: was[k].candidate,
            rawDeltaPercent: r1((now[k].candidate / was[k].candidate - 1) * 100),
            baselineDriftPercent: r1((now[k].baseline / was[k].baseline - 1) * 100),
            normalizedDeltaPercent: r1((now[k].ratio / was[k].ratio - 1) * 100),
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
    console.log(
      `  ${k.padEnd(8)} base ${m.baseline} cand ${m.candidate} (x${m.candidateVsBaseline}) | ref ${m.reference} -> ${m.candidate}: raw ${m.rawDeltaPercent}%, drift ${m.baselineDriftPercent}%, normalized ${m.normalizedDeltaPercent}%`
    );
  }
}
