import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { scoreArchitecture } from '../../../../tooling/scripts/plate-review-score.mjs';
import { evidence } from './architecture-evidence.mjs';
import { plateEvidence } from './plate-architecture-evidence.mjs';
import { supportEvidence } from './support-architecture-evidence.mjs';

const root = resolve(import.meta.dirname, '../../../..');
const artifactRoot = resolve(
  root,
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const manifest = JSON.parse(
  readFileSync(
    resolve(artifactRoot, 'local-architecture-manifest.json'),
    'utf8'
  )
);
const contracts = JSON.parse(
  readFileSync(resolve(artifactRoot, 'public-contract-traces.json'), 'utf8')
);
const combinedEvidence = [...evidence, ...plateEvidence, ...supportEvidence];
const byId = new Map(combinedEvidence.map((entry) => [entry.id, entry]));
if (byId.size !== combinedEvidence.length)
  throw new Error('Duplicate source assessment');
const axes = [
  'owner',
  'lifetime',
  'boundary',
  'api',
  'scale',
  'correctness',
  'proof',
];
const assessed = [];
const unresolved = [];

for (const lane of manifest.lanes.filter(
  ({ id }) => !id.startsWith('excluded.')
)) {
  const assessment = byId.get(lane.id);
  if (!assessment) {
    unresolved.push({
      id: lane.id,
      reason:
        'File accounting is complete; semantic axis assessment has not been completed.',
    });
    continue;
  }
  const ownerCandidates = lane.files.filter(
    (path) => basename(path) === assessment.file || path === assessment.file
  );
  if (ownerCandidates.length !== 1) {
    throw new Error(
      `${lane.id}: expected one ${assessment.file} owner; found ${ownerCandidates.join(', ')}`
    );
  }
  const owner = ownerCandidates[0];
  const source = readFileSync(resolve(root, owner), 'utf8');
  const lines = source.split('\n');
  const definition = lines.findIndex((line) =>
    /^export (?:const|function|class|type|interface)|^(?:const|function|class) /.test(
      line
    )
  );
  const citation = `${owner}:${Math.max(1, definition + 1)}`;
  const grades = Object.fromEntries(
    axes.map((axis, index) => [axis, Number(assessment.grades[index])])
  );
  const caps = assessment.incomplete
    ? ['incomplete-manifest']
    : assessment.zeroRuntimeProven
      ? []
      : ['unmeasured-scale'];
  const confidence = {
    inventory: 4,
    trace: assessment.incomplete ? 1 : 2,
    consumers: 2,
    runtime: 1,
  };
  const score = scoreArchitecture({ axes: grades, caps, confidence });
  const publicEntries = contracts.entries
    .filter(
      (entry) =>
        entry.reexportFiles?.some((path) => lane.files.includes(path)) ||
        lane.files.includes(entry.source)
    )
    .map(
      ({ package: packageName, entrypoint }) =>
        `${packageName}${entrypoint === '.' ? '' : entrypoint.slice(1)}`
    );
  assessed.push({
    id: lane.id,
    sourceUnits: lane.count,
    owner,
    sourceSha256: createHash('sha256').update(source).digest('hex'),
    publicEntries,
    sourceAccounting:
      'Every captured unit has a primary accounting lane. Representative semantic owner assessment does not claim a full interprocedural call graph.',
    axes: Object.fromEntries(
      axes.map((axis) => [
        axis,
        {
          ...score.axisPoints[axis],
          citation,
          reason: assessment[axis],
          falsifier: assessment.falsifier,
        },
      ])
    ),
    scaleVariables: assessment.scale,
    confidenceInput: confidence,
    score,
    nextOwner: assessment.typeOnly
      ? 'Verify Plate: source/packed consumer and type-budget proof'
      : 'Benchmark: exact growing-variable and native-operation packet',
  });
}
for (const id of byId.keys())
  if (!manifest.lanes.some((lane) => lane.id === id))
    throw new Error(`Unknown architecture lane ${id}`);

const result = {
  capturedAt: new Date().toISOString(),
  scope:
    'Independent local architecture lanes. No average or overall editor score. Scores are evidence assessments, not performance rankings.',
  expectedLaneCount: manifest.lanes.filter(
    ({ id }) => !id.startsWith('excluded.')
  ).length,
  assessedLaneCount: assessed.length,
  unresolved,
  rubric:
    'tooling/scripts/plate-review-score.mjs; seven weighted axes, 0..4 grades, hard caps and separate evidence confidence.',
  measurementPolicy:
    'Unmeasured runtime owners retain a provisional ceiling even where source ownership is coherent. Existing tests are named guards, not fresh passes. Type-only entries still require exact consumer proof.',
  lanes: assessed,
};
writeFileSync(
  resolve(artifactRoot, 'architecture-scores.json'),
  `${JSON.stringify(result, null, 2)}\n`
);
const table = [
  '# Architecture assessments',
  '',
  `${assessed.length}/${result.expectedLaneCount} lanes have source assessments. ${unresolved.length} semantic assessments remain unresolved. File accounting alone never produces a score.`,
  '',
  'Scores use the repository seven-axis rubric. A provisional ceiling is not an achieved score. No mean is computed across independent owners. Source and existing proof topology do not establish current latency or raw device behavior.',
  '',
  '| Lane | Source units | Owner | Lifetime | Boundary | API | Scale | Correctness | Proof | Score | Confidence |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...assessed.map(
    (lane) =>
      `| ${lane.id} | ${lane.sourceUnits} | ${axes.map((axis) => lane.axes[axis].grade).join(' | ')} | ${lane.score.displayScore} | ${lane.score.confidence}/100 |`
  ),
  '',
  ...assessed.flatMap((lane) => [
    `## ${lane.id}`,
    '',
    `Current semantic owner: [${lane.owner}](${resolve(root, lane.owner)}). Public reexport entries: ${lane.publicEntries.length ? lane.publicEntries.map((entry) => `\`${entry}\``).join(', ') : 'internal or consumer-only owner; no independent package entrypoint'}.`,
    '',
    '| Axis | Grade | Points | Source-grounded reason |',
    '| --- | ---: | ---: | --- |',
    ...axes.map(
      (axis) =>
        `| ${axis} | ${lane.axes[axis].grade} | ${lane.axes[axis].points} | ${lane.axes[axis].reason} [Source](${resolve(root, lane.owner)}:${Number(lane.axes[axis].citation.split(':').at(-1))}). |`
    ),
    '',
    `Falsifier: ${lane.axes.scale.falsifier}`,
    '',
    `Next proof owner: ${lane.nextOwner}.`,
    '',
  ]),
  ...(unresolved.length
    ? [
        '## Unresolved semantic assessments',
        '',
        ...unresolved.map(({ id, reason }) => `- ${id}: ${reason}`),
        '',
      ]
    : []),
];
writeFileSync(
  resolve(artifactRoot, 'architecture-scores.md'),
  `${table.join('\n')}\n`
);
console.log(
  JSON.stringify({
    assessed: assessed.length,
    expected: result.expectedLaneCount,
    unresolved: unresolved.length,
  })
);
