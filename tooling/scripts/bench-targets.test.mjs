import assert from 'node:assert/strict';
import test from 'node:test';

import { buildTargetHistory, renderMarkdownReport } from './bench-targets.mjs';

const target = ({ id, path, required = true }) => ({
  id,
  question: `${id} question`,
  owner: 'slate-v2',
  family: 'test',
  kind: 'current',
  cwd: '.',
  command: 'true',
  metrics: {
    primary: `${id}_metric`,
    direction: 'lower',
    printsMetric: true,
  },
  correctness: {
    command: 'true',
  },
  artifacts: [{ path, required }],
});

test('keeps previous artifact existence sticky for partial local benchmark caches', () => {
  const stickyPath = `.tmp/bench-targets-sticky-${process.pid}.json`;
  const missingPath = `.tmp/bench-targets-missing-${process.pid}.json`;

  const history = buildTargetHistory(
    {
      version: 1,
      policy: {},
      targets: [
        target({ id: 'missing-target', path: missingPath }),
        target({ id: 'sticky-target', path: stickyPath }),
      ],
    },
    [
      {
        targets: [
          {
            id: 'sticky-target',
            artifacts: [{ path: stickyPath, required: true, exists: true }],
          },
        ],
      },
    ]
  );

  assert.deepEqual(history.counts, {
    artifacts: 2,
    existingArtifacts: 1,
    missingOptionalArtifacts: 0,
    missingRequiredArtifacts: 1,
    requiredArtifacts: 2,
    statusCounts: {
      'missing-required-artifact': 1,
      ok: 1,
    },
    targets: 2,
  });
  assert.equal(
    history.targets.find((entry) => entry.id === 'sticky-target')?.status,
    'ok'
  );
  assert.match(renderMarkdownReport(history), /Missing required artifacts: 1/);
});
