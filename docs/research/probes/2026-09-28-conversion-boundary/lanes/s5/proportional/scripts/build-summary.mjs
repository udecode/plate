// Builds summary-<tag>.json: per cell, the run's verdict and candidate medians
// next to snapshot w and projection-2 (p2) from reuse/summary-w.json.
// Usage: node build-summary.mjs <proportional-dir> <reuse-dir> <tag>
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [dir, reuseDir, tag] = process.argv.slice(2);
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const byCell = (rows) => new Map(rows.map((row) => [row.cell, row]));
const matrix = byCell(read(path.join(dir, 'matrix-summary.json')));
const table = byCell(read(path.join(dir, 'stream-table.json')));
const drift = byCell(read(path.join(dir, 'compare-w.json')));
const w = byCell(read(path.join(reuseDir, 'summary-w.json')));
const decorRun = byCell(read(path.join(dir, 'decor-sources', `all-reads-${tag}.json`)));
const decorW = byCell(read(path.join(dir, 'decor-sources', 'all-reads-w.json')));
const commits = byCell(read(path.join(dir, 'chunking', 'commit-cost.json')));

const summary = [...w.keys()].map((cell) => {
  const m = matrix.get(cell);
  const t = table.get(cell).medians;
  const d = drift.get(cell);
  const was = w.get(cell);
  const c = commits.get(cell).medians;

  return {
    cell,
    verdict: m.verdict,
    checks: m.checks,
    load: t.candidate.load1,
    baselineDriftVsW: Object.fromEntries(
      ['a', 'b', 'c', 'busy'].map((k) => [k, Math.round(d[k].baselineDriftPercent)])
    ),
    c: { p2: was.c.p2, w: was.c.w, [tag]: t.candidate.c },
    busy: { p2: was.busy.p2, w: was.busy.w, [tag]: t.candidate.busy },
    // Harness tallies (inclusive stream ms, candidate median). Their scope
    // changed since w; see README.
    blockDecorations: { w: was.blockDecorations.w, [tag]: t.candidate.functions.staticBlockDecorations },
    withDocumentViewRead: { w: was.withDocumentViewRead.w, [tag]: t.candidate.functions.withDocumentViewRead },
    // Every static decoration source read (decor-all.mjs), comparable across runs.
    staticDecorationReads: {
      w: decorW.get(cell).decorationReadsMs,
      [tag]: decorRun.get(cell).decorationReadsMs,
      direct: decorRun.get(cell).directMs,
      underVisit: decorRun.get(cell).underVisitMs,
    },
    final: m.finalMs,
    arrival: m.latencyP95Ms,
    finalW: was.final,
    arrivalW: was.arrival,
    abPairs: m.pairs.map((p) => [Math.round(p.baseline), Math.round(p.candidate)]),
    previews: m.previews,
    commits: {
      publications: c.candidate.publications,
      previewCommits: c.candidate.previewCommits,
      commitsShowingSkips: c.candidate.commitsShowingSkips,
      reactPerCommitMs: c.candidate.reactPerCommitMs,
      reactPerCommitP90Ms: c.candidate.reactPerCommitP90Ms,
      renderPerCommitMs: c.candidate.renderPerCommitMs,
      reactPerPublicationMs: c.candidate.reactPerPublicationMs,
      renderPerPublicationMs: c.candidate.renderPerPublicationMs,
      reactPhasesPerCommitMs: c.candidate.reactPhasesPerCommitMs,
    },
    finalTextsMatch: m.finalTextsMatch,
  };
});
writeFileSync(path.join(dir, `summary-${tag}.json`), `${JSON.stringify(summary, null, 2)}\n`);
for (const s of summary) {
  console.log(
    `${s.cell}: ${s.verdict} load ${s.load} drift a ${s.baselineDriftVsW.a}% b ${s.baselineDriftVsW.b}% | c p2 ${s.c.p2} w ${s.c.w} ${tag} ${s.c[tag]} | busy p2 ${s.busy.p2} w ${s.busy.w} ${tag} ${s.busy[tag]} | blockDecor w ${s.blockDecorations.w} ${tag} ${s.blockDecorations[tag]} | wdvr w ${s.withDocumentViewRead.w} ${tag} ${s.withDocumentViewRead[tag]} | decor reads w ${s.staticDecorationReads.w} ${tag} ${s.staticDecorationReads[tag]} | final ${s.final.baseline}->${s.final.candidate} (w ${s.finalW.candidate}) arrival ${s.arrival.baseline}->${s.arrival.candidate} (w ${s.arrivalW.candidate})`
  );
}
