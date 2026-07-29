import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateConceptMatrix } from './validate-concept-matrix.mjs';

const header = [
  'ID',
  'Concept',
  'Origin',
  'Reference mapping',
  'Plite mapping',
  'Plate mapping',
  'Correctness',
  'API/types',
  'Data/collab',
  'Ownership/lifecycle',
  'Runtime/perf',
  'Proof/host',
  'Classification',
  'Preferred base',
  'Reference adaptation',
  'Local debt',
  'Proof adaptation',
  'Prior candidates',
  'Verdict',
  'Priority',
];

const manifest = (concepts, priorCandidates = []) => ({
  concepts: concepts.map(([id, origin = 'reference']) => ({ id, origin })),
  priorCandidates,
});

const exactMapping = (root) =>
  `exact — public=\`${root}/api.ts:10\`; owner=\`${root}/owner.ts:20\`; consumers=\`${root}/consumer.ts:30\`; lifecycle=\`${root}/lifecycle.ts:40\`; proof=\`${root}/owner.test.ts:50\` — complete contract traced`;

const row = (id, overrides = {}) => {
  const cells = {
    'API/types':
      'Plite stronger — `packages/plite/src/api.ts:10` preserves structural inference',
    Classification:
      'Plite stronger — `packages/plite/src/owner.ts:20` is the better base architecture',
    Concept: `Concept ${id}`,
    Correctness:
      'reference stronger — `../wordgard/src/owner.ts:20` centralizes the invariant',
    'Data/collab':
      'Plite stronger — `packages/plite/src/change.ts:10` preserves multi-root JSON',
    ID: `\`${id}\``,
    'Local debt':
      'material — `packages/plite/src/api.ts:10` leaves conflict cleanup to callers',
    Origin: 'reference',
    'Ownership/lifecycle':
      'reference stronger — `../wordgard/src/lifecycle.ts:40` owns conflict cleanup centrally',
    'Plate mapping':
      'not-applicable — `docs/vision/plate.md:10` assigns this substrate rule to Plite',
    'Plite mapping': exactMapping('packages/plite/src'),
    'Preferred base':
      'Plite — `packages/plite/src/change.ts:10` preserves the applicable local model',
    'Prior candidates':
      'none — [candidate search](docs/plans/audit.md#candidate-search) found no matching P0-P3 dossier',
    Priority: 'P1',
    'Proof adaptation':
      'adapt — [Wordgard harvest](docs/editor-test-harvester/wordgard/report.md) contributes a portable invariant',
    'Proof/host':
      'different tradeoff — `packages/browser/src/proof.ts:10` is broader while the reference case is sharper',
    'Reference adaptation':
      'adapt — `../wordgard/src/owner.ts:20` should replace caller cleanup',
    'Reference mapping': exactMapping('../wordgard/src'),
    'Runtime/perf':
      'equivalent — `benchmarks/editor/result.json` shows no material runtime difference',
    Verdict:
      'rearchitect — keep the Plite base and move conflict ownership into its schema compiler',
    ...overrides,
  };

  return `| ${header.map((column) => cells[column]).join(' | ')} |`;
};

const ledger = (...rows) =>
  [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows,
  ].join('\n');

const localOnlyOverrides = {
  'API/types':
    'Plite stronger — `packages/plite/src/api.ts:10` owns the only applicable API',
  Classification:
    'Plite stronger — `packages/plite/src/owner.ts:20` owns the complete local contract',
  Correctness:
    'Plite stronger — `packages/plite/src/owner.ts:20` enforces the local invariant',
  'Data/collab':
    'Plite stronger — `packages/plite/src/change.ts:10` owns the applicable data model',
  'Local debt':
    'none — `packages/plite/src/owner.test.ts:50` covers the complete local contract',
  Origin: 'Plite',
  'Ownership/lifecycle':
    'Plite stronger — `packages/plite/src/lifecycle.ts:40` owns local cleanup',
  'Preferred base':
    'Plite — `packages/plite/src/owner.ts:20` is the only applicable base',
  Priority: '—',
  'Proof adaptation':
    'not-applicable — [reference proof scan](docs/plans/audit.md#reference-proof-scan) found no reference proof',
  'Proof/host':
    'Plite stronger — `packages/plite/src/owner.test.ts:50` proves the local host contract',
  'Reference adaptation':
    'not-applicable — [reference source scan](docs/plans/audit.md#reference-source-scan) found no mechanism',
  'Reference mapping':
    'absent — [reference source scan](docs/plans/audit.md#reference-source-scan) found no matching owner',
  'Runtime/perf':
    'Plite stronger — `benchmarks/editor/result.json` covers the only applicable runtime',
  Verdict: 'keep — the local owner covers the complete contract',
};

test('accepts a stronger local base with adapted reference mechanisms', () => {
  const result = validateConceptMatrix({
    ledger: ledger(
      row('WG-DOC-001', {
        'Prior candidates':
          '`A3` reaffirm — [A3 dossier](docs/plans/audit.md#a3) still targets the same debt',
      })
    ),
    manifest: manifest(
      [['WG-DOC-001']],
      [
        {
          conceptIds: ['WG-DOC-001'],
          evidence: 'docs/plans/audit.md#a3',
          id: 'A3',
        },
      ]
    ),
  });

  assert.deepEqual(result.referenceAdaptations.adapt, {
    count: 1,
    ids: ['WG-DOC-001'],
  });
  assert.deepEqual(result.localDebt.material, {
    count: 1,
    ids: ['WG-DOC-001'],
  });
  assert.deepEqual(result.proofAdaptations.adapt, {
    count: 1,
    ids: ['WG-DOC-001'],
  });
  assert.deepEqual(result.priorCandidates.reaffirm, {
    count: 1,
    ids: ['A3'],
  });
  assert.equal(result.integrity.cannedProfiles, 0);
});

test('accepts a local-only concept in the symmetric inventory', () => {
  const result = validateConceptMatrix({
    ledger: ledger(row('PLITE-LOCAL-001', localOnlyOverrides)),
    manifest: manifest([['PLITE-LOCAL-001', 'Plite']]),
  });

  assert.deepEqual(result.origins.Plite, {
    count: 1,
    ids: ['PLITE-LOCAL-001'],
  });
  assert.deepEqual(result.referenceAdaptations['not-applicable'], {
    count: 1,
    ids: ['PLITE-LOCAL-001'],
  });
});

test('rejects grouped concept IDs and reports missing atomic rows', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(row('WG-DOC-001..002')),
        manifest: manifest([['WG-DOC-001'], ['WG-DOC-002']]),
      }),
    /grouped concept row.*WG-DOC-001\.\.002[\s\S]*missing concept rows.*WG-DOC-001, WG-DOC-002/
  );
});

test('rejects duplicate and unknown concept rows', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(row('WG-DOC-001'), row('WG-DOC-001'), row('WG-DOC-999')),
        manifest: manifest([['WG-DOC-001'], ['WG-DOC-002']]),
      }),
    /duplicate concept rows.*WG-DOC-001[\s\S]*unknown concept row.*WG-DOC-999[\s\S]*missing concept rows.*WG-DOC-002/
  );
});

test('rejects a row origin that contradicts the manifest', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(row('WG-DOC-001', { Origin: 'Plite' })),
        manifest: manifest([['WG-DOC-001', 'reference']]),
      }),
    /Origin Plite contradicts manifest origin reference/
  );
});

test('rejects exact mappings without the complete contract', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(
          row('WG-DOC-001', {
            'Plite mapping':
              'exact — `packages/plite/src/owner.ts:20` owns the behavior',
          })
        ),
        manifest: manifest([['WG-DOC-001']]),
      }),
    /Plite mapping exact contract must name evidence-backed public, owner, consumers, lifecycle, and proof/
  );
});

test('rejects partial mappings without covered, missing, and proof facets', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(
          row('WG-DOC-001', {
            'Reference mapping':
              'partial — covers=`../wordgard/src/owner.ts:20`; proof=`../wordgard/src/owner.test.ts:50`',
          })
        ),
        manifest: manifest([['WG-DOC-001']]),
      }),
    /Reference mapping partial contract must name evidence-backed covers, missing, and proof; missing missing/
  );
});

test('rejects qualitative claims and dispositions without citations', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(
          row('WG-DOC-001', {
            Correctness:
              'reference stronger — centralizes the invariant cleanly',
            'Reference adaptation':
              'adapt — central ownership should replace caller cleanup',
          })
        ),
        manifest: manifest([['WG-DOC-001']]),
      }),
    /Correctness needs a source or symbol citation[\s\S]*Reference adaptation needs a source or dossier citation/
  );
});

test('rejects a canned qualitative profile reused across concepts', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(row('WG-DOC-001'), row('WG-DOC-002')),
        manifest: manifest([['WG-DOC-001'], ['WG-DOC-002']]),
      }),
    /canned qualitative profile reused across concepts: WG-DOC-001, WG-DOC-002/
  );
});

test('accepts distinct source-derived qualitative profiles', () => {
  const result = validateConceptMatrix({
    ledger: ledger(
      row('WG-DOC-001'),
      row('WG-DOC-002', {
        Correctness:
          'reference stronger — `../wordgard/src/selection.ts:70` preserves backward selections atomically',
      })
    ),
    manifest: manifest([['WG-DOC-001'], ['WG-DOC-002']]),
  });

  assert.equal(result.rows, 2);
});

test('rejects a preferred base that contradicts classification or mapping', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(
          row('WG-DOC-001', {
            Classification:
              'Plate stronger — `packages/plate/src/api.ts:10` exposes the cleaner product API',
            'Plate mapping':
              'absent — [Plate scan](docs/plans/audit.md#plate-scan) found no product owner',
            'Preferred base':
              'Plite — `packages/plite/src/api.ts:10` has broader constraints',
          })
        ),
        manifest: manifest([['WG-DOC-001']]),
      }),
    /Classification cannot prefer Plate when Plate mapping is absent[\s\S]*Preferred base Plite contradicts Plate stronger/
  );
});

test('rejects material extraction hidden behind keep or no priority', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(
          row('WG-DOC-001', {
            Priority: '—',
            Verdict: 'keep — local base is stronger overall',
          })
        ),
        manifest: manifest([['WG-DOC-001']]),
      }),
    /material adaptation or debt requires steal, rearchitect, hard-cut, or move/
  );
});

test('rejects a priority on a non-material row', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(
          row('PLITE-LOCAL-001', {
            ...localOnlyOverrides,
            Priority: 'P2',
          })
        ),
        manifest: manifest([['PLITE-LOCAL-001', 'Plite']]),
      }),
    /non-material verdict requires priority —/
  );
});

test('rejects reference-stronger classification without adaptation', () => {
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(
          row('WG-DOC-001', {
            Classification:
              'reference stronger — `../wordgard/src/owner.ts:20` owns the complete contract',
            'Preferred base':
              'reference — `../wordgard/src/owner.ts:20` owns the complete contract',
            'Reference adaptation':
              'keep-local — `packages/plite/src/owner.ts:20` remains the current owner',
          })
        ),
        manifest: manifest([['WG-DOC-001']]),
      }),
    /reference stronger requires adapting or explicitly deferring/
  );
});

test('rejects missing, unknown, and misassigned prior candidates', () => {
  const candidates = [
    {
      conceptIds: ['WG-DOC-002'],
      evidence: 'docs/plans/audit.md#a3',
      id: 'A3',
    },
  ];
  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(
          row('WG-DOC-001', {
            'Prior candidates':
              '`A3` reaffirm — [A3 dossier](docs/plans/audit.md#a3) still targets this row<br>`B7` reject — [candidate search](docs/plans/audit.md#b7) found a stale proposal',
          }),
          row('WG-DOC-002', {
            Correctness:
              'reference stronger — `../wordgard/src/selection.ts:70` preserves backward selections atomically',
          })
        ),
        manifest: manifest([['WG-DOC-001'], ['WG-DOC-002']], candidates),
      }),
    /WG-DOC-001 is not in prior candidate A3 conceptIds[\s\S]*cites unknown prior candidate B7/
  );

  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: ledger(row('WG-DOC-001')),
        manifest: manifest(
          [['WG-DOC-001']],
          [
            {
              conceptIds: ['WG-DOC-001'],
              evidence: 'docs/plans/audit.md#a3',
              id: 'A3',
            },
          ]
        ),
      }),
    /unreconciled prior candidates: A3/
  );
});

test('rejects the legacy one-sided matrix schema', () => {
  const legacyHeader = [
    'ID',
    'Concept',
    'Reference owner/evidence',
    'Plite mapping',
    'Plate mapping',
    'Correctness',
    'API/types',
    'Data/collab',
    'Ownership/lifecycle',
    'Runtime/perf',
    'Proof/host',
    'Classification',
    'Preferred implementation',
    'Verdict',
    'Priority',
  ];
  const legacyLedger = [
    `| ${legacyHeader.join(' | ')} |`,
    `| ${legacyHeader.map(() => '---').join(' | ')} |`,
  ].join('\n');

  assert.throws(
    () =>
      validateConceptMatrix({
        ledger: legacyLedger,
        manifest: manifest([['WG-DOC-001']]),
      }),
    /concept matrix header must exactly equal/
  );
});

test('CLI validates files and emits semantic extraction summaries', () => {
  const directory = mkdtempSync(join(tmpdir(), 'editor-audit-matrix-'));
  const ledgerPath = join(directory, 'matrix.md');
  const manifestPath = join(directory, 'manifest.json');

  try {
    writeFileSync(ledgerPath, ledger(row('WG-DOC-001')));
    writeFileSync(manifestPath, JSON.stringify(manifest([['WG-DOC-001']])));

    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(
          new URL('./validate-concept-matrix.mjs', import.meta.url)
        ),
        '--manifest',
        manifestPath,
        '--ledger',
        ledgerPath,
      ],
      { encoding: 'utf8' }
    );

    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.deepEqual(output.referenceAdaptations.adapt, {
      count: 1,
      ids: ['WG-DOC-001'],
    });
    assert.deepEqual(output.localDebt.material, {
      count: 1,
      ids: ['WG-DOC-001'],
    });
    assert.equal(output.integrity.missingPriorCandidates, 0);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
