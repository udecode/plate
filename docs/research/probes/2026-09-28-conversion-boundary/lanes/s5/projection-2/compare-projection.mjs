// Usage: node compare-projection.mjs <projection-summary.json> <verdict-2-summary.json> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';

const [, , projPath, v2Path, outPath] = process.argv;
const proj = JSON.parse(readFileSync(projPath, 'utf8'));
const v2 = new Map(JSON.parse(readFileSync(v2Path, 'utf8')).map((row) => [row.cell, row]));
const r = (n) => (n == null ? null : Math.round(n * 10) / 10);
const pct = (a, b) => (b ? r(((a - b) / b) * 100) : null);
const worstFinal = (list) => list?.reduce((w, f) => (!w || f.taskMs > w.taskMs ? f : w), null);
const split = (f) => f && { taskMs: r(f.taskMs), arrivalTask: r(f.lastArrivalTaskMs), span: r(f.spanMs), dom: r(f.domMs), parse: r(f.parseMs), transaction: r(f.transactionMs), react: r(f.reactMs), gcMinor: r(f.gcMinorMs), gcMajor: r(f.gcMajorMs) };

const rows = proj.map((row) => {
  const old = v2.get(row.cell);
  const arm = (b) => b && { a: r(b.parseMs), b: r(b.transactionMs), c: r(b.reactMs), gc: r(b.gcMs), busy: r(b.busyMs) };
  const cand = row.breakdown?.candidate;
  const oldCand = old?.breakdown?.candidate;
  const vs = cand && oldCand && Object.fromEntries(
    [['a', 'parseMs'], ['b', 'transactionMs'], ['c', 'reactMs'], ['gc', 'gcMs'], ['busy', 'busyMs']].map(([k, key]) => [
      k,
      { splice: r(oldCand[key]), projection: r(cand[key]), deltaMs: r(cand[key] - oldCand[key]), deltaPercent: pct(cand[key], oldCand[key]) },
    ])
  );
  return {
    cell: row.cell,
    verdict: row.verdict,
    status: row.status,
    checks: row.checks,
    baseline: arm(row.breakdown?.baseline),
    candidate: arm(cand),
    pairs: row.pairs?.map((p) => ({ baseline: r(p.baseline), candidate: r(p.candidate), gainPercent: r(p.gainPercent) })),
    spreadMs: r(row.spreadMs),
    finalP95: {
      baseline: r(row.finalMs?.baseline),
      candidate: r(row.finalMs?.candidate),
      baselineSplit: split(worstFinal(row.finalDiagnosis?.baseline)),
      candidateSplit: split(worstFinal(row.finalDiagnosis?.candidate)),
    },
    arrivalP95: { baseline: r(row.latencyP95Ms?.baseline), candidate: r(row.latencyP95Ms?.candidate) },
    vsVerdict2Candidate: vs && {
      ...vs,
      finalP95: { splice: r(old.finalMs?.candidate), projection: r(row.finalMs?.candidate) },
      finalSplit: { splice: split(worstFinal(old.finalDiagnosis?.candidate)), projection: split(worstFinal(row.finalDiagnosis?.candidate)) },
      arrivalP95: { splice: r(old.latencyP95Ms?.candidate), projection: r(row.latencyP95Ms?.candidate) },
      pairsAB: { splice: old.pairs?.map((p) => r(p.candidate)), projection: row.pairs?.map((p) => r(p.candidate)) },
    },
  };
});
writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`);
for (const x of rows) {
  const v = x.vsVerdict2Candidate;
  console.log(
    `${x.cell.padEnd(16)} ${String(x.verdict).padEnd(5)} base a/b/c/busy ${x.baseline?.a}/${x.baseline?.b}/${x.baseline?.c}/${x.baseline?.busy}  cand ${x.candidate?.a}/${x.candidate?.b}/${x.candidate?.c}/${x.candidate?.busy}  pairs ${x.pairs?.map((p) => `${p.baseline}->${p.candidate} (${p.gainPercent}%)`).join(', ')}  spread ${x.spreadMs}`
  );
  console.log(
    `   final ${x.finalP95.baseline}->${x.finalP95.candidate} cand split ${JSON.stringify(x.finalP95.candidateSplit)} base split ${JSON.stringify(x.finalP95.baselineSplit)} arrival ${x.arrivalP95.baseline}->${x.arrivalP95.candidate}`
  );
  if (v) console.log(`   vs v2 cand: b ${v.b.splice}->${v.b.projection} (${v.b.deltaPercent}%)  c ${v.c.splice}->${v.c.projection} (${v.c.deltaPercent}%)  busy ${v.busy.splice}->${v.busy.projection} (${v.busy.deltaPercent}%)  a ${v.a.splice}->${v.a.projection}  gc ${v.gc.splice}->${v.gc.projection}  final ${v.finalP95.splice}->${v.finalP95.projection}  arrival ${v.arrivalP95.splice}->${v.arrivalP95.projection}  (a+b) ${v.pairsAB.splice}->${v.pairsAB.projection}`);
}
