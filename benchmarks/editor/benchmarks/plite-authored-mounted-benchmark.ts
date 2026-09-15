import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  appBuildEntries,
  browserBuildEntries,
  browserPlanEntries,
  hashEntries,
} from '../../../apps/plite/scripts/plite-proof-inputs.mjs';
import { runBoundedProcess } from '../../../tooling/scripts/run-bounded-process.mjs';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const contractPath =
  'docs/plans/artifacts/native-authored-changes/browser-mounted-contract.json';
const contractSource = readFileSync(contractPath, 'utf-8');
const contract = JSON.parse(contractSource) as {
  cohorts: Array<{ id: string }>;
  sampling: { passes: number; samplesPerPass: number };
};
const contractSha256 = createHash('sha256')
  .update(contractSource)
  .digest('hex');
const sourceEntries = [
  ...appBuildEntries,
  ...browserBuildEntries,
  ...browserPlanEntries,
  'benchmarks/editor/benchmarks/plite-authored-mounted-benchmark.ts',
];
const sourceBefore = hashEntries(sourceEntries);
const output =
  process.argv
    .find((value) => value.startsWith('--output='))
    ?.slice('--output='.length) ?? 'tmp/plite-authored-mounted-benchmark.json';
const rawDirectory = mkdtempSync(
  path.join(os.tmpdir(), 'plite-authored-mounted-')
);
const rows: Array<{
  checks: Record<string, boolean>;
  cohort: { id: string };
  contractSha256: string;
  pass: number;
}> = [];
const runs: Array<{ cohort: string; status: number | null }> = [];
let failure: string | null = null;

try {
  for (const cohort of contract.cohorts) {
    const run = await runBoundedProcess({
      command: 'pnpm',
      args: [
        '--filter',
        'plite',
        'test:plite-browser:chromium',
        'authored-mounted-performance.spec.ts',
      ],
      cwd: process.cwd(),
      env: {
        ...process.env,
        PLITE_AUTHORED_MOUNTED_PERFORMANCE: '1',
        PLITE_AUTHORED_MOUNTED_PERFORMANCE_COHORT: cohort.id,
        PLITE_AUTHORED_MOUNTED_PERFORMANCE_OUTPUT: rawDirectory,
        PLITE_BROWSER_FORCE_PROOF: '1',
        PLITE_BROWSER_MAX_TESTS_PER_PROCESS: '3',
        PLITE_BROWSER_PROJECT_CONCURRENCY: '1',
        PLITE_BROWSER_UNIT_WORKERS: '1',
      },
      stdio: 'inherit',
      timeoutMs: 900_000,
    });
    runs.push({ cohort: cohort.id, status: run.status });
    for (let pass = 0; pass < contract.sampling.passes; pass++) {
      const file = path.join(rawDirectory, `${cohort.id}-${pass}.json`);
      if (!existsSync(file)) continue;
      const row = JSON.parse(
        readFileSync(file, 'utf-8')
      ) as (typeof rows)[number];
      assert.equal(row.cohort.id, cohort.id);
      assert.equal(row.pass, pass);
      assert.equal(row.contractSha256, contractSha256);
      assert.ok(Object.values(row.checks).every(Boolean));
      rows.push(row);
    }
    if (run.status !== 0) break;
  }
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
}
const sourceAfter = hashEntries(sourceEntries);
const passed =
  !failure &&
  sourceBefore === sourceAfter &&
  runs.length === contract.cohorts.length &&
  runs.every((run) => run.status === 0) &&
  rows.length === contract.cohorts.length * contract.sampling.passes;
const result = {
  version: 1,
  benchmark: 'plite-authored-mounted',
  createdAt: new Date().toISOString(),
  contractSha256,
  sourceBefore,
  sourceAfter,
  rawDirectory,
  failure,
  passed,
  runs,
  rows,
  fullContractComplete: false,
  limitations:
    'Real 1/2/8 shared Editable roots, complete 1000-block/two-view DOM, no-preexisting-review controls, retained markup, trusted input and post-GC live-page heap. Setup and view-count changes are outside timing, so cold page hydration, disabled-capability overhead, decisions, collaboration transport, archive output and complete F30 remain separate.',
};
writeBenchmarkArtifact(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(
  `METRIC plite_authored_mounted_passed=${Number(passed)}\n`
);
if (!passed) process.exitCode = 1;
