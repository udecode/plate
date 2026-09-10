import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../../..');
const out = resolve(
  root,
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const read = (file) => JSON.parse(readFileSync(resolve(out, file), 'utf8'));
const registry = JSON.parse(
  readFileSync(resolve(root, 'benchmarks/targets/slate-v2.json'), 'utf8')
);
const packetNames = [
  'owner-benchmarks',
  'browser-and-repaired-guards',
  'api-repaired-comparisons',
  'api-repaired-comparisons-final',
];
const packets = packetNames.map((name) => ({
  name,
  ...read(`${name}/results.json`),
}));
for (const packet of packets) {
  assert.ok(packet.finishedAt, `Unfinished packet: ${packet.name}`);
  assert.equal(packet.results.length, packet.expected);
}
const notes = {
  'decoration-manager-scalability': [
    'timing-failure',
    'Equal outputs and deterministic work guards pass; large-source mount/update timing fails. Pursue E26 attribution, preserving read locality, order and cleanup.',
  ],
  'react-text-flow-browser-matrix': [
    'timeout',
    'Dense, overlap and code fixtures at 10,000 time out. The 999 sentinel is invalid as a duration; do not rank these cells. Pursue E03 and retain the failed fixtures.',
  ],
  'plite-external-text-browser': [
    'inconclusive-noise',
    'Correctness and budgets pass; the 40,000 sparse-decoration local-edit cell fails the jitter guard. Preserve as inconclusive and repeat only with a noise-control intervention.',
  ],
  'plate-code-block-text-flow-browser': [
    'timing-failure',
    'Highlight-settle, input-to-paint and mount-to-paint budget ratios are 1.16, 3.25 and 1.75. Keep correctness controls and pursue E03 complete highlighting attribution.',
  ],
  'react-huge-document-full': [
    'timing-failure',
    'No correctness failures; the worst legacy p95 ratio is 7.97 against a 1.5 limit. Retain mode-specific timing/DOM/cold-materialization rows; do not pool them with the full-DOM common fixture.',
  ],
  'core-rich-text-operations-compare': [
    'mixed-equivalence-and-timing-pressure',
    'The original command passes its limited assertions. A separate full-final-state replay matches 12/15 lanes, including move/remove, but expanded deletion, mixed fragment insertion and wrap/unwrap differ. No aggregate speed metric is promoted. The matched 32-block move at 1,000 blocks is 140.83 ms p95 versus 1.18 ms for Slate; removal is 119.28 versus 1.10 ms. These are programmatic batches. E02 owns causal attribution; incompatible operation rows need a matched public contract.',
  ],
};
const rows = registry.targets.map((target) => {
  if (target.id === 'cross-editor-human-operations')
    return {
      id: target.id,
      outcome: 'mixed-operation-results',
      commandStatus: 'completed with retained failed and unsupported cells',
      primaryMetric: null,
      metricName: target.metrics.primary,
      metricUnit: target.metrics.unit,
      correctness:
        '933 passing cells; six Wordgard macOS line-binding failures; six fixture-unsupported HTML cells',
      artifact: 'common-comparison-summary.json',
      detail:
        'Nine editors, three sizes, 35 rows: 945 cells. Report per-operation clocks and oracle results; no aggregate editor speed score.',
      history: ['cross-editor-common-full-dom-chunk-on.json'],
    };
  if (target.id === 'core-normalization-compare') {
    const receipt = read('normalization-all-rows-receipt.json');
    const result = read('normalization-all-rows.json');
    assert.equal(Object.keys(result.current).length, 5);
    assert.equal(Object.keys(result.legacy).length, 5);
    assert.equal(result.invalidRows.length, 1);
    assert.equal(
      result.invalidRows[0].lane,
      'explicitInlineFlattenNormalizeMs'
    );
    assert.equal(result.current.explicitInlineFlattenNormalizeMs.mean, null);
    return {
      id: target.id,
      outcome: 'contract-gap',
      commandStatus: `exit ${receipt.benchmarkExit}; all ten engine/operation rows retained`,
      primaryMetric: null,
      metricName: target.metrics.primary,
      metricUnit: target.metrics.unit,
      correctness: receipt.correctnessResult,
      artifact: 'normalization-all-rows.json',
      detail:
        'Four comparable operation pairs pass; malformed inline replacement is rejected by the current public schema API. Its timing is null. Explicit rows measure replacement plus repair on both engines; three samples support descriptive ranges, not p95 or a regression verdict.',
      history: [
        ...packetNames
          .filter((name) =>
            read(`${name}/results.json`).results.some(
              (row) => row.id === target.id
            )
          )
          .map((name) => `${name}/results.json`),
        'normalization-all-rows-receipt.json',
      ],
    };
  }
  const history = packets.flatMap((packet) =>
    packet.results
      .filter((result) => result.id === target.id)
      .map((result) => ({ packet, result }))
  );
  assert.ok(history.length, `Unattempted registered target: ${target.id}`);
  const { packet, result } = history.at(-1);
  const guard = result.commands.find(
    (command) => command.command === result.correctness
  );
  assert.equal(guard?.status, 0, `Final guard did not pass: ${target.id}`);
  const [outcome, detail] = notes[target.id] ?? [
    result.status === 'pass' ? 'pass' : 'unclassified-failure',
    'Retain the registered command result within its fixture, sampling, correctness and metric boundary. No broader superiority claim follows.',
  ];
  assert.notEqual(
    outcome,
    'unclassified-failure',
    `Inspect final failure: ${target.id}`
  );
  const artifact = result.artifacts.find(
    (artifact) => artifact.captured && artifact.destination?.endsWith('.json')
  );
  const equivalence =
    target.id === 'core-rich-text-operations-compare'
      ? read('rich-text-final-state-equivalence.json')
      : null;
  return {
    id: target.id,
    outcome,
    commandStatus: result.status,
    primaryMetric: equivalence ? null : (result.primaryMetric ?? null),
    metricName: target.metrics.primary,
    metricUnit: target.metrics.unit,
    correctness: `exit 0; ${guard.executed === false ? 'same-source cached guard' : 'executed guard'}`,
    artifact: artifact
      ? relative(out, artifact.destination)
      : `${packet.name}/results.json`,
    detail,
    ...(equivalence
      ? {
          finalStateEquivalence: equivalence.summary,
          equivalenceArtifact: 'rich-text-final-state-equivalence.json',
          queryBoundary:
            'State equality in read-only query lanes does not establish equality of the query outputs.',
        }
      : {}),
    commands: result.commands.map(({ command, status, log, executed }) => ({
      command,
      status,
      log: relative(out, log),
      executed: executed !== false,
    })),
    history: history.map(({ packet }) => `${packet.name}/results.json`),
  };
});
assert.equal(rows.length, 48);
assert.equal(new Set(rows.map((row) => row.id)).size, rows.length);
const byOutcome = Object.fromEntries(
  [...new Set(rows.map((row) => row.outcome))].map((outcome) => [
    outcome,
    rows.filter((row) => row.outcome === outcome).map((row) => row.id),
  ])
);
const report = {
  capturedAt: new Date().toISOString(),
  canonicalRegistry: 'benchmarks/targets/slate-v2.json',
  registrySha256: createHash('sha256')
    .update(readFileSync(resolve(root, 'benchmarks/targets/slate-v2.json')))
    .digest('hex'),
  expected: registry.targets.length,
  attempted: rows.length,
  byOutcome,
  packetSourceLimits: packets.map(
    ({ name, sourceBefore, sourceAfter, changedSources }) => ({
      packet: name,
      recordedInputs: Object.keys(sourceBefore).length,
      finalReadback: Boolean(sourceAfter),
      changedSources,
    })
  ),
  policy:
    'This is a derived result index for one research iteration, not a second benchmark target registry. Latest valid replay supersedes only the same target; original failures remain linked. Command pass is not a universal speed budget or current-source attestation. Per-operation oracle failures, noise and contract gaps remain distinct.',
  rows,
};
writeFileSync(
  resolve(out, 'registered-target-results.json'),
  JSON.stringify(report, null, 2) + '\n'
);
const lines = [
  '# Registered target results',
  '',
  `All ${rows.length}/${registry.targets.length} canonical targets were attempted. ${Object.entries(
    byOutcome
  )
    .map(([outcome, ids]) => `${outcome}: ${ids.length}`)
    .join('; ')}.`,
  '',
  report.policy,
  '',
  '| Registered target | Outcome | Primary metric | Correctness | Evidence and decision |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map(
    (row) =>
      `| ${row.id} | ${row.outcome} | ${row.primaryMetric === null ? 'No valid aggregate metric' : `${row.primaryMetric} ${row.metricUnit} (${row.metricName})`} | ${row.correctness} | [Receipt](${row.artifact}). ${row.detail} |`
  ),
  '',
  'Packet input changes are recorded in the JSON index. Most initial packet changes belong to concurrent Plate navigation/test work; later browser packet inputs were stable. The rich-text replay has a change in the separate normalization harness, retained as a source-scope qualification. No old packet is relabeled as a current whole-tree result.',
  '',
];
writeFileSync(resolve(out, 'registered-target-results.md'), lines.join('\n'));
console.log(
  JSON.stringify({
    attempted: rows.length,
    outcomes: Object.fromEntries(
      Object.entries(byOutcome).map(([outcome, ids]) => [outcome, ids.length])
    ),
  })
);
