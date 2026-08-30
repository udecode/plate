import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  DEFAULT_BENCHMARK_LANES,
  validateBenchmarkPlan,
} from './validate-benchmark-plan.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const frontmatterPattern = /^---\n([\s\S]*?)\n---/;

const expectedGeneratedSkill = ({ name, sourcePath }) => {
  const source = read(sourcePath);
  const frontmatter = source.match(frontmatterPattern);

  assert.ok(frontmatter);

  return `---\n${frontmatter[1]}\nname: ${name}\nmetadata:\n  skiller:\n    source: ${sourcePath}\n---${source.slice(frontmatter[0].length)}`;
};

const laneRows = (overrides = {}) =>
  DEFAULT_BENCHMARK_LANES.map((lane, index) => {
    const row = overrides[lane] ?? {};
    const status = row.status ?? 'pending';
    const evidence =
      row.evidence ??
      (status === 'pending' ? 'pending' : `${lane} ${status} evidence`);
    const next =
      row.next ?? (status === 'pending' ? 'pending' : `${lane} ${status} next`);

    return `| ${index + 1} | ${lane} | ${row.applies ?? 'yes'} | ${status} | ${evidence} | ${next} |`;
  }).join('\n');

const causeHistoryRows = (history = []) =>
  (history.length > 0
    ? history
    : [
        {
          benchmarkResult: 'pending',
          benchmarkCommand: 'pending',
          causalEvidence: 'pending',
          causeId: 'pending',
          correctnessGuardResult: 'pending',
          correctnessCommand: 'pending',
          correctnessResult: 'pending',
          decision: 'pending',
          evidence: 'pending',
          lane: 'pending',
        },
      ]
  )
    .map((row) => {
      const defaults =
        row.causeId === 'none'
          ? {
              compatibilityVerdict: 'N/A: no cause was found',
              decisionOwner: 'N/A: no cause was found',
              fixClass: 'N/A: no cause was found',
              fixOwner: 'N/A: no cause was found',
              layerPlan: 'N/A: no cause was found',
              longTermTarget: 'N/A: no cause was found',
            }
          : row.causeId === 'pending'
            ? {
                compatibilityVerdict: 'pending',
                decisionOwner: 'pending',
                fixClass: 'pending',
                fixOwner: 'pending',
                layerPlan: 'pending',
                longTermTarget: 'pending',
              }
            : provenCause;

      return `| ${row.causeId} | ${row.lane} | ${row.decision} | ${row.fixClass ?? defaults.fixClass} | ${row.longTermTarget ?? defaults.longTermTarget} | ${row.decisionOwner ?? defaults.decisionOwner} | ${row.layerPlan ?? defaults.layerPlan} | ${row.compatibilityVerdict ?? defaults.compatibilityVerdict} | ${row.fixOwner ?? defaults.fixOwner} | ${row.causalEvidence} | ${row.correctnessGuardResult} | ${row.benchmarkCommand} | ${row.benchmarkResult} | ${row.correctnessCommand} | ${row.correctnessResult} | ${row.evidence} |`;
    })
    .join('\n');

const plan = ({
  cause = {},
  history = [],
  invocation = '$benchmark all',
  rows = {},
  source = {},
} = {}) => `
## Benchmark Source

- request: test fixture
- scope: test scope
- invocation: ${invocation}
- candidate-identity: ${source.candidateIdentity ?? 'ref: candidate-test'}
- plate-main-identity: ${source.plateMainIdentity ?? 'ref: main-test'}
- plite-identity: ${source.pliteIdentity ?? 'fingerprint: plite-test'}
- slate-identity: ${source.slateIdentity ?? 'commit: slate-test'}
- named-symptom: test action
- final-artifacts: ${source.finalArtifacts ?? 'artifact: tmp/test-result.json'}

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | ref: candidate-test | ref: baseline-test | artifact: tmp/refs.json |
| lockfile / package manager | pnpm candidate | pnpm baseline | artifact: tmp/lock-signature.json |
| build mode / host / port | production localhost:3101 | production localhost:3102 | artifact: tmp/hosts.json |
| browser / machine / viewport / DPR | Chromium test machine 1280x720 DPR1 | Chromium test machine 1280x720 DPR1 | artifact: tmp/browser.json |
| route / fixture / document / plugins | candidate matched fixture | baseline matched fixture | artifact: tmp/fixture.json |
| setup / action / DOM strategy | candidate trusted type auto DOM | baseline trusted type auto DOM | artifact: tmp/action.json |
| warmups / samples / interleave order | candidate 3 warmups 20 samples ABBA | baseline 3 warmups 20 samples ABBA | artifact: tmp/samples.json |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
${laneRows(rows)}

## Current Cause Checkpoint

- state: ${cause.state ?? 'none'}
- cause-id: ${cause.causeId ?? 'N/A: no cause'}
- lane: ${cause.lane ?? 'N/A: no cause'}
- comparable-baseline: ${cause.comparableBaseline ?? 'N/A: no cause'}
- material-delta: ${cause.materialDelta ?? 'N/A: no cause'}
- isolated-owner: ${cause.isolatedOwner ?? 'N/A: no cause'}
- causal-intervention: ${cause.causalIntervention ?? 'N/A: no cause'}
- correctness-guard-result: ${cause.correctnessGuardResult ?? 'pending'}
- fix-class: ${cause.fixClass ?? 'N/A: no cause'}
- long-term-target: ${cause.longTermTarget ?? 'N/A: no cause'}
- decision-owner: ${cause.decisionOwner ?? 'N/A: no cause'}
- layer-plan: ${cause.layerPlan ?? 'N/A: no cause'}
- compatibility-verdict: ${cause.compatibilityVerdict ?? 'N/A: no cause'}
- fix-owner: ${cause.fixOwner ?? 'N/A: no cause'}
- benchmark-command: ${cause.benchmarkCommand ?? 'N/A: no cause'}
- benchmark-rerun: ${cause.benchmarkRerun ?? 'N/A: no cause'}
- benchmark-rerun-result: ${cause.benchmarkRerunResult ?? 'pending'}
- correctness-command: ${cause.correctnessCommand ?? 'N/A: no cause'}
- correctness-rerun: ${cause.correctnessRerun ?? 'N/A: no cause'}
- correctness-rerun-result: ${cause.correctnessRerunResult ?? 'pending'}
- resume-lane: ${cause.resumeLane ?? 'N/A: no cause'}

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${causeHistoryRows(history)}
`;

const provenCause = {
  benchmarkCommand: 'pnpm bench exact',
  benchmarkRerun: 'pnpm bench exact',
  causalIntervention: 'disabling owner removes the measured delta',
  compatibilityVerdict: 'N/A: no public compatibility decision',
  causeId: 'plate-core-mount-tax',
  comparableBaseline: 'same fixture, browser, machine, and production build',
  correctnessGuardResult: 'pass: existing editor behavior remains green',
  correctnessCommand: 'pnpm test exact',
  correctnessRerun: 'pnpm test exact',
  decisionOwner: 'benchmark',
  fixClass: 'internal-implementation',
  fixOwner: 'packages/plate owner',
  isolatedOwner: 'Plate core layer',
  lane: 'plate-vs-plite-decomposition',
  layerPlan: 'N/A: internal implementation only',
  longTermTarget: 'compile Plate core capabilities once per editor',
  materialDelta: 'p95 +24 ms and +31% across five packets',
  resumeLane: 'owner-microbench-and-trace',
  state: 'proven',
};

const architectureCause = {
  ...provenCause,
  compatibilityVerdict:
    'hard-cut: private-beta API removes the measured per-render adapter tax',
  decisionOwner: 'best-api',
  fixClass: 'runtime-architecture',
  fixOwner: 'auto: Plate core and package adoption',
  layerPlan: 'plate-plan',
  longTermTarget:
    'compile one immutable capability graph and delete the per-render adapter',
};

test('default inventory keeps every lane in diagnostic order', () => {
  assert.deepEqual(validateBenchmarkPlan(plan()), []);

  const missingLane = plan().replace(/^\| 8 \| example-breadth .*\n/m, '');

  assert.match(
    validateBenchmarkPlan(missingLane).join('\n'),
    /must match default order/
  );
});

test('route-wide rerender claims cannot close on one owner proxy', () => {
  const rule = read('.agents/rules/benchmark.mdc');
  const methodology = read(
    '.agents/rules/benchmark/references/methodology.md'
  );

  assert.match(
    rule,
    /reporter-visible rerender[\s\S]*exact-route,[\s\S]*repeated-component inventory[\s\S]*wrapper-local Profiler[\s\S]*every family above 5%[\s\S]*at least 90%/
  );
  assert.match(
    methodology,
    /Reporter-visible rerender[\s\S]*exact-route,[\s\S]*repeated-component inventory[\s\S]*wrapper-local Profiler[\s\S]*every family above 5%[\s\S]*at least 90%/
  );
});

test('a conclusive cause requires causal evidence and pauses later lanes', () => {
  const defaultPlaceholders = plan({
    cause: { lane: provenCause.lane, state: 'proven' },
    rows: {
      'plate-vs-plite-decomposition': { status: 'red' },
    },
  });

  assert.match(
    validateBenchmarkPlan(defaultPlaceholders).join('\n'),
    /requires comparable-baseline/
  );

  const missingIntervention = plan({
    cause: { ...provenCause, causalIntervention: 'pending' },
    rows: {
      'plate-vs-plite-decomposition': { status: 'red' },
    },
  });

  assert.match(
    validateBenchmarkPlan(missingIntervention).join('\n'),
    /requires causal-intervention/
  );

  const missingCorrectness = plan({
    cause: { ...provenCause, correctnessGuardResult: 'pending' },
    rows: {
      'source-and-host-readiness': { status: 'complete' },
      'current-vs-main-product-smoke': { status: 'complete' },
      'plate-vs-plite-decomposition': { status: 'red' },
    },
  });

  assert.match(
    validateBenchmarkPlan(missingCorrectness).join('\n'),
    /requires correctness-guard-result/
  );

  const valid = plan({
    cause: provenCause,
    rows: {
      'source-and-host-readiness': { status: 'complete' },
      'current-vs-main-product-smoke': { status: 'complete' },
      'plate-vs-plite-decomposition': { status: 'red' },
      'owner-microbench-and-trace': { status: 'paused' },
      'product-mount-matrix': { status: 'paused' },
      'trusted-editing-matrix': { status: 'paused' },
      'plite-vs-pinned-slate': { status: 'paused' },
      'example-breadth': { status: 'paused' },
      'large-and-stress': { status: 'paused' },
    },
  });

  assert.deepEqual(validateBenchmarkPlan(valid), []);

  const unresolvedIdentity = valid.replace(
    '- candidate-identity: ref: candidate-test',
    '- candidate-identity: pending'
  );
  assert.match(
    validateBenchmarkPlan(unresolvedIdentity).join('\n'),
    /measured benchmark plan requires candidate-identity/
  );

  const wrongResume = valid.replace(
    '- resume-lane: owner-microbench-and-trace',
    '- resume-lane: product-mount-matrix'
  );

  assert.match(
    validateBenchmarkPlan(wrongResume).join('\n'),
    /active cause must resume owner-microbench-and-trace/
  );
});

test('architectural causes require the long-term Best API and layer-plan decision', () => {
  const rows = {
    'source-and-host-readiness': { status: 'complete' },
    'current-vs-main-product-smoke': { status: 'complete' },
    'plate-vs-plite-decomposition': { status: 'red' },
    'owner-microbench-and-trace': { status: 'paused' },
    'product-mount-matrix': { status: 'paused' },
    'trusted-editing-matrix': { status: 'paused' },
    'plite-vs-pinned-slate': { status: 'paused' },
    'example-breadth': { status: 'paused' },
    'large-and-stress': { status: 'paused' },
  };

  assert.deepEqual(
    validateBenchmarkPlan(plan({ cause: architectureCause, rows })),
    []
  );

  const cheapCompatiblePatch = plan({
    cause: {
      ...architectureCause,
      compatibilityVerdict: 'preserve: compatibility - easier migration',
      decisionOwner: 'benchmark',
      layerPlan: 'N/A: local wrapper patch',
      longTermTarget: 'keep the adapter and memoize around it',
    },
    rows,
  });
  const cheapErrors = validateBenchmarkPlan(cheapCompatiblePatch).join('\n');

  assert.match(
    cheapErrors,
    /runtime-architecture requires decision-owner best-api/
  );
  assert.match(cheapErrors, /runtime-architecture requires layer-plan/);
  assert.match(cheapErrors, /requires compatibility-verdict hard-cut/);

  const hardLawPreservation = plan({
    cause: {
      ...architectureCause,
      compatibilityVerdict:
        'preserve: serialized-data - persisted documents require stable field semantics',
    },
    rows,
  });

  assert.deepEqual(validateBenchmarkPlan(hardLawPreservation), []);
});

test('architectural fixes preserve their durable decision through completion', () => {
  const history = [
    {
      benchmarkCommand: architectureCause.benchmarkCommand,
      benchmarkResult: 'pass: p95 parity restored',
      causalEvidence: 'removing the per-render adapter removes the measured tax',
      causeId: architectureCause.causeId,
      compatibilityVerdict: architectureCause.compatibilityVerdict,
      correctnessGuardResult: architectureCause.correctnessGuardResult,
      correctnessCommand: architectureCause.correctnessCommand,
      correctnessResult: 'pass: focused correctness green',
      decision: 'kept',
      decisionOwner: architectureCause.decisionOwner,
      evidence: 'accepted architecture and exact reruns passed',
      fixClass: architectureCause.fixClass,
      fixOwner: architectureCause.fixOwner,
      lane: architectureCause.lane,
      layerPlan: architectureCause.layerPlan,
      longTermTarget: architectureCause.longTermTarget,
    },
  ];
  const green = plan({
    cause: {
      ...architectureCause,
      benchmarkRerunResult: 'pass: p95 parity restored',
      correctnessRerunResult: 'pass: focused correctness green',
      state: 'green',
    },
    history,
    rows: {
      'source-and-host-readiness': { status: 'complete' },
      'current-vs-main-product-smoke': { status: 'complete' },
      'plate-vs-plite-decomposition': { status: 'complete' },
    },
  });

  assert.deepEqual(validateBenchmarkPlan(green), []);

  const rewrittenTarget = green.replace(
    `| ${architectureCause.fixClass} | ${architectureCause.longTermTarget} |`,
    `| ${architectureCause.fixClass} | keep the compatibility adapter |`
  );

  assert.match(
    validateBenchmarkPlan(rewrittenTarget).join('\n'),
    /must preserve its long-term target in Cause History/
  );

  const closedRows = Object.fromEntries(
    DEFAULT_BENCHMARK_LANES.map((lane) => [
      lane,
      { evidence: 'verified artifact', next: 'complete', status: 'complete' },
    ])
  );

  assert.deepEqual(
    validateBenchmarkPlan(plan({ history, rows: closedRows }), {
      complete: true,
    }),
    []
  );
});

test('a green fix reruns the exact lane and resumes the first pending lane', () => {
  const history = [
    {
      benchmarkCommand: provenCause.benchmarkCommand,
      benchmarkResult: 'pass: p95 parity restored',
      causalEvidence: 'disabling Plate core removes the measured delta',
      causeId: provenCause.causeId,
      correctnessGuardResult: provenCause.correctnessGuardResult,
      correctnessCommand: provenCause.correctnessCommand,
      correctnessResult: 'pass: focused correctness green',
      decision: 'kept',
      evidence: 'exact benchmark and correctness reruns passed',
      lane: provenCause.lane,
    },
  ];
  const valid = plan({
    cause: {
      ...provenCause,
      benchmarkRerunResult: 'pass: p95 parity restored',
      correctnessRerunResult: 'pass: focused correctness green',
      state: 'green',
    },
    history,
    rows: {
      'source-and-host-readiness': { status: 'complete' },
      'current-vs-main-product-smoke': { status: 'complete' },
      'plate-vs-plite-decomposition': { status: 'complete' },
    },
  });

  assert.deepEqual(validateBenchmarkPlan(valid), []);

  const skippedPending = valid.replace(
    '- resume-lane: owner-microbench-and-trace',
    '- resume-lane: product-mount-matrix'
  );

  assert.match(
    validateBenchmarkPlan(skippedPending).join('\n'),
    /must resume owner-microbench-and-trace/
  );

  const failedReruns = valid.replace(
    '- benchmark-rerun-result: pass: p95 parity restored',
    '- benchmark-rerun-result: fail: p95 still regressed'
  );

  assert.match(
    validateBenchmarkPlan(failedReruns).join('\n'),
    /green cause requires benchmark-rerun-result/
  );

  const placeholderSuccess = valid.replace(
    '- correctness-rerun-result: pass: focused correctness green',
    '- correctness-rerun-result: pass: TODO'
  );

  assert.match(
    validateBenchmarkPlan(placeholderSuccess).join('\n'),
    /green cause requires correctness-rerun-result/
  );

  const rewrittenCurrentResult = valid.replace(
    '- benchmark-rerun-result: pass: p95 parity restored',
    '- benchmark-rerun-result: pass: different benchmark result'
  );

  assert.match(
    validateBenchmarkPlan(rewrittenCurrentResult).join('\n'),
    /must preserve its benchmark rerun result in Cause History/
  );

  const unrelatedCommand = valid.replace(
    '- benchmark-rerun: pnpm bench exact',
    '- benchmark-rerun: echo ok'
  );

  assert.match(
    validateBenchmarkPlan(unrelatedCommand).join('\n'),
    /benchmark-rerun to match benchmark-command/
  );
});

test('lanes pause only for an active proven cause', () => {
  const invalid = plan({
    rows: {
      'product-mount-matrix': { status: 'paused' },
    },
  });

  assert.match(
    validateBenchmarkPlan(invalid).join('\n'),
    /paused lane product-mount-matrix requires an active proven cause/
  );

  const pendingApplicability = plan({
    rows: {
      'product-mount-matrix': { applies: 'pending', status: 'paused' },
    },
  });

  assert.match(
    validateBenchmarkPlan(pendingApplicability).join('\n'),
    /paused lane product-mount-matrix requires Applies yes/
  );

  const prematureNarrowing = plan({
    rows: {
      'product-mount-matrix': {
        applies: 'pending',
        status: 'N/A: explicitly narrowed',
      },
    },
  });

  assert.match(
    validateBenchmarkPlan(prematureNarrowing).join('\n'),
    /cannot have status N\/A: explicitly narrowed while Applies is pending/
  );
});

test('clearing the current cause checkpoint removes stale transient fields', () => {
  const stale = plan().replace(
    '- cause-id: N/A: no cause',
    '- cause-id: stale-cause'
  );

  assert.match(
    validateBenchmarkPlan(stale).join('\n'),
    /cause state none requires cleared cause-id/
  );
});

test('explicit narrowing requires a benchmark only invocation', () => {
  const rows = {
    'large-and-stress': {
      applies: 'no',
      status: 'N/A: only - explicitly narrowed',
    },
  };
  const unauthorized = plan({ rows });
  const authorized = plan({
    invocation: '$benchmark only trusted-editing-matrix',
    rows,
  });

  assert.match(
    validateBenchmarkPlan(unauthorized).join('\n'),
    /requires an explicit \$benchmark only invocation/
  );
  assert.deepEqual(validateBenchmarkPlan(authorized), []);

  const missingTarget = plan({ invocation: '$benchmark only', rows });
  const missingTargetErrors = validateBenchmarkPlan(missingTarget).join('\n');
  assert.match(
    missingTargetErrors,
    /requires an explicit \$benchmark only invocation/
  );
  assert.match(missingTargetErrors, /requires a non-empty lane or target/);
});

test('ordered execution cannot skip an earlier applicable lane', () => {
  const invalid = plan({
    rows: {
      'example-breadth': { status: 'in_progress' },
    },
  });

  assert.match(
    validateBenchmarkPlan(invalid).join('\n'),
    /example-breadth cannot run before prior applicable lane source-and-host-readiness/
  );
});

test('a later cause cannot skip an unfinished earlier lane', () => {
  const invalid = plan({
    cause: {
      ...provenCause,
      benchmarkRerunResult: 'pass: p95 parity restored',
      correctnessRerunResult: 'pass: focused correctness green',
      state: 'green',
    },
    history: [
      {
        benchmarkCommand: provenCause.benchmarkCommand,
        benchmarkResult: 'pass: p95 parity restored',
        causalEvidence: 'disabling Plate core removes the measured delta',
        causeId: provenCause.causeId,
        correctnessGuardResult: provenCause.correctnessGuardResult,
        correctnessCommand: provenCause.correctnessCommand,
        correctnessResult: 'pass: focused correctness green',
        decision: 'kept',
        evidence: 'exact reruns passed',
        lane: provenCause.lane,
      },
    ],
    rows: {
      'source-and-host-readiness': { status: 'complete' },
      'plate-vs-plite-decomposition': { status: 'complete' },
    },
  });
  const errors = validateBenchmarkPlan(invalid).join('\n');

  assert.match(
    errors,
    /plate-vs-plite-decomposition cannot run before prior applicable lane current-vs-main-product-smoke/
  );
  assert.match(errors, /must resume current-vs-main-product-smoke/);
});

test('an invalidated cause persists failure and resumes its unfinished lane', () => {
  const history = [
    {
      benchmarkCommand: provenCause.benchmarkCommand,
      benchmarkResult:
        'fail: disabling the suspected owner did not improve p95',
      causalEvidence: 'the intervention disproved the suspected owner',
      causeId: provenCause.causeId,
      correctnessGuardResult: provenCause.correctnessGuardResult,
      correctnessCommand: provenCause.correctnessCommand,
      correctnessResult: 'N/A: no product fix was kept',
      decision: 'invalidated',
      evidence: 'same-lane intervention packet',
      lane: provenCause.lane,
    },
  ];
  const invalidatedCause = {
    ...provenCause,
    benchmarkCommand: provenCause.benchmarkCommand,
    benchmarkRerun: provenCause.benchmarkRerun,
    benchmarkRerunResult:
      'fail: disabling the suspected owner did not improve p95',
    causalIntervention: provenCause.causalIntervention,
    causeId: provenCause.causeId,
    correctnessGuardResult: provenCause.correctnessGuardResult,
    correctnessCommand: provenCause.correctnessCommand,
    correctnessRerun: provenCause.correctnessRerun,
    lane: provenCause.lane,
    resumeLane: provenCause.lane,
    state: 'invalidated',
  };
  const rows = {
    'source-and-host-readiness': { status: 'complete' },
    'current-vs-main-product-smoke': { status: 'complete' },
    'plate-vs-plite-decomposition': { status: 'in_progress' },
  };
  const valid = plan({ cause: invalidatedCause, history, rows });

  assert.deepEqual(validateBenchmarkPlan(valid), []);

  const completedLane = valid.replace(
    '| 3 | plate-vs-plite-decomposition | yes | in_progress |',
    '| 3 | plate-vs-plite-decomposition | yes | complete |'
  );
  const rewrittenHistory = plan({
    cause: invalidatedCause,
    history: [
      {
        ...history[0],
        benchmarkResult: 'pass: the suspected owner was fast',
      },
    ],
    rows,
  });

  assert.match(
    validateBenchmarkPlan(completedLane).join('\n'),
    /must remain pending or in_progress/
  );
  assert.match(
    validateBenchmarkPlan(rewrittenHistory).join('\n'),
    /invalidated cause plate-core-mount-tax requires Benchmark Result fail/
  );
});

test('complete mode rejects a breadth run with pending lanes', () => {
  assert.match(
    validateBenchmarkPlan(plan(), { complete: true }).join('\n'),
    /is not complete/
  );
});

test('complete mode accepts all closed default lanes', () => {
  const rows = Object.fromEntries(
    DEFAULT_BENCHMARK_LANES.map((lane) => [
      lane,
      { evidence: 'verified artifact', next: 'complete', status: 'complete' },
    ])
  );

  assert.deepEqual(
    validateBenchmarkPlan(
      plan({
        history: [
          {
            benchmarkCommand: 'N/A: no fix was required',
            benchmarkResult: 'N/A: no fix was required',
            causalEvidence: 'N/A: no conclusive cause was found',
            causeId: 'none',
            correctnessGuardResult: 'N/A: no fix was required',
            correctnessCommand: 'N/A: no fix was required',
            correctnessResult: 'N/A: no fix was required',
            decision: 'N/A: no conclusive causes found',
            evidence: 'all lanes completed without a conclusive regression',
            lane: 'N/A: no cause lane',
          },
        ],
        rows,
      }),
      { complete: true }
    ),
    []
  );
});

test('complete mode requires durable per-cause rerun history', () => {
  const rows = Object.fromEntries(
    DEFAULT_BENCHMARK_LANES.map((lane) => [
      lane,
      { evidence: 'verified artifact', next: 'complete', status: 'complete' },
    ])
  );
  const errors = validateBenchmarkPlan(plan({ rows }), {
    complete: true,
  }).join('\n');

  assert.match(errors, /unresolved placeholder row/);
  assert.match(errors, /requires resolved Cause History/);
});

test('complete mode rejects failed kept history and placeholder N/A reasons', () => {
  const rows = Object.fromEntries(
    DEFAULT_BENCHMARK_LANES.map((lane) => [
      lane,
      { evidence: 'verified artifact', next: 'complete', status: 'complete' },
    ])
  );
  const failedKept = plan({
    history: [
      {
        benchmarkCommand: provenCause.benchmarkCommand,
        benchmarkResult: 'fail: p95 still regressed',
        causalEvidence: 'disabling Plate core removes the measured delta',
        causeId: provenCause.causeId,
        correctnessGuardResult: provenCause.correctnessGuardResult,
        correctnessCommand: provenCause.correctnessCommand,
        correctnessResult: 'pass: focused correctness green',
        decision: 'kept',
        evidence: 'post-fix packet',
        lane: provenCause.lane,
      },
    ],
    rows,
  });
  const placeholderNarrowing = plan({
    history: [
      {
        benchmarkCommand: 'N/A: no fix was required',
        benchmarkResult: 'N/A: no fix was required',
        causalEvidence: 'N/A: pending',
        causeId: 'none',
        correctnessGuardResult: 'N/A: no fix was required',
        correctnessCommand: 'N/A: no fix was required',
        correctnessResult: 'N/A: no fix was required',
        decision: 'N/A: no conclusive causes found',
        evidence: 'all lanes completed without a conclusive regression',
        lane: 'N/A: no cause lane',
      },
    ],
    rows,
  });

  assert.match(
    validateBenchmarkPlan(failedKept, { complete: true }).join('\n'),
    /kept cause plate-core-mount-tax requires Benchmark Result pass/
  );
  assert.match(
    validateBenchmarkPlan(placeholderNarrowing, { complete: true }).join('\n'),
    /none row requires an N\/A causal evidence reason/
  );
});

test('complete mode requires source identities and artifact-backed signatures', () => {
  const rows = Object.fromEntries(
    DEFAULT_BENCHMARK_LANES.map((lane) => [
      lane,
      { evidence: 'verified artifact', next: 'complete', status: 'complete' },
    ])
  );
  const history = [
    {
      benchmarkCommand: 'N/A: no fix was required',
      benchmarkResult: 'N/A: no fix was required',
      causalEvidence: 'N/A: no conclusive cause was found',
      causeId: 'none',
      correctnessCommand: 'N/A: no fix was required',
      correctnessGuardResult: 'N/A: no fix was required',
      correctnessResult: 'N/A: no fix was required',
      decision: 'N/A: no conclusive causes found',
      evidence: 'all lanes completed without a conclusive regression',
      lane: 'N/A: no cause lane',
    },
  ];
  const missingCandidate = plan({
    history,
    rows,
    source: { candidateIdentity: 'pending' },
  });
  const missingArtifact = plan({
    history,
    rows,
    source: { finalArtifacts: 'pending' },
  });
  const unbackedSignature = plan({ history, rows }).replace(
    'artifact: tmp/browser.json',
    'pending'
  );
  const prefixedCandidatePlaceholder = plan({
    history,
    rows,
    source: { candidateIdentity: 'ref: pending' },
  });
  const prefixedArtifactPlaceholder = plan({
    history,
    rows,
    source: { finalArtifacts: 'artifact: pending' },
  });
  const missingComparableBaseline = plan({ history, rows }).replace(
    '| ref / dirty fingerprint | ref: candidate-test | ref: baseline-test |',
    '| ref / dirty fingerprint | ref: candidate-test | N/A: inapplicable - no baseline |'
  );

  assert.match(
    validateBenchmarkPlan(missingCandidate, { complete: true }).join('\n'),
    /requires candidate-identity/
  );
  assert.match(
    validateBenchmarkPlan(missingArtifact, { complete: true }).join('\n'),
    /requires final-artifacts/
  );
  assert.match(
    validateBenchmarkPlan(unbackedSignature, { complete: true }).join('\n'),
    /browser \/ machine \/ viewport \/ DPR requires artifact evidence/
  );
  assert.match(
    validateBenchmarkPlan(prefixedCandidatePlaceholder, {
      complete: true,
    }).join('\n'),
    /requires candidate-identity/
  );
  assert.match(
    validateBenchmarkPlan(prefixedArtifactPlaceholder, { complete: true }).join(
      '\n'
    ),
    /requires final-artifacts/
  );
  assert.match(
    validateBenchmarkPlan(missingComparableBaseline, { complete: true }).join(
      '\n'
    ),
    /ref \/ dirty fingerprint requires comparable Baseline/
  );
});

test('plan validator CLI is fail-closed and accepts the Benchmark template', () => {
  const script = join(
    root,
    '.agents/rules/benchmark/scripts/validate-benchmark-plan.mjs'
  );
  const missingPlan = spawnSync(process.execPath, [script], {
    encoding: 'utf8',
  });
  const template = spawnSync(
    process.execPath,
    [script, 'docs/plans/templates/benchmark.md'],
    { cwd: root, encoding: 'utf8' }
  );

  assert.equal(missingPlan.status, 1);
  assert.match(missingPlan.stderr, /Usage:/);
  assert.equal(template.status, 0);
  assert.match(template.stdout, /structurally valid/);
});

test('Benchmark source, generated skill, routing, and removed perf owner agree', () => {
  const sourcePath = '.agents/rules/benchmark.mdc';
  const benchmarkRule = read(sourcePath);
  const benchmarkMethodology = read(
    '.agents/rules/benchmark/references/methodology.md'
  );
  const benchmarkTemplate = read('docs/plans/templates/benchmark.md');
  const autoRule = read('.agents/rules/auto.mdc');
  const agentsRule = read('.agents/AGENTS.md');
  const majorTaskRule = read('.agents/rules/major-task.mdc');
  const performanceRule = read('.agents/rules/performance.mdc');
  const pliteResearchRule = read('.agents/rules/plite-research.mdc');
  const regressionRule = read('.agents/rules/regression.mdc');
  const slateArRule = read('.agents/rules/slate-ar.mdc');
  const taskRule = read('.agents/rules/task.mdc');

  assert.equal(
    read('.agents/skills/benchmark/SKILL.md'),
    expectedGeneratedSkill({ name: 'benchmark', sourcePath })
  );
  assert.match(benchmarkRule, /\(\.\/references\/methodology\.md\)/);
  assert.ok(
    existsSync(join(root, '.agents/skills/benchmark/references/methodology.md'))
  );
  assert.match(benchmarkRule, /all applicable lanes by default/i);
  assert.match(benchmarkRule, /## Durable Fix Decision/);
  assert.match(benchmarkRule, /best long-term target/i);
  assert.doesNotMatch(benchmarkRule, /apply the smallest durable fix/i);
  assert.match(
    benchmarkMethodology,
    /Public API and runtime architecture run `best-api`/
  );
  assert.match(benchmarkTemplate, /- compatibility-verdict:/);
  assert.match(autoRule, /route .*benchmark/i);
  assert.match(
    autoRule,
    /Benchmark pauses on a `public-api` or `runtime-architecture` cause/
  );
  assert.match(agentsRule, /Benchmarking, profiling, performance regression/);
  assert.match(taskRule, /performance comparison.*benchmark/is);
  assert.match(majorTaskRule, /Performance Architecture After Benchmark/);
  assert.doesNotMatch(majorTaskRule, /^### Performance And Optimization$/m);
  assert.match(performanceRule, /review lens/i);
  assert.match(regressionRule, /performance regression.*benchmark/i);
  assert.doesNotMatch(pliteResearchRule, /`slate-ar perf(?:\s|`|<)/);
  assert.doesNotMatch(slateArRule, /^## Perf Mode$/m);
  assert.doesNotMatch(slateArRule, /`slate-ar perf(?:\s|`|<)/);
});

test('all changed worker skills match source and retain one benchmark owner', () => {
  const changedSkills = [
    'architecture-cleanup',
    'auto',
    'autoclosure',
    'benchmark',
    'maintainer',
    'major-task',
    'patch',
    'performance',
    'plate-feature',
    'plate-plan',
    'plite-plan',
    'plite-research',
    'regression',
    'resolve-slate-issue',
    'slate-ar',
    'slate-migration',
    'sync-main-to-next',
    'task',
  ];
  const source = changedSkills
    .map((name) => read(`.agents/rules/${name}.mdc`))
    .join('\n');

  for (const name of changedSkills) {
    const workerSourcePath = `.agents/rules/${name}.mdc`;

    assert.equal(
      read(`.agents/skills/${name}/SKILL.md`),
      expectedGeneratedSkill({ name, sourcePath: workerSourcePath })
    );
  }

  assert.doesNotMatch(source, /`slate-ar perf(?:\s|`|<)/);
  assert.doesNotMatch(source, /quality\/perf|perf\/research/);
});

test('repo-local workflow sources default to max-priority P1', () => {
  const walk = (path) =>
    readdirSync(join(root, path), { withFileTypes: true }).flatMap((entry) => {
      const relativePath = join(path, entry.name);

      if (entry.isDirectory()) return walk(relativePath);
      if (!/\.(?:md|mdc|mjs)$/.test(entry.name)) return [];

      return [relativePath];
    });
  const files = [
    '.agents/AGENTS.md',
    'VISION.md',
    ...walk('.agents/rules'),
    ...walk('docs/plans/templates'),
    ...walk('docs/vision'),
  ].filter((path) => path !== '.agents/rules/plate-next/versions.json');
  const staleNeedle = ['--max-priority', 'P2'].join(' ');
  const stale = files.filter((path) => read(path).includes(staleNeedle));

  assert.deepEqual(stale, []);
  assert.match(read('.agents/AGENTS.md'), /--max-priority P1/);
  assert.match(read('docs/plans/templates/task.md'), /--max-priority P1/);
  assert.match(read('.agents/rules/patch.mdc'), /--max-priority P1/);
});
