import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  assessCell,
  assessMatrix,
  policies,
} from './markdown-streaming-measurement.mjs';

const reference = 'a'.repeat(64);
const noRegression = policies['s5-no-regression-v1'];
const workGain = policies['s5-work-gain-profile120-v1'];

const stream = (arm, role, order, overrides = {}) => {
  const parse = arm === 'baseline' ? 500 : 200;
  const sampled = parse + 100 + 200 + 50 + 100 + 50;

  return {
    arm,
    buildId: arm === 'baseline' ? 'build-b' : 'build-c',
    errors: [],
    finalTextSha256: reference,
    order,
    page: { latencyP95Ms: 40 },
    profile: {
      aligned: true,
      stream: {
        gc: 50,
        other: 50,
        parse,
        program: 100,
        react: 200,
        transaction: 100,
      },
    },
    role,
    timedOut: false,
    trace: { finalWorkMs: 10, totalMs: sampled },
    ...overrides,
  };
};

const receipt = (edit = (streams) => streams) => ({
  cell: 'static-rich-10000',
  preflight: {
    baseline: {
      buildId: 'build-b',
      pass: true,
      referenceTextSha256: reference,
    },
    candidate: {
      buildId: 'build-c',
      pass: true,
      referenceTextSha256: reference,
    },
    cell: 'static-rich-10000',
    sourceHash: 'source',
  },
  sourceHash: 'source',
  status: 'complete',
  streams: edit([
    stream('baseline', 'warmup', 0),
    stream('candidate', 'warmup', 1),
    stream('baseline', 'pair-0', 2),
    stream('candidate', 'pair-0', 3),
    stream('candidate', 'pair-1', 4),
    stream('baseline', 'pair-1', 5),
    stream('baseline', 'pair-2', 6),
    stream('candidate', 'pair-2', 7),
  ]),
});

const candidates = (overrides) => (streams) =>
  streams.map((entry) =>
    entry.arm === 'candidate' ? { ...entry, ...overrides } : entry
  );

test('passes a complete matrix with matching preflight references', () => {
  assert.equal(assessCell(receipt(), workGain).verdict, 'pass');
  assert.equal(assessCell(receipt(), noRegression).verdict, 'pass');
});

test('rejects the audited false positives at the check that owns them', () => {
  const cases = {
    differentText: [
      candidates({ finalTextSha256: 'b'.repeat(64) }),
      'correctness',
      'fail',
    ],
    missingFinalClock: [
      candidates({ trace: { totalMs: 700 } }),
      'latency',
      'inconclusive',
    ],
    missingText: [
      (streams) =>
        streams.map((entry) => ({ ...entry, finalTextSha256: null })),
      'correctness',
      'inconclusive',
    ],
    mixedWorkClocks: [
      candidates({ profile: undefined }),
      'work',
      'inconclusive',
    ],
  };

  for (const [name, [edit, owner, status]] of Object.entries(cases)) {
    const result = assessCell(receipt(edit), workGain);

    assert.equal(result.checks[owner].status, status, name);
    assert.notEqual(result.verdict, 'pass', name);
  }
});

test('fails streamed text both arms share when it differs from the whole-document parse', () => {
  const result = assessCell(
    receipt((streams) =>
      streams.map((entry) => ({ ...entry, finalTextSha256: 'b'.repeat(64) }))
    ),
    noRegression
  );

  assert.equal(result.checks.correctness.status, 'fail');
  assert.equal(result.checks.correctness.values.parity, true);
});

test('fails a candidate that consistently renders different text from the baseline', () => {
  const value = receipt(candidates({ finalTextSha256: 'c'.repeat(64) }));
  value.preflight.candidate.referenceTextSha256 = 'c'.repeat(64);

  assert.deepEqual(assessCell(value, noRegression).checks.correctness, {
    reasons: ['arms disagree on the reference text'],
    status: 'fail',
    values: { parity: false },
  });
});

test('binds correctness to the preflight cell, source and served builds', () => {
  const preflightFor = (edit) => {
    const value = receipt();
    value.preflight = edit(value.preflight);
    return assessCell(value, noRegression).checks.correctness;
  };

  assert.equal(
    preflightFor((preflight) => ({ ...preflight, cell: 'ai-rich-10000' }))
      .status,
    'fail'
  );
  const sameBuild = receipt(candidates({ buildId: 'build-b' }));
  sameBuild.preflight.candidate.buildId = 'build-b';
  assert.deepEqual(
    assessCell(sameBuild, noRegression).checks.correctness.reasons,
    ['both arms serve the same build']
  );
  assert.equal(
    assessCell(receipt(candidates({ buildId: 'stale-build' })), noRegression)
      .checks.correctness.status,
    'fail'
  );
  assert.equal(preflightFor(() => undefined).status, 'inconclusive');
  assert.deepEqual(preflightFor(({ baseline, ...rest }) => rest).reasons, [
    'no baseline preflight',
  ]);
  assert.equal(
    preflightFor((preflight) => ({
      ...preflight,
      baseline: { ...preflight.baseline, pass: false },
    })).status,
    'fail'
  );
});

test('rejects duplicated and dropped pairs instead of discarding them', () => {
  const duplicated = assessCell(
    receipt((streams) => [...streams, stream('candidate', 'pair-1', 8)]),
    noRegression
  );
  const dropped = assessCell(
    receipt((streams) =>
      streams.filter(
        (entry) => !(entry.arm === 'baseline' && entry.role === 'pair-2')
      )
    ),
    noRegression
  );

  assert.equal(duplicated.checks.completeness.status, 'fail');
  assert.equal(dropped.checks.completeness.status, 'inconclusive');
});

test('keeps the work-gain and no-regression policies separate', () => {
  const flat = receipt(
    candidates({
      profile: stream('baseline', 'pair-0', 0).profile,
      trace: stream('baseline', 'pair-0', 0).trace,
    })
  );
  const ratio122 = receipt(
    candidates({ trace: { finalWorkMs: 10, totalMs: 700 / 1.22 } })
  );
  const traceOnly = receipt((streams) =>
    streams.map((entry) => ({ ...entry, profile: undefined }))
  );
  const smallGain = receipt((streams) =>
    streams.map((entry) => ({
      ...entry,
      profile: {
        ...entry.profile,
        stream: {
          ...entry.profile.stream,
          parse: entry.arm === 'baseline' ? 250 : 170,
        },
      },
    }))
  );

  assert.equal(assessCell(flat, noRegression).verdict, 'pass');
  assert.equal(assessCell(flat, workGain).checks.work.status, 'fail');
  assert.equal(
    assessCell(ratio122, workGain).checks.attribution.status,
    'inconclusive'
  );
  assert.equal(assessCell(traceOnly, noRegression).verdict, 'inconclusive');
  assert.equal(
    assessCell(traceOnly, workGain).checks.work.status,
    'inconclusive'
  );
  assert.match(
    assessCell(smallGain, workGain).checks.work.reasons.join(','),
    /saves 80\.0ms/u
  );
});

test('fails a work gain that sits inside the arms’ own variation', () => {
  const noisy = receipt((streams) =>
    streams.map((entry) =>
      entry.arm === 'baseline' && entry.role === 'pair-2'
        ? {
            ...entry,
            profile: {
              ...entry.profile,
              stream: { ...entry.profile.stream, parse: 900 },
            },
          }
        : entry
    )
  );

  assert.deepEqual(assessCell(noisy, workGain).checks.work.reasons, [
    'smallest gain is inside arm variation',
  ]);
});

test('replays the archived content-root matrix with its recorded limits', () => {
  const matrix = path.resolve(
    import.meta.dirname,
    '../../../docs/research/probes/2026-09-30-content-root-locations/s5/matrix'
  );
  const verdicts = (policyId) =>
    Object.fromEntries(
      assessMatrix(matrix, policyId).cells.map((cell) => [cell.cell, cell])
    );
  const regression = verdicts('s5-no-regression-v1');
  const gain = verdicts('s5-work-gain-profile120-v1');
  const aiRich = new Set(['ai-rich-10000', 'ai-rich-50000']);

  for (const [name, cell] of Object.entries(regression)) {
    assert.equal(cell.verdict, 'inconclusive', name);
    assert.deepEqual(cell.checks.correctness.reasons, ['no preflight'], name);
    assert.equal(cell.checks.latency.status, 'pass', name);
    assert.equal(
      cell.checks.attribution.status,
      aiRich.has(name) ? 'inconclusive' : 'pass',
      name
    );
  }
  for (const [name, cell] of Object.entries(gain)) {
    if (!aiRich.has(name)) {
      assert.equal(cell.checks.work.status, 'fail', name);
    }
  }
});

test('refuses to write inside the matrix or over an existing assessment', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 's5-evaluator-'));
  t.after(() => fs.rmSync(directory, { force: true, recursive: true }));
  const matrix = path.join(directory, 'matrix');
  const existing = path.join(directory, 'matrix-summary.json');
  fs.mkdirSync(matrix);
  fs.writeFileSync(path.join(matrix, 'cell.json'), JSON.stringify(receipt()));
  fs.writeFileSync(existing, 'original');
  const evaluate = (out) =>
    execFileSync(
      process.execPath,
      [
        path.join(import.meta.dirname, 'markdown-streaming-measurement.mjs'),
        matrix,
        '--policy',
        's5-no-regression-v1',
        '--out',
        out,
      ],
      { stdio: 'pipe' }
    );

  assert.throws(() => evaluate(existing), /Refusing to overwrite/u);
  assert.throws(
    () => evaluate(path.join(matrix, 'out.json')),
    /outside the matrix/u
  );
  assert.equal(fs.readFileSync(existing, 'utf-8'), 'original');
});
