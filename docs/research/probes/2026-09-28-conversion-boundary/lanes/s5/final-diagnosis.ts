// Lane S5: strict-final attribution per stream from the verdict receipts.
//   node --experimental-strip-types docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/final-diagnosis.ts <matrix-dir> [cell-filter]
// For each stream (warmups included): the final's duration (task and DOM),
// its CPU-profile split, the GC inside the final task, the heap sampled just
// before it and the live heap after the last full collection before it.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

type Stream = {
  arm: string;
  page: { finalMs: number | null; heapBeforeFinalMB?: number | null };
  profile?: {
    final: Record<string, number>;
  } | null;
  role: string;
  trace: {
    finalGc?: {
      majorCount: number;
      majorMs: number;
      minorCount: number;
      minorMs: number;
    } | null;
    heapAfterLastMajorGcMB?: number | null;
    lastArrivalTaskMs?: number;
  } | null;
};

const dir = process.argv[2];
const filter = process.argv[3] ?? '';
const pearson = (xs: number[], ys: number[]) => {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;

  for (let i = 0; i < n; i += 1) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }

  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
};

for (const file of readdirSync(dir).sort()) {
  if (!file.endsWith('.json') || file.startsWith('budget')) continue;
  if (!file.includes(filter)) continue;
  const receipt = JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as {
    cell: string;
    streams: Stream[];
  };
  const rows = receipt.streams.map((s) => ({
    arm: s.arm,
    domMs: s.page.finalMs,
    gcInTaskMs:
      (s.trace?.finalGc?.minorMs ?? 0) + (s.trace?.finalGc?.majorMs ?? 0),
    heapBeforeMB: s.page.heapBeforeFinalMB ?? null,
    liveHeapMB: s.trace?.heapAfterLastMajorGcMB ?? null,
    major: `${s.trace?.finalGc?.majorCount ?? 0}/${s.trace?.finalGc?.majorMs ?? 0}`,
    minor: `${s.trace?.finalGc?.minorCount ?? 0}/${s.trace?.finalGc?.minorMs ?? 0}`,
    parse: s.profile?.final.parse ?? null,
    react: s.profile?.final.react ?? null,
    role: s.role,
    taskMs: s.trace?.lastArrivalTaskMs ?? null,
    transaction: s.profile?.final.transaction ?? null,
  }));

  console.log(`\n${receipt.cell}`);
  for (const r of rows) {
    console.log(
      `  ${r.arm.padEnd(9)} ${r.role.padEnd(7)} task ${r.taskMs} dom ${r.domMs} | parse ${r.parse} txn ${r.transaction} react ${r.react} | gc minor ${r.minor} major ${r.major} | heap before ${r.heapBeforeMB} MB, live ${r.liveHeapMB} MB`
    );
  }
  const task = rows.map((r) => r.taskMs ?? 0);
  const gc = rows.map((r) => r.gcInTaskMs);
  const heap = rows.map((r) => r.heapBeforeMB ?? 0);
  const gcR = pearson(task, gc);
  const heapR = pearson(task, heap);

  console.log(
    `  r(final task, GC in task) = ${gcR?.toFixed(2)}; r(final task, heap before) = ${heapR?.toFixed(2)}`
  );
}
