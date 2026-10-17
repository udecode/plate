import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  DEFAULT_BENCHMARK_LANES,
  validateBenchmarkPlan,
} from './validate-benchmark-plan.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
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
  verification = '- artifact: tmp/benchmarks/final.json',
} = {}) => `
## Benchmark Source

- request: test fixture
- scope: test scope
- invocation: ${invocation}
- candidate-identity: ${source.candidateIdentity ?? 'ref: candidate-test'}
- plate-main-identity: ${source.plateMainIdentity ?? 'ref: main-test'}
- slate-identity: ${source.slateIdentity ?? 'commit: slate-test'}
- named-symptom: test action
- final-artifacts: ${source.finalArtifacts ?? 'artifact: tmp/test-result.json'}
- inherited-budget: ${source.inheritedBudget ?? 'N/A: no earlier plan gates this run'}
- inherited-budget-result: ${source.inheritedBudgetResult ?? 'N/A: no inherited budget'}

## Interaction Coverage

- first-interaction: pass: first trusted input in the reported host
- settled-interaction: pass: repeated trusted input in the reported host
- route-scope: pass: outer page and each embedded target
- reporter-profile: pass: original browser profile, extensions enabled

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

Verification evidence:
${verification}
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
  lane: 'plate-vs-slate-decomposition',
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
  layerPlan: 'plate',
  longTermTarget:
    'compile one immutable capability graph and delete the per-render adapter',
};

test('default inventory keeps every lane in diagnostic order', () => {
  assert.deepEqual(validateBenchmarkPlan(plan()), []);

  const missingLane = plan().replace(/^\| 7 \| example-breadth .*\n/m, '');

  assert.match(
    validateBenchmarkPlan(missingLane).join('\n'),
    /must match default order/
  );
});

test('completion rejects warmed-only and substitute-profile interaction proof', () => {
  for (const field of ['first-interaction', 'settled-interaction', 'route-scope', 'reporter-profile']) {
    const failed = plan().replace(new RegExp(`^- ${field}:.*$`, 'm'), `- ${field}: pending`);
    assert.match(validateBenchmarkPlan(failed, { complete: true }).join('\n'), new RegExp(`Interaction Coverage requires ${field}`));
  }
  const oldPacket = plan().replace(/## Interaction Coverage[\s\S]*?(?=## Comparison Signature)/, '');
  assert.equal(validateBenchmarkPlan(oldPacket, { complete: true }).filter(error => error.startsWith('Interaction Coverage')).length, 4);
  assert.equal(validateBenchmarkPlan(plan(), { complete: true }).filter(error => error.startsWith('Interaction Coverage')).length, 0);
  const nonBrowser = plan().replace(/^- (first-interaction|settled-interaction|route-scope|reporter-profile):.*$/gm, '- $1: N/A: package-only computation without a browser');
  assert.equal(validateBenchmarkPlan(nonBrowser, { complete: true }).filter(error => error.startsWith('Interaction Coverage')).length, 0);
});

test('a conclusive cause requires causal evidence and pauses later lanes', () => {
  const defaultPlaceholders = plan({
    cause: { lane: provenCause.lane, state: 'proven' },
    rows: {
      'plate-vs-slate-decomposition': { status: 'red' },
    },
  });

  assert.match(
    validateBenchmarkPlan(defaultPlaceholders).join('\n'),
    /requires comparable-baseline/
  );

  const missingIntervention = plan({
    cause: { ...provenCause, causalIntervention: 'pending' },
    rows: {
      'plate-vs-slate-decomposition': { status: 'red' },
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
      'plate-vs-slate-decomposition': { status: 'red' },
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
      'plate-vs-slate-decomposition': { status: 'red' },
      'owner-microbench-and-trace': { status: 'paused' },
      'product-mount-matrix': { status: 'paused' },
      'trusted-editing-matrix': { status: 'paused' },
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
    'plate-vs-slate-decomposition': { status: 'red' },
    'owner-microbench-and-trace': { status: 'paused' },
    'product-mount-matrix': { status: 'paused' },
    'trusted-editing-matrix': { status: 'paused' },
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

test('correctness causes keep their repair decision out of Benchmark', () => {
  const rows = Object.fromEntries(
    DEFAULT_BENCHMARK_LANES.map((lane, index) => [
      lane,
      { status: index < 2 ? 'complete' : index === 2 ? 'red' : 'paused' },
    ])
  );
  const cause = {
    ...provenCause,
    decisionOwner: 'bug-fix',
    fixClass: 'correctness',
  };

  assert.deepEqual(validateBenchmarkPlan(plan({ cause, rows })), []);
  assert.match(
    validateBenchmarkPlan(
      plan({ cause: { ...cause, decisionOwner: 'benchmark' }, rows })
    ).join('\n'),
    /correctness belongs to the Bug fix playbook/
  );
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
      'plate-vs-slate-decomposition': { status: 'complete' },
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
      'plate-vs-slate-decomposition': { status: 'complete' },
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
      'plate-vs-slate-decomposition': { status: 'complete' },
    },
  });
  const errors = validateBenchmarkPlan(invalid).join('\n');

  assert.match(
    errors,
    /plate-vs-slate-decomposition cannot run before prior applicable lane current-vs-main-product-smoke/
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
    'plate-vs-slate-decomposition': { status: 'in_progress' },
  };
  const valid = plan({ cause: invalidatedCause, history, rows });

  assert.deepEqual(validateBenchmarkPlan(valid), []);

  const completedLane = valid.replace(
    '| 3 | plate-vs-slate-decomposition | yes | in_progress |',
    '| 3 | plate-vs-slate-decomposition | yes | complete |'
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

test('complete mode rejects pending or missing verification evidence', () => {
  for (const markdown of [plan({ verification: '- Pending.' }), plan().replace(/Verification evidence:[\s\S]*$/, '')]) {
    assert.match(validateBenchmarkPlan(markdown, { complete: true }).join('\n'), /Verification evidence must record fresh final evidence/);
  }
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
    [script, '.agents/rules/benchmark/templates/benchmark.md'],
    { cwd: root, encoding: 'utf8' }
  );

  assert.equal(missingPlan.status, 1);
  assert.match(missingPlan.stderr, /Usage:/);
  assert.equal(template.status, 0);
  assert.match(template.stdout, /structurally valid/);
});

const completeRows = Object.fromEntries(
  DEFAULT_BENCHMARK_LANES.map((lane) => [
    lane,
    { evidence: 'verified artifact', next: 'complete', status: 'complete' },
  ])
);
const failingCause = {
  benchmarkCommand: 'harness/interleave.sh overlap200',
  benchmarkResult: 'fail: p95 23.2 against 1.5 ms',
  causalEvidence: 'one mark per enclosing insertion, profiled',
  causeId: 'stacked-marks',
  correctnessGuardResult: provenCause.correctnessGuardResult,
  correctnessCommand: provenCause.correctnessCommand,
  correctnessResult: 'pass: authored suites',
  decision: 'deferred',
  evidence: 'overlap200 aggregate',
  lane: provenCause.lane,
};
const architectureRow = {
  compatibilityVerdict: architectureCause.compatibilityVerdict,
  decisionOwner: architectureCause.decisionOwner,
  fixClass: architectureCause.fixClass,
  fixOwner: architectureCause.fixOwner,
  layerPlan: architectureCause.layerPlan,
  longTermTarget: 'store one mark per change',
};
const pivotedCause = {
  ...failingCause,
  ...architectureRow,
  decision: 'pivoted',
  evidence: 'pivot-plan: marks-pivot.md',
};
const keptCause = (overrides = {}) => ({
  ...failingCause,
  benchmarkResult: 'pass: p95 1.4 ms',
  causeId: 'marks-retry',
  decision: 'kept',
  ...overrides,
});
const ownerKept = 'owner-kept: below the stress budget; expires 2026-12-01; approved zbeyens';
const step = '- [ ] Rerun stacked-marks with `harness/interleave.sh overlap200` against the frozen budget.';
const pivotPlans = {
  'brief.md': '# brief\n\nstacked-marks `harness/interleave.sh overlap200`\n',
  'cost-benchmark.md': '# cost\n',
  'keys-plan.md': '# keys\n\n- [x] M2 frozen budget\n',
  'marks-commented.md': `# pivot\n\n<!--\n${step}\n-->\n`,
  'marks-done.md': `# pivot\n\n${step.replace('- [ ]', '- [x]')}\n`,
  'marks-fenced.md': `# pivot\n\n\`\`\`md\n${step}\n\`\`\`\n`,
  'marks-near.md': `# pivot\n\n${step.replace('overlap200`', 'overlap2000`')}\n`,
  'marks-pivot.md': `# pivot\n\n${step}\n`,
  'marks-split.md': `# pivot\n\n${step.replace('overlap200`', 'overlap<!--example only-->200`')}\n`,
  'marks-ticks.md':
    '# pivot\n\n- [ ] Rerun stacked-marks with ``node -e "console.log(`value`)"`` against the frozen budget.\n',
  'marks-wrapped.md':
    '# pivot\n\n- [ ] Rerun stacked-marks against the frozen budget with\n  `harness/interleave.sh overlap200`.\n',
};

const withPlans = (run) => {
  const dir = mkdtempSync(join(tmpdir(), 'benchmark-pivot-'));

  try {
    for (const [name, text] of Object.entries(pivotPlans)) {
      writeFileSync(join(dir, name), text);
    }
    run(join(dir, 'cost-benchmark.md'));
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
};

const closeWith = (history, planPath, source = {}, rows = completeRows) =>
  validateBenchmarkPlan(plan({ history, rows, source }), {
    complete: true,
    planPath,
    today: '2026-10-13',
  }).join('\n');

test('a parked cause needs the owner dated keep whatever its result says', () =>
  withPlans((planPath) => {
    assert.match(
      closeWith([failingCause], planPath),
      /deferred cause stacked-marks parks its cost/
    );
    assert.match(
      closeWith(
        [{ ...failingCause, benchmarkResult: 'pass: absolute met; relative line fails' }],
        planPath
      ),
      /deferred cause stacked-marks parks its cost/
    );
    assert.equal(closeWith([{ ...failingCause, evidence: ownerKept }], planPath), '');
    for (const expires of ['2026-10-01', '2027-06-01', '2026-11-31']) {
      assert.match(
        closeWith(
          [{ ...failingCause, evidence: ownerKept.replace('2026-12-01', expires) }],
          planPath
        ),
        /owner-kept needs a reason, a real expiry date/
      );
    }
    assert.equal(
      closeWith(
        [
          {
            ...failingCause,
            correctnessResult: 'fail: broke suites',
            decision: 'reverted',
            evidence: ownerKept.replace('2026-12-01', '2026-10-01'),
          },
          keptCause(),
        ],
        planPath
      ),
      ''
    );
  }));

test('a pivoted cause names a step in another plan that reruns its exact command', () =>
  withPlans((planPath) => {
    const pivoted = (evidence, row = {}) =>
      closeWith([{ ...pivotedCause, ...row, evidence }], planPath);

    assert.equal(pivoted('pivot-plan: `marks-pivot.md`'), '');
    assert.equal(pivoted('pivot-plan: marks-done.md'), '');
    assert.equal(pivoted('pivot-plan: marks-wrapped.md'), '');
    assert.equal(pivoted('pivot-plan: [the pivot](marks-pivot.md); adopts one mark per change'), '');
    assert.match(
      pivoted('pivot-plan: marks-pivot.md', { fixClass: 'internal-implementation' }),
      /pivoted cause stacked-marks needs fix-class/
    );
    assert.equal(
      pivoted('pivot-plan: marks-ticks.md', {
        benchmarkCommand: '``node -e "console.log(`value`)"``',
      }),
      ''
    );
    for (const name of ['marks-commented.md', 'marks-fenced.md', 'marks-near.md', 'marks-split.md', 'brief.md']) {
      assert.match(pivoted(`pivot-plan: ${name}`), /needs a step \(- \[ \] or - \[x\]\) that names stacked-marks/);
    }
    assert.match(pivoted('pivot-plan: cost-benchmark.md'), /naming another plan beside this one/);
    assert.match(pivoted('pivot-plan: missing.md'), /naming another plan beside this one/);
    for (const reference of [
      'marks-pivot.mdx',
      'marks-pivot.md.backup',
      '[the pivot](docs/plans/absent-folder/marks-pivot.md)',
    ]) {
      assert.match(pivoted(`pivot-plan: ${reference}`), /naming another plan beside this one/);
    }
    assert.match(
      validateBenchmarkPlan(plan({ history: [pivotedCause], rows: completeRows }), {
        complete: true,
        today: '2026-10-13',
      }).join('\n'),
      /naming another plan beside this one/
    );
  }));

test('a failing inherited budget names the pivoted or owner-kept causes that hold it', () =>
  withPlans((planPath) => {
    const inherited = { inheritedBudget: 'keys-plan.md M2 lines A to D' };
    const failing = (result, history) =>
      closeWith(history, planPath, { ...inherited, inheritedBudgetResult: result });

    assert.match(
      closeWith([keptCause()], planPath, inherited),
      /requires inherited-budget-result: pass/
    );
    assert.match(
      failing('fail: 45 of 110 lines', [pivotedCause]),
      /must end with "; causes <id>, <id>"/
    );
    assert.match(
      failing('fail: 45 of 110 lines; causes stacked-marks', [
        keptCause({ causeId: 'stacked-marks', evidence: ownerKept.replace('below the stress budget', 'mount-only heap') }),
      ]),
      /inherited-budget-result names stacked-marks, which must be a cause decided pivoted or owner-kept/
    );
    assert.match(
      failing('fail: 45 of 110 lines; causes heap-cost', [pivotedCause]),
      /names heap-cost, which must be a cause decided pivoted or owner-kept/
    );
    assert.equal(failing('fail: 4 count lines; causes stacked-marks', [pivotedCause]), '');
    assert.equal(
      failing('fail: 4 count lines; cause stacked-marks', [{ ...failingCause, evidence: ownerKept }]),
      ''
    );
    const budget = (inheritedBudget, path = planPath) =>
      closeWith([keptCause()], path, {
        inheritedBudget,
        inheritedBudgetResult: 'pass: M2 lines',
      });

    assert.equal(budget('[keys](keys-plan.md) M2 lines A to D'), '');
    for (const [value, path] of [
      ['keys plan M2 lines A to D'],
      ['keys-plan.md'],
      ['cost-benchmark.md M2 lines A to D'],
      ['keys-plan.md M2 lines A to D', null],
    ]) {
      assert.match(budget(value, path), /inherited-budget must name another plan beside this one/);
    }
    assert.match(
      closeWith([keptCause()], planPath, { inheritedBudget: 'pending' }),
      /requires inherited-budget: <file>.md <step/
    );
  }));

test('a pivoted checkpoint leaves its lane the way a green one does', () =>
  withPlans((planPath) => {
    const checkpoint = {
      ...provenCause,
      ...architectureRow,
      benchmarkCommand: failingCause.benchmarkCommand,
      benchmarkRerun: failingCause.benchmarkCommand,
      benchmarkRerunResult: failingCause.benchmarkResult,
      causeId: failingCause.causeId,
      correctnessRerunResult: failingCause.correctnessResult,
      state: 'pivoted',
    };
    const rows = {
      'source-and-host-readiness': { status: 'complete' },
      'current-vs-main-product-smoke': { status: 'complete' },
      'plate-vs-slate-decomposition': { status: 'complete' },
    };
    const check = (history) =>
      validateBenchmarkPlan(plan({ cause: checkpoint, history, rows }), {
        planPath,
        today: '2026-10-13',
      }).join('\n');

    assert.equal(check([pivotedCause]), '');
    assert.match(
      check([{ ...pivotedCause, decision: 'kept', benchmarkResult: 'pass: p95 1.4 ms' }]),
      /pivoted cause stacked-marks requires a matching pivoted Cause History row/
    );
  }));

test('an escaped pipe stays inside its cell and a malformed history row is refused', () =>
  withPlans((planPath) => {
    assert.match(
      closeWith([{ ...failingCause, evidence: 'trace \\| profile' }], planPath),
      /deferred cause stacked-marks parks its cost/
    );
    assert.match(
      closeWith([{ ...failingCause, evidence: 'trace | profile' }], planPath),
      /Cause History row 1 has 17 cells, not 16/
    );
  }));
