// Lane S5: verdict per matrix cell from the receipts that
// apps/www/tests/browser/markdown-streaming-contract.spec.ts writes with
// S5_BENCH=1. Run from the repository root:
//   node --experimental-strip-types docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/summarize-matrix.ts <matrix-dir>
// Writes matrix-summary.json next to the matrix directory and prints a table.
//
// Gate (the plan's parse-plus-publish work): CPU-profile time in (a) parse and
// store (parseSlice/setPreview) plus (b) the preview transaction
// (updateEditor at the publish site). Every pair must be at least 20% and
// 100 ms lower, and the smallest pair gain must exceed each arm's spread.
// Latency checks: strict final p95 (max of the three pair final tasks) and
// arrival-to-DOM p95 (median of per-stream p95) regress by at most
// max(10%, 5 ms). Also reported: (c) React render and commit, total busy time
// from the trace, preview counts and the strict-final diagnostics.
// Receipts from before the profile attribution (no `profile` field) fall back
// to the trace publish-task time.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

type Share = Record<
  'gc' | 'other' | 'parse' | 'program' | 'react' | 'transaction',
  number
>;

type Stream = {
  arm: 'baseline' | 'candidate';
  finalTextSha256: string | null;
  page: {
    finalMs: number | null;
    heapBeforeFinalMB?: number | null;
    latencyP95Ms: number | null;
    previews: number;
    survival: { ratio: number | null };
  };
  profile?: {
    aligned: boolean;
    final: Share;
    publish: Share;
    stream: Share;
  } | null;
  role: string;
  timedOut: boolean;
  trace: {
    finalGc?: {
      majorCount: number;
      majorMs: number;
      minorCount: number;
      minorMs: number;
    } | null;
    finalSpanMs?: number | null;
    finalWorkMs?: number;
    heapAfterLastMajorGcMB?: number | null;
    lastArrivalTaskMs?: number;
    publishMs: number;
    totalMs: number;
  } | null;
};

type Receipt = {
  cell: string;
  packet?: string;
  status: string;
  streams: Stream[];
};

const dir = process.argv[2] ?? path.join(import.meta.dirname, 'matrix');
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};
const range = (values: number[]) => Math.max(...values) - Math.min(...values);
const allowed = (baseline: number) => Math.max(baseline * 0.1, 5);
const round = (value: number) => Math.round(value * 10) / 10;
const gate = (s: Stream) =>
  s.profile
    ? s.profile.stream.parse + s.profile.stream.transaction
    : s.trace!.publishMs;
// A profile whose samples lost their JS stacks reports most time as
// `(program)` (86% in the one seen) and more sampled time than the trace's
// busy time. Native layout and paint alone can pass 60% once the preview's
// JavaScript is small (static 10 KB with block reuse: 61-63%, the same
// absolute time as the baseline arm), so the bound is 80%.
const profileValid = (s: Stream) => {
  if (!s.profile || !s.trace) return true;
  const p = s.profile.stream;
  const sampled = p.parse + p.transaction + p.react + p.gc + p.program + p.other;
  const ratio = sampled / s.trace.totalMs;

  return ratio >= 0.8 && ratio <= 1.2 && p.program / sampled < 0.8;
};
// The strict final's cost is the task time from the task that runs it (the
// last chunk's arrival, or the AI stream close) through the task that renders
// it, which is later when the preview is React state. It is measured even when
// the final renders exactly like the last preview. Older receipts have only the
// running task; the DOM-based time is the last fallback.
const finalOf = (s: Stream) =>
  s.trace?.finalWorkMs ||
  s.trace?.lastArrivalTaskMs ||
  (s.page.finalMs !== null && s.page.finalMs >= 0 ? s.page.finalMs : null);

const cells = readdirSync(dir)
  .filter((file) => file.endsWith('.json') && !file.startsWith('budget'))
  .map(
    (file) => JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Receipt
  );

const summary = cells.map((receipt) => {
  const measured = receipt.streams.filter((s) => s.role.startsWith('pair-'));
  const pairs = [...new Set(measured.map((s) => s.role))].map((role) => ({
    baseline: measured.find((s) => s.role === role && s.arm === 'baseline'),
    candidate: measured.find((s) => s.role === role && s.arm === 'candidate'),
    role,
  }));
  const invalid = measured.filter((s) => !profileValid(s));
  const complete =
    receipt.status === 'complete' &&
    pairs.length >= 3 &&
    pairs.every((p) => p.baseline?.trace && p.candidate?.trace) &&
    invalid.length === 0;

  if (!complete) {
    return {
      cell: receipt.cell,
      packet: receipt.packet ?? null,
      status: invalid.length
        ? `profile lost its stacks in ${invalid.map((s) => `${s.arm} ${s.role}`).join(', ')}`
        : receipt.status,
      streams: receipt.streams.map((s) => ({
        arm: s.arm,
        gateMs: s.trace ? round(gate(s)) : null,
        role: s.role,
        timedOut: s.timedOut,
      })),
      verdict: 'inconclusive',
    };
  }

  const arm = (name: 'baseline' | 'candidate') =>
    pairs.map((p) => p[name]!);
  const values = (
    name: 'baseline' | 'candidate',
    pick: (s: Stream) => number | null | undefined
  ) =>
    arm(name)
      .map(pick)
      .filter((v): v is number => v !== null && v !== undefined);
  const work = pairs.map((p) => ({
    baseline: gate(p.baseline!),
    candidate: gate(p.candidate!),
  }));
  const gains = work.map((w) => w.baseline - w.candidate);
  const ratios = work.map((w) => (w.baseline - w.candidate) / w.baseline);
  const spread = Math.max(
    range(work.map((w) => w.baseline)),
    range(work.map((w) => w.candidate))
  );
  const workPass = ratios.every((r, i) => r >= 0.2 && gains[i] >= 100);
  const clearlyMisses = ratios.every((r, i) => r < 0.2 || gains[i] < 100);
  const outsideVariation = Math.min(...gains) > spread;
  const finalBaseline = Math.max(...values('baseline', finalOf));
  const finalCandidate = Math.max(...values('candidate', finalOf));
  const latencyBaseline = median(
    values('baseline', (s) => s.page.latencyP95Ms)
  );
  const latencyCandidate = median(
    values('candidate', (s) => s.page.latencyP95Ms)
  );
  const finalOk = finalCandidate <= finalBaseline + allowed(finalBaseline);
  const latencyOk =
    latencyCandidate <= latencyBaseline + allowed(latencyBaseline);
  const texts = new Set(receipt.streams.map((s) => s.finalTextSha256));
  const verdict =
    workPass && outsideVariation && finalOk && latencyOk
      ? 'pass'
      : clearlyMisses || !finalOk || !latencyOk
        ? 'fail'
        : 'inconclusive';
  const mean = (list: number[]) =>
    list.length ? round(list.reduce((a, b) => a + b, 0) / list.length) : null;
  const share = (
    name: 'baseline' | 'candidate',
    key: keyof Share,
    scope: 'final' | 'publish' | 'stream' = 'stream'
  ) => mean(values(name, (s) => s.profile?.[scope][key]));
  const breakdown = (name: 'baseline' | 'candidate') => ({
    busyMs: mean(values(name, (s) => s.trace?.totalMs)),
    gcMs: share(name, 'gc'),
    parseMs: share(name, 'parse'),
    reactMs: share(name, 'react'),
    reactInPublishTasksMs: share(name, 'react', 'publish'),
    transactionMs: share(name, 'transaction'),
  });
  const finalDiagnosis = (name: 'baseline' | 'candidate') =>
    arm(name).map((s) => ({
      domMs: s.page.finalMs ?? null,
      finalMs: finalOf(s),
      gcMajorMs: s.trace?.finalGc?.majorMs ?? null,
      gcMinorMs: s.trace?.finalGc?.minorMs ?? null,
      heapAfterLastMajorGcMB: s.trace?.heapAfterLastMajorGcMB ?? null,
      heapBeforeFinalMB: s.page.heapBeforeFinalMB ?? null,
      parseMs: s.profile?.final.parse ?? null,
      reactMs: s.profile?.final.react ?? null,
      lastArrivalTaskMs: s.trace?.lastArrivalTaskMs ?? null,
      spanMs: s.trace?.finalSpanMs ?? null,
      taskMs: finalOf(s),
      transactionMs: s.profile?.final.transaction ?? null,
    }));

  return {
    breakdown: { baseline: breakdown('baseline'), candidate: breakdown('candidate') },
    cell: receipt.cell,
    checks: { finalOk, latencyOk, outsideVariation, workPass },
    finalDiagnosis: {
      baseline: finalDiagnosis('baseline'),
      candidate: finalDiagnosis('candidate'),
    },
    finalMs: { baseline: finalBaseline, candidate: finalCandidate },
    finalTextsMatch: texts.size === 1,
    latencyP95Ms: { baseline: latencyBaseline, candidate: latencyCandidate },
    packet: receipt.packet ?? null,
    pairs: work.map((w, i) => ({
      baseline: round(w.baseline),
      candidate: round(w.candidate),
      gainMs: round(gains[i]),
      gainPercent: round(ratios[i] * 100),
    })),
    previews: {
      baseline: values('baseline', (s) => s.page.previews),
      candidate: values('candidate', (s) => s.page.previews),
    },
    spreadMs: round(spread),
    status: receipt.status,
    verdict,
  };
});

writeFileSync(
  path.join(path.dirname(dir), 'matrix-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`
);
for (const row of summary) {
  if (!('pairs' in row)) {
    console.log(`${row.cell}: ${row.verdict} (${row.status})`);
    continue;
  }
  const b = row.breakdown.baseline;
  const c = row.breakdown.candidate;
  console.log(
    `${row.cell}: ${row.verdict} | a+b ${row.pairs
      .map((p) => `${p.baseline}→${p.candidate} (${-p.gainPercent}%)`)
      .join(', ')} | a ${b.parseMs}→${c.parseMs} b ${b.transactionMs}→${c.transactionMs} c ${b.reactMs}→${c.reactMs} busy ${b.busyMs}→${c.busyMs} | final p95 ${row.finalMs.baseline}→${row.finalMs.candidate} | arrival p95 ${row.latencyP95Ms.baseline}→${row.latencyP95Ms.candidate} | previews ${row.previews.baseline.join('/')}→${row.previews.candidate.join('/')} | texts ${row.finalTextsMatch ? 'match' : 'DIFFER'}`
  );
}
