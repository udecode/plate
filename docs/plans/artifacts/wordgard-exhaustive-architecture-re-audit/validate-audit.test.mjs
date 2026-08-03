import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildInventoryIndex,
  deriveEffectiveComparison,
  normalizeQualitativeClaim,
  validateArtifactGraph,
  validateContractEvidenceProvenance,
  validateDimensionTruth,
  validateExactContract,
  validateForumClosure,
  validateMappingGraph,
  validateNamespaceBundleProbe,
  validateProbeSet,
  validatePublishedPackageProbe,
  validatePublicContractProbe,
  validatePriorCandidates,
  validateProfileAssignments,
  validateRegistryFreshness,
  validateReportSummary,
  validateRuntimeApiBundleProbe,
  validateStatePurityProbe,
  validateValuePurityProbe,
} from './validate-audit.mjs';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(artifactRoot, '../../../..');
const wordgardRoot = resolve(repositoryRoot, '../wordgard');
const readArtifact = (name) =>
  JSON.parse(readFileSync(resolve(artifactRoot, name), 'utf8'));
const clone = (value) => structuredClone(value);
const currentProbeSet = () => {
  const manifest = readArtifact('concept-manifest.json');
  return {
    authority: manifest.authority,
    runtimeApiBundle: readArtifact('runtime-api-bundle-probe.json'),
    wordgardNamespaceBundle: readArtifact(
      'wordgard-namespace-bundle-probe.json'
    ),
    wordgardPublishedPackage: readArtifact(
      'wordgard-published-package-probe.json'
    ),
    wordgardPublicContract: readArtifact('wordgard-public-contract-probe.json'),
    wordgardStatePurity: readArtifact('wordgard-state-purity-probe.json'),
    wordgardValuePurity: readArtifact('wordgard-value-purity-probe.json'),
  };
};
const forumManifestFor = (coverage) => ({
  concepts: [
    ...coverage.mappings.existingMatrixRows.map(({ rowId }) => rowId),
    ...coverage.mappings.proposedMatrixRows.map(({ id }) => id),
  ].map((id) => ({ id })),
});

const withFixture = (run) => {
  const base = mkdtempSync(join(tmpdir(), 'wordgard-audit-validator-'));
  const root = join(base, 'plate-2');
  mkdirSync(root, { recursive: true });
  const write = (path, value = 'one\ntwo\nthree\n') => {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, value);
    return target;
  };
  try {
    return run({ root, write });
  } finally {
    rmSync(base, { force: true, recursive: true });
  }
};

const contextFor = (root) => ({ lineCounts: new Map(), root });
const citation = (path) => `${path}:1-2`;
const concept = (id = 'TEST-001', title = 'Atomic command routing') => ({
  id,
  title,
});
const dimensionNames = [
  'correctness',
  'api',
  'data',
  'ownership',
  'runtime',
  'proof',
];
const directComparisonConcept = ({
  evidenceKeys = ['plate.covers'],
  evidenceSelection = 'explicit',
  evidenceStatus = 'direct',
  target = 'correctness',
  winner = 'Plate stronger',
  write,
}) => {
  const contracts = Object.fromEntries(
    ['wordgard', 'plite', 'plate'].map((side) => {
      write(`${side}.ts`);
      write(`${side}.test.ts`);
      return [
        side,
        {
          covers: [citation(`${side}.ts`)],
          evidenceProvenance: { covers: 'direct', proof: 'direct' },
          missing: 'A bounded behavior remains deliberately unsupported here',
          proof: [citation(`${side}.test.ts`)],
          status: 'partial',
        },
      ];
    })
  );
  const evidenceFor = (keys) => [
    ...new Set(
      keys.flatMap((key) => {
        const [side, facet] = key.split('.');
        return contracts[side][facet];
      })
    ),
  ];
  const effective = deriveEffectiveComparison([winner]);
  return {
    ...concept(),
    contracts,
    decision: {
      classification: effective.classification,
      preferredBase: effective.preferred,
    },
    dimensions: Object.fromEntries(
      dimensionNames.map((dimension) => {
        const selected = dimension === target;
        const keys = selected ? evidenceKeys : [];
        return [
          dimension,
          {
            claim: `Specific ${dimension} behavior has independently verified consequences`,
            evidence: evidenceFor(keys),
            evidenceKeys: keys,
            evidenceSelection: selected ? evidenceSelection : 'explicit',
            evidenceStatus: selected ? evidenceStatus : 'coverage-only',
            winner: selected ? winner : 'insufficient evidence',
          },
        ];
      })
    ),
  };
};

test('normalization removes row identity, title, citations, and punctuation', () => {
  const owner = concept();
  const left = normalizeQualitativeClaim(
    'TEST-001: Atomic command routing — keeps owner proof; `src/a.ts:1-2`.',
    owner
  );
  const right = normalizeQualitativeClaim(
    'keeps owner proof [source](src/a.ts#owner)',
    owner
  );
  assert.equal(left, right);
});

test('rejects a canned six-dimension qualitative profile', () =>
  withFixture(({ root, write }) => {
    const dimensions = [
      'correctness',
      'api',
      'data',
      'ownership',
      'runtime',
      'proof',
    ];
    const make = (id, prefix) => ({
      ...concept(id, `${prefix} architecture`),
      dimensions: Object.fromEntries(
        dimensions.map((dimension) => {
          const path = `${prefix}/${dimension}.ts`;
          write(path);
          return [
            dimension,
            {
              claim: `Independent ${dimension} invariant remains stronger here`,
              evidence: [],
              evidenceKeys: [],
              evidenceSelection: 'explicit',
              evidenceStatus: 'coverage-only',
              winner: 'insufficient evidence',
            },
          ];
        })
      ),
    });
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [make('TEST-001', 'first'), make('TEST-002', 'second')],
          context: contextFor(root),
        }),
      /templated qualitative profile/
    );
  }));

test('accepts one truthful evidence set reused across distinct dimension claims', () =>
  withFixture(({ root, write }) => {
    write('shared.ts');
    const dimensions = [
      'correctness',
      'api',
      'data',
      'ownership',
      'runtime',
      'proof',
    ];
    const owner = {
      ...concept(),
      dimensions: Object.fromEntries(
        dimensions.map((dimension) => [
          dimension,
          {
            claim: `Specific ${dimension} behavior has independent consequences`,
            evidence: [],
            evidenceKeys: [],
            evidenceSelection: 'explicit',
            evidenceStatus: 'coverage-only',
            winner: 'insufficient evidence',
          },
        ])
      ),
    };
    assert.doesNotThrow(() =>
      validateDimensionTruth({
        concepts: [owner],
        context: contextFor(root),
      })
    );
  }));

test('rejects a winner backed only by another side evidence', () =>
  withFixture(({ root, write }) => {
    const owner = directComparisonConcept({
      evidenceKeys: ['plate.covers'],
      winner: 'Plite stronger',
      write,
    });
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [owner],
          context: contextFor(root),
        }),
      /no direct plite winning-side evidence/
    );
  }));

test('accepts one explicit direct dimension winner with compatible overall truth', () =>
  withFixture(({ root, write }) => {
    assert.doesNotThrow(() =>
      validateDimensionTruth({
        concepts: [directComparisonConcept({ write })],
        context: contextFor(root),
      })
    );
  }));

test('rejects a coverage-only effective winner', () =>
  withFixture(({ root, write }) => {
    const owner = directComparisonConcept({
      evidenceStatus: 'coverage-only',
      write,
    });
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [owner],
          context: contextFor(root),
        }),
      /coverage-only effective winner/
    );
  }));

test('rejects an automatic effective winner', () =>
  withFixture(({ root, write }) => {
    const owner = directComparisonConcept({
      evidenceSelection: 'automatic',
      write,
    });
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [owner],
          context: contextFor(root),
        }),
      /does not explicitly select evidence/
    );
  }));

test('rejects direct status on an explicit empty-key insufficient dimension', () =>
  withFixture(({ root, write }) => {
    const owner = directComparisonConcept({ write });
    owner.dimensions.api.evidenceStatus = 'direct';
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [owner],
          context: contextFor(root),
        }),
      /evidenceStatus contradicts selected facets/
    );
  }));

test('rejects missing and duplicate per-dimension evidence keys', () =>
  withFixture(({ root, write }) => {
    const missing = directComparisonConcept({ write });
    delete missing.dimensions.correctness.evidenceKeys;
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [missing],
          context: contextFor(root),
        }),
      /evidenceKeys must be an intentional array/
    );

    const duplicate = directComparisonConcept({ write });
    duplicate.dimensions.correctness.evidenceKeys = [
      'plate.covers',
      'plate.covers',
    ];
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [duplicate],
          context: contextFor(root),
        }),
      /evidenceKeys repeats a key/
    );
  }));

test('rejects tradeoff truth backed by only one direct side', () =>
  withFixture(({ root, write }) => {
    const owner = directComparisonConcept({
      winner: 'different tradeoff',
      write,
    });
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [owner],
          context: contextFor(root),
        }),
      /fewer than two direct sides/
    );
  }));

test('rejects a runtime winner without direct comparable-side proof', () =>
  withFixture(({ root, write }) => {
    const owner = directComparisonConcept({ target: 'runtime', write });
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [owner],
          context: contextFor(root),
        }),
      /runtime winner lacks direct comparable-side proof/
    );
  }));

test('rejects classification and preferred-base truth unsupported by direct dimensions', () =>
  withFixture(({ root, write }) => {
    const wrongClassification = directComparisonConcept({ write });
    wrongClassification.decision.classification = 'Plite stronger';
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [wrongClassification],
          context: contextFor(root),
        }),
      /decision\.classification is unsupported/
    );

    const wrongPreferred = directComparisonConcept({ write });
    wrongPreferred.decision.preferredBase = 'Plite';
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [wrongPreferred],
          context: contextFor(root),
        }),
      /decision\.preferredBase is unsupported/
    );
  }));

test('classifies mixed direct Plate and Plite votes as the local stack', () =>
  withFixture(({ root, write }) => {
    const owner = directComparisonConcept({ write });
    owner.dimensions.api = {
      claim:
        'Specific API behavior favors the independently verified substrate owner',
      evidence: [citation('plite.ts')],
      evidenceKeys: ['plite.covers'],
      evidenceSelection: 'explicit',
      evidenceStatus: 'direct',
      winner: 'Plite stronger',
    };
    owner.decision = {
      classification: 'different tradeoff',
      preferredBase: 'different tradeoff',
    };
    assert.throws(
      () =>
        validateDimensionTruth({
          concepts: [owner],
          context: contextFor(root),
        }),
      /decision\.classification is unsupported/
    );
    owner.decision = {
      classification: 'Plite/Plate stack stronger',
      preferredBase: 'Plite/Plate stack',
    };
    assert.doesNotThrow(() =>
      validateDimensionTruth({
        concepts: [owner],
        context: contextFor(root),
      })
    );
  }));

test('rejects closure inventory promoted to direct contract evidence', () =>
  withFixture(({ root, write }) => {
    const path =
      'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json';
    write(path);
    assert.throws(
      () =>
        validateContractEvidenceProvenance({
          concept: concept(),
          context: contextFor(root),
          contract: {
            evidence: [citation(path)],
            evidenceProvenance: { evidence: 'direct' },
            reason: 'No source mapping exists for this bounded comparison side',
            status: 'absent',
          },
          side: 'plate',
        }),
      /promotes closure-only inventory evidence to direct/
    );
  }));

test('rejects duplicate semantic and winner profile source assignments', () => {
  assert.throws(
    () =>
      validateProfileAssignments(`
        const values = {
          'TEST-001': semantic('first'),
          'TEST-001': semantic('second'),
        };
      `),
    /duplicate semantic profile assignments: TEST-001/
  );
  assert.throws(
    () =>
      validateProfileAssignments(`
        assignWinners('pppppp', ['TEST-001']);
        setWinnerProfile('TEST-001', winners);
      `),
    /duplicate winner profile assignments: TEST-001/
  );
});

test('rejects a reverse mapping edge with no inventory files', () =>
  withFixture(({ root, write }) => {
    for (const path of ['wrong.ts', 'wordgard.ts', 'plite.ts', 'plate.ts']) {
      write(path);
    }
    const partial = (path, sourceConceptIds) => ({
      covers: [citation(path)],
      evidenceProvenance: { covers: 'direct', proof: 'direct' },
      missing: 'A bounded behavior remains deliberately unsupported',
      proof: [citation(path)],
      sourceConceptIds,
      status: 'partial',
    });
    const row = {
      ...concept(),
      contracts: {
        plate: partial('plate.ts', ['PLATE-SOURCE']),
        plite: partial('plite.ts', ['PLITE-SOURCE']),
        wordgard: partial('wrong.ts', ['WG-SOURCE']),
      },
      dimensions: {},
    };
    const inventory = {
      filesBySource: {
        plate: new Map([['PLATE-SOURCE', new Set([join(root, 'plate.ts')])]]),
        plite: new Map([['PLITE-SOURCE', new Set([join(root, 'plite.ts')])]]),
        wordgard: new Map([['WG-SOURCE', new Set()]]),
      },
      metadata: new Map(),
      sourceIds: {
        plate: ['PLATE-SOURCE'],
        plite: ['PLITE-SOURCE'],
        wordgard: ['WG-SOURCE'],
      },
    };
    assert.throws(
      () =>
        validateMappingGraph({
          concepts: [row],
          context: contextFor(root),
          inventory,
          sourceMappings: {
            plate: { 'PLATE-SOURCE': ['TEST-001'] },
            plite: { 'PLITE-SOURCE': ['TEST-001'] },
            wordgard: { 'WG-SOURCE': ['TEST-001'] },
          },
        }),
      /has no inventory files/
    );
  }));

test('accepts only absent forum proposals as source-unmapped provenance', () =>
  withFixture(({ root, write }) => {
    for (const side of ['plate', 'plite', 'wordgard']) write(`${side}.md`);
    const absent = (side) => ({
      evidence: [citation(`${side}.md`)],
      evidenceProvenance: { evidence: 'coverage-only' },
      reason: 'No implementation exists for this forum-only requirement',
      sourceConceptIds: [],
      status: 'absent',
    });
    const args = {
      concepts: [
        {
          ...concept(),
          contracts: Object.fromEntries(
            ['plate', 'plite', 'wordgard'].map((side) => [side, absent(side)])
          ),
          dimensions: {},
        },
      ],
      context: contextFor(root),
      forumCoverage: {
        mappings: { proposedMatrixRows: [{ id: 'TEST-001' }] },
      },
      inventory: {
        filesBySource: {
          plate: new Map(),
          plite: new Map(),
          wordgard: new Map(),
        },
        metadata: new Map(),
        sourceIds: { plate: [], plite: [], wordgard: [] },
      },
      sourceMappings: { plate: {}, plite: {}, wordgard: {} },
    };
    assert.doesNotThrow(() => validateMappingGraph(args));
    assert.throws(
      () => validateMappingGraph({ ...args, forumCoverage: undefined }),
      /union source provenance mismatch/
    );
  }));

test('treats audited Wordgard meta tooling as owner evidence only for meta concepts', () =>
  withFixture(({ root }) => {
    const localWordgardRoot = resolve(root, '../wordgard');
    const inventory = buildInventoryIndex({
      plate: { conceptIds: [], files: [] },
      plite: { concepts: {}, entries: [] },
      root,
      siteRoot: resolve(root, '../wordgard-website'),
      wordgard: {
        concepts: [{ id: 'WG-DOC-001' }, { id: 'WG-META-002' }],
        files: [
          {
            category: 'tooling',
            conceptIds: ['WG-META-002'],
            path: 'bin/packages.ts',
          },
          {
            category: 'tooling',
            conceptIds: ['WG-DOC-001'],
            path: 'bin/unrelated.ts',
          },
        ],
      },
      wordgardRaw: {
        files: [
          { declarations: [], path: 'bin/packages.ts' },
          { declarations: [], path: 'bin/unrelated.ts' },
        ],
      },
      wordgardRoot: localWordgardRoot,
      wordgardSite: { concepts: [], files: [] },
    });
    assert.equal(
      inventory.metadata.get(resolve(localWordgardRoot, 'bin/packages.ts'))
        .owner,
      true
    );
    assert.equal(
      inventory.metadata.get(resolve(localWordgardRoot, 'bin/unrelated.ts'))
        .owner,
      false
    );
  }));

test('rejects circular prior evidence from the current audit', () =>
  withFixture(({ root }) => {
    assert.throws(
      () =>
        validatePriorCandidates({
          candidates: [
            {
              conceptIds: ['TEST-001'],
              disposition: 'supersede',
              id: 'PRIOR-001',
              provenance: {
                lineEnd: 2,
                lineStart: 1,
                path: 'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/audit-report.md',
                sha256: 'a'.repeat(64),
              },
            },
          ],
          concepts: [{ id: 'TEST-001', priorCandidateIds: ['PRIOR-001'] }],
          root,
        }),
      /circular current-audit evidence/
    );
  }));

test('rejects a stale registry publication timestamp', () => {
  const manifest = {
    authority: { wordgardHead: 'source', wordgardSiteHead: 'site' },
    generatedAt: '2026-08-01T12:00:00.000Z',
  };
  const registry = {
    audits: [
      {
        artifact:
          'docs/plans/2026-08-01-wordgard-exhaustive-architecture-re-audit.md',
        artifactVersion: 4,
        id: 'wordgard-exhaustive-symmetric-2026-08-01',
        references: [
          {
            auditedAt: '2026-08-01T11:00:00.000Z',
            auditedCommit: 'source',
            conceptManifest:
              'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/concept-manifest.json',
            conceptMatrix:
              'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/concept-matrix.md',
            conceptMatrixValidatedAt: '2026-08-01T11:00:00.000Z',
          },
          { auditedAt: '2026-08-01T11:00:00.000Z', auditedCommit: 'site' },
        ],
        validationReceipt:
          'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/validation-receipt.json',
      },
    ],
  };
  assert.throws(
    () => validateRegistryFreshness({ manifest, registry }),
    /predates manifest/
  );
});

const closedForumFixture = () => ({
  coverage: {
    claims: [
      {
        existingRowIds: ['TEST-001'],
        id: 'CLAIM-001',
        implementationProof: false,
        postId: 1,
        proposedRowIds: [],
      },
    ],
    completeness: {
      anonymousInaccessibleGap: { posts: 1, topics: 1 },
      instancePostCount: 2,
      instanceTopicCount: 2,
      publicTopicCount: 1,
      unexplainedVisibleCorpus: { posts: 0, topics: 0 },
      visiblePostCount: 1,
    },
    corpus: { publicCorpusHash: 'a'.repeat(64) },
    excludedPosts: [],
    mappings: {
      existingMatrixRows: [{ claimIds: ['CLAIM-001'], rowId: 'TEST-001' }],
      proposedMatrixRows: [],
    },
    validation: { allVisiblePostsExplained: true, unknownRowIds: [] },
  },
  inventory: {
    authority: { publicCorpusHash: 'a'.repeat(64) },
    completeness: {
      anonymousInaccessibleGap: { posts: 1, topics: 1 },
      instancePostCount: 2,
      instanceTopicCount: 2,
      publicTopicCount: 1,
      unexplainedVisibleCorpus: { posts: 0, topics: 0 },
      visiblePostCount: 1,
    },
    topics: [{ posts: [{ id: 1 }] }],
    validation: { allVisiblePostsExplained: true, unknownRowIds: [] },
  },
  manifest: { concepts: [{ id: 'TEST-001' }] },
});

test('rejects a forum corpus hash mismatch', () => {
  const fixture = closedForumFixture();
  fixture.coverage.corpus.publicCorpusHash = 'b'.repeat(64);
  assert.throws(
    () => validateForumClosure(fixture),
    /public-corpus hash drift/
  );
});

test('rejects forum intent promoted to implementation proof', () => {
  const fixture = closedForumFixture();
  fixture.coverage.claims[0].implementationProof = true;
  assert.throws(
    () => validateForumClosure(fixture),
    /promoted to implementation proof/
  );
});

test('rejects stale forum row mappings', () => {
  const fixture = closedForumFixture();
  fixture.coverage.claims[0].existingRowIds = ['STALE-ROW'];
  assert.throws(() => validateForumClosure(fixture), /cites unknown row/);
});

test('rejects published-package integrity drift', () => {
  assert.throws(
    () =>
      validatePublishedPackageProbe({
        entries: [
          {
            declarationExists: true,
            importError: null,
            runtimeExists: true,
          },
        ],
        pack: { entryCount: 1, fileCount: 1, files: [{}] },
        package: {
          integrity: 'one',
          npmIntegrity: 'two',
          spec: 'wordgard@0.3.1',
          version: '0.3.1',
        },
        validation: { importFailures: [] },
      }),
    /integrity drift/
  );
});

test('rejects the formerly accepted empty published-package spoof', () => {
  assert.throws(
    () =>
      validatePublishedPackageProbe({
        entries: [
          {
            declarationExists: 'yes',
            importError: '',
            runtimeExists: 1,
          },
        ],
        generatedAt: '2026-08-01T00:00:00.000Z',
        kind: 'wordgard-published-package-contract',
        pack: { entryCount: 0, fileCount: 0, files: [] },
        package: { spec: 'wordgard@undefined' },
        schemaVersion: 1,
      }),
    /validation is missing/
  );
});

test('accepts the complete semantically validated non-matrix probe set', () => {
  assert.doesNotThrow(() =>
    validateProbeSet({
      ...currentProbeSet(),
      root: repositoryRoot,
      wordgardRoot,
    })
  );
});

test('rejects every omitted non-matrix probe', () => {
  for (const key of [
    'runtimeApiBundle',
    'wordgardNamespaceBundle',
    'wordgardPublishedPackage',
    'wordgardPublicContract',
    'wordgardStatePurity',
    'wordgardValuePurity',
  ]) {
    const fixture = currentProbeSet();
    fixture[key] = undefined;
    assert.throws(() => validateProbeSet(fixture), undefined, key);
  }
});

test('rejects runtime API target and source-size mutations', () => {
  const { authority, runtimeApiBundle } = currentProbeSet();
  const missingTarget = clone(runtimeApiBundle);
  missingTarget.results = missingTarget.results.filter(
    ({ id }) => id !== 'NodeApi.isText'
  );
  assert.throws(
    () =>
      validateRuntimeApiBundleProbe({
        expectedPlateHead: authority.plateHead,
        probe: missingTarget,
        root: repositoryRoot,
      }),
    /targets mismatch/
  );

  const spoofedSize = clone(runtimeApiBundle);
  spoofedSize.results[0].sourceBytes += 1;
  assert.throws(
    () =>
      validateRuntimeApiBundleProbe({
        expectedPlateHead: authority.plateHead,
        probe: spoofedSize,
        root: repositoryRoot,
      }),
    /source-size drift/
  );
});

test('rejects namespace sentinel-name and public-summary mutations', () => {
  const { authority, wordgardNamespaceBundle, wordgardPublicContract } =
    currentProbeSet();
  const renamedSentinel = clone(wordgardNamespaceBundle);
  const sentinels = renamedSentinel.results[0].rolldown.siblingSentinels;
  sentinels.fakeHeading = sentinels.heading_1;
  delete sentinels.heading_1;
  assert.throws(
    () =>
      validateNamespaceBundleProbe({
        expectedWordgardHead: authority.wordgardHead,
        probe: renamedSentinel,
        wordgardRoot,
      }),
    /sentinel keys/
  );

  const falsePositiveSentinel = clone(wordgardNamespaceBundle);
  falsePositiveSentinel.results.find(
    ({ id }) => id === 'imageResizing.keyBindings'
  ).rolldown.siblingSentinels.selectedImage = true;
  assert.throws(
    () =>
      validateNamespaceBundleProbe({
        expectedWordgardHead: authority.wordgardHead,
        probe: falsePositiveSentinel,
        wordgardRoot,
      }),
    /sentinel values/
  );

  const staleSummary = clone(wordgardPublicContract);
  staleSummary.sourceMapsAndTreeShaking.namespaceProbe.siblingRetention[0].rolldown.heading_1 = false;
  assert.throws(
    () =>
      validatePublicContractProbe({
        expectedWordgardHead: authority.wordgardHead,
        namespaceProbe: wordgardNamespaceBundle,
        probe: staleSummary,
      }),
    /namespace probe summary/
  );
});

test('rejects value-purity cached-length and arbitrary-mark mutations', () => {
  const { authority, wordgardValuePurity } = currentProbeSet();
  const invalidLength = clone(wordgardValuePurity);
  invalidLength.plotInputAliasing.after.contentLength = 999;
  assert.throws(
    () =>
      validateValuePurityProbe({
        expectedWordgardHead: authority.wordgardHead,
        probe: invalidLength,
      }),
    /plot cached-length/
  );

  const arbitraryMark = clone(wordgardValuePurity);
  arbitraryMark.markSetInputAliasing.after.json = {
    marks: { Fake: null },
    param: 'different',
    type: 'Other',
  };
  assert.throws(
    () =>
      validateValuePurityProbe({
        expectedWordgardHead: authority.wordgardHead,
        probe: arbitraryMark,
      }),
    /mark-set aliasing/
  );
});

test('rejects state-purity conclusion mutations', () => {
  const { authority, wordgardStatePurity } = currentProbeSet();
  const collab = clone(wordgardStatePurity);
  collab.collab.observationallyPure = true;
  assert.throws(
    () =>
      validateStatePurityProbe({
        expectedWordgardHead: authority.wordgardHead,
        probe: collab,
      }),
    /collab purity/
  );

  const history = clone(wordgardStatePurity);
  delete history.history.branchIdentityPreserved;
  assert.throws(
    () =>
      validateStatePurityProbe({
        expectedWordgardHead: authority.wordgardHead,
        probe: history,
      }),
    /history identity/
  );
});

test('rejects public-contract pack and parity mutations', () => {
  const { authority, wordgardNamespaceBundle, wordgardPublicContract } =
    currentProbeSet();
  const missingTarget = clone(wordgardPublicContract);
  missingTarget.currentBuildAndPack.cleanPack.exportTargetsMissingFromPack.pop();
  assert.throws(
    () =>
      validatePublicContractProbe({
        expectedWordgardHead: authority.wordgardHead,
        namespaceProbe: wordgardNamespaceBundle,
        probe: missingTarget,
      }),
    /clean-pack missing export targets/
  );

  const falseParity = clone(wordgardPublicContract);
  falseParity.publicSurface.emittedDeclarationRuntime.moduleResults[0].topLevelEqual = false;
  assert.throws(
    () =>
      validatePublicContractProbe({
        expectedWordgardHead: authority.wordgardHead,
        namespaceProbe: wordgardNamespaceBundle,
        probe: falseParity,
      }),
    /declaration\/runtime parity drift/
  );

  const understatedMissingValues = clone(wordgardPublicContract);
  understatedMissingValues.publicSurface.emittedDeclarationRuntime.missingValues.push(
    'state.Transaction.anotherMissingValue'
  );
  assert.throws(
    () =>
      validatePublicContractProbe({
        expectedWordgardHead: authority.wordgardHead,
        namespaceProbe: wordgardNamespaceBundle,
        probe: understatedMissingValues,
      }),
    /missing runtime values mismatch/
  );

  const fakeFindingImpact = clone(wordgardPublicContract);
  fakeFindingImpact.findings[0].impacts = ['FAKE'];
  assert.throws(
    () =>
      validatePublicContractProbe({
        expectedWordgardHead: authority.wordgardHead,
        namespaceProbe: wordgardNamespaceBundle,
        probe: fakeFindingImpact,
      }),
    /finding semantics drift/
  );

  const extraUnresolvedExport = clone(wordgardPublicContract);
  extraUnresolvedExport.publicSurface.unresolvedCurrentIndexExports.push(
    'schema.anotherMissingExport'
  );
  assert.throws(
    () =>
      validatePublicContractProbe({
        expectedWordgardHead: authority.wordgardHead,
        namespaceProbe: wordgardNamespaceBundle,
        probe: extraUnresolvedExport,
      }),
    /unresolved current exports mismatch/
  );

  const understatedStaleHistory = clone(wordgardPublicContract);
  understatedStaleHistory.distProvenance.changedCommitsAfterSnapshot = [
    understatedStaleHistory.distProvenance.changedCommitsAfterSnapshot.at(-1),
  ];
  assert.throws(
    () =>
      validatePublicContractProbe({
        expectedWordgardHead: authority.wordgardHead,
        namespaceProbe: wordgardNamespaceBundle,
        probe: understatedStaleHistory,
      }),
    /stale-dist provenance/
  );
});

test('rejects published-package structural mutations', () => {
  const { wordgardPublishedPackage, wordgardPublicContract } =
    currentProbeSet();
  const duplicatePath = clone(wordgardPublishedPackage);
  duplicatePath.pack.files[1].path = duplicatePath.pack.files[0].path;
  assert.throws(
    () => validatePublishedPackageProbe(duplicatePath, wordgardPublicContract),
    /files contains duplicates/
  );

  const wrongSize = clone(wordgardPublishedPackage);
  wrongSize.pack.files[0].size += 1;
  assert.throws(
    () => validatePublishedPackageProbe(wrongSize, wordgardPublicContract),
    /file inventory is invalid/
  );

  const absentTarget = clone(wordgardPublishedPackage);
  absentTarget.entries[0].runtimePath = 'dist/missing.js';
  assert.throws(
    () => validatePublishedPackageProbe(absentTarget, wordgardPublicContract),
    /entrypoint is invalid/
  );

  const fakeExports = clone(wordgardPublishedPackage);
  fakeExports.entries.find(
    ({ subpath }) => subpath === './doc'
  ).runtimeExports = ['Fake'];
  assert.throws(
    () => validatePublishedPackageProbe(fakeExports, wordgardPublicContract),
    /published\/current exports/
  );

  const invalidIntegrity = clone(wordgardPublishedPackage);
  invalidIntegrity.package.integrity = 'sha512-A';
  invalidIntegrity.package.npmIntegrity = 'sha512-A';
  assert.throws(
    () => validatePublishedPackageProbe(invalidIntegrity),
    /provenance is invalid/
  );

  const invalidVersion = clone(wordgardPublishedPackage);
  invalidVersion.package.version = '0.3.1evil';
  invalidVersion.package.spec = 'wordgard@0.3.1evil';
  invalidVersion.package.npmTarball =
    'https://registry.npmjs.org/wordgard/-/wordgard-0.3.1evil.tgz';
  assert.throws(
    () => validatePublishedPackageProbe(invalidVersion),
    /provenance is invalid/
  );
});

test('rejects a matching but non-derived forum corpus hash', () => {
  const coverage = readArtifact('wordgard-forum-coverage.json');
  const fixture = {
    coverage,
    inventory: readArtifact('wordgard-forum-inventory.json'),
    manifest: forumManifestFor(coverage),
  };
  fixture.coverage.corpus.publicCorpusHash = 'b'.repeat(64);
  fixture.inventory.authority.publicCorpusHash = 'b'.repeat(64);
  assert.throws(
    () => validateForumClosure(fixture),
    /not derived from visible posts/
  );
});

test('rejects forum post-to-claim drift', () => {
  const coverage = readArtifact('wordgard-forum-coverage.json');
  const fixture = {
    coverage,
    inventory: readArtifact('wordgard-forum-inventory.json'),
    manifest: forumManifestFor(coverage),
  };
  const materialPost = fixture.inventory.topics
    .flatMap(({ posts }) => posts)
    .find(({ claimIds }) => claimIds.length > 0);
  materialPost.claimIds = [];
  assert.throws(() => validateForumClosure(fixture), /claim coverage mismatch/);
});

test('rejects broken Markdown paths and anchors', () =>
  withFixture(({ root, write }) => {
    write('docs/a.md', '[missing](b.md#owner)\n');
    assert.throws(
      () =>
        validateArtifactGraph({
          markdownArtifacts: [
            {
              path: 'docs/a.md',
              text: '[missing](b.md#owner)\n',
            },
          ],
          root,
        }),
      /broken link/
    );
  }));

test('rejects a report without the exact machine summary', () => {
  const decision = {
    classification: 'Plite stronger',
    localDebt: 'material',
    preferredBase: 'Plite',
    priority: 'P0',
    proofAdaptation: 'keep-local',
    referenceAdaptation: 'adapt',
    verdict: 'rearchitect',
  };
  const summaryGroups = {
    classification: { 'Plite stronger': ['TEST-001'] },
    deferredIds: [],
    localDebt: { material: ['TEST-001'] },
    materialIds: ['TEST-001'],
    origin: { reference: ['TEST-001'] },
    preferred: { Plite: ['TEST-001'] },
    priorDisposition: {},
    priority: { P0: ['TEST-001'] },
    proofAdaptation: { 'keep-local': ['TEST-001'] },
    referenceAdaptation: { adapt: ['TEST-001'] },
    verdict: { rearchitect: ['TEST-001'] },
  };
  assert.throws(
    () =>
      validateReportSummary({
        dossiers: '## Owner (`TEST-001`)\n',
        manifest: {
          concepts: [{ decision, id: 'TEST-001', origin: 'reference' }],
          priorCandidates: [],
          summaryGroups,
        },
        report: '# Report\n',
      }),
    /lacks machine summary block/
  );
});

test('accepts narrowly justified owner/lifecycle reuse with independent public, consumer, and proof', () =>
  withFixture(({ root, write }) => {
    const paths = {
      consumer: write('app/consumer.ts'),
      owner: write('src/owner.ts'),
      proof: write('test/owner.test.ts'),
      public: write('src/index.ts'),
    };
    const metadata = new Map([
      [paths.consumer, { consumer: true }],
      [paths.owner, { owner: true }],
      [paths.proof, { proof: true }],
      [paths.public, { entrypoint: true, public: true }],
    ]);
    assert.doesNotThrow(() =>
      validateExactContract({
        concept: concept(),
        context: contextFor(root),
        contract: {
          consumers: [citation('app/consumer.ts')],
          evidenceProvenance: {
            consumers: 'direct',
            lifecycle: 'direct',
            owner: 'direct',
            proof: 'direct',
            public: 'direct',
          },
          facetReuseJustification: [
            {
              facets: ['owner', 'lifecycle'],
              reason:
                'The immutable value activates in the same narrowly scoped source owner.',
            },
          ],
          lifecycle: [citation('src/owner.ts')],
          owner: [citation('src/owner.ts')],
          proof: [citation('test/owner.test.ts')],
          public: [citation('src/index.ts')],
          sourceConceptIds: ['SOURCE-001'],
          status: 'exact',
        },
        inventory: { metadata },
        side: 'plite',
      })
    );
  }));

test('prior provenance digest covers the exact normalized line slice', () =>
  withFixture(({ root, write }) => {
    const text = 'before\naccepted law\nafter\n';
    write('docs/plans/prior.md', text);
    const digest = createHash('sha256').update('accepted law').digest('hex');
    assert.doesNotThrow(() =>
      validatePriorCandidates({
        candidates: [
          {
            conceptIds: ['TEST-001'],
            disposition: 'reaffirm',
            id: 'PRIOR-001',
            provenance: {
              lineEnd: 2,
              lineStart: 2,
              path: 'docs/plans/prior.md',
              sha256: digest,
            },
          },
        ],
        concepts: [{ id: 'TEST-001', priorCandidateIds: ['PRIOR-001'] }],
        root,
      })
    );
  }));

test('accepts locked provenance from the two audited sibling repositories', () =>
  withFixture(({ root }) => {
    const candidates = ['wordgard', 'wordgard-website'].map(
      (repository, index) => {
        const sourcePath = join(root, `../${repository}/prior.md`);
        mkdirSync(dirname(sourcePath), { recursive: true });
        writeFileSync(sourcePath, 'accepted sibling law\n');
        return {
          conceptIds: ['TEST-001'],
          disposition: 'reaffirm',
          id: `PRIOR-SIBLING-${index}`,
          provenance: {
            lineEnd: 1,
            lineStart: 1,
            path: `../${repository}/prior.md`,
            sha256: createHash('sha256')
              .update('accepted sibling law')
              .digest('hex'),
          },
        };
      }
    );
    assert.doesNotThrow(() =>
      validatePriorCandidates({
        candidates,
        concepts: [
          {
            id: 'TEST-001',
            priorCandidateIds: candidates.map(({ id }) => id),
          },
        ],
        root,
      })
    );
  }));

test('rejects prior provenance that escapes all audited repositories', () =>
  withFixture(({ root }) => {
    assert.throws(
      () =>
        validatePriorCandidates({
          candidates: [
            {
              conceptIds: ['TEST-001'],
              disposition: 'reaffirm',
              id: 'PRIOR-ESCAPE',
              provenance: {
                lineEnd: 1,
                lineStart: 1,
                path: '../unrelated/prior.md',
                sha256: 'a'.repeat(64),
              },
            },
          ],
          concepts: [{ id: 'TEST-001', priorCandidateIds: ['PRIOR-ESCAPE'] }],
          root,
        }),
      /not repo-relative/
    );
  }));

test('rejects disguised sibling-root traversal and prefix lookalikes', () =>
  withFixture(({ root }) => {
    for (const path of [
      '../wordgard-website/../wordgard/private.md',
      '../wordgard/../../outside.md',
      '../wordgardish/private.md',
      '../../wordgard/private.md',
      '/absolute/private.md',
    ]) {
      assert.throws(
        () =>
          validatePriorCandidates({
            candidates: [
              {
                conceptIds: ['TEST-001'],
                disposition: 'reaffirm',
                id: 'PRIOR-TRAVERSAL',
                provenance: {
                  lineEnd: 1,
                  lineStart: 1,
                  path,
                  sha256: 'a'.repeat(64),
                },
              },
            ],
            concepts: [
              { id: 'TEST-001', priorCandidateIds: ['PRIOR-TRAVERSAL'] },
            ],
            root,
          }),
        /not repo-relative/,
        path
      );
    }
  }));
