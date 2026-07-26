import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';

import {
  classifyPackage,
  computeDoctrineFingerprint,
  computePackageFingerprint,
  getPackageStatuses,
  haveMatchingSkillSource,
  readReviewedPackageSlugs,
  readDeclaredDoctrineVersion,
  validateRegistry,
} from './version.mjs';

const temporaryRoots = [];

const createRoot = (slug = 'alpha') => {
  const root = mkdtempSync(join(tmpdir(), 'plate-next-version-'));
  const packageDirectory = join(root, 'packages', slug);

  temporaryRoots.push(root);
  mkdirSync(join(packageDirectory, 'src'), { recursive: true });
  writeFileSync(
    join(packageDirectory, 'package.json'),
    JSON.stringify({ name: `@platejs/${slug}` })
  );
  writeFileSync(
    join(packageDirectory, 'src/index.ts'),
    'export const value = 1;\n'
  );

  return root;
};

const createRegistry = (entry = {}) => ({
  latestVersion: 1,
  packages: {
    alpha: {
      appliedVersion: 0,
      evidence: null,
      fingerprint: null,
      verifiedAt: null,
      ...entry,
    },
  },
  retiredPackages: {},
  schemaVersion: 1,
  versions: [
    {
      date: null,
      migrationChecks: ['Run a full review.'],
      summary: 'Legacy enrollment.',
      version: 0,
    },
    {
      date: '2026-07-25',
      doctrineFingerprint: `sha256:${'0'.repeat(64)}`,
      migrationChecks: ['Apply the baseline.'],
      summary: 'Versioned baseline.',
      version: 1,
    },
  ],
});

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

test('reads the shared reviewed package enrollment', () => {
  const source = `
const reviewedPackageSlugs = [
  'table',
  'link',
];
`;

  assert.deepEqual(readReviewedPackageSlugs(source), ['link', 'table']);
});

test('reads the visible doctrine version and fingerprints doctrine sources', () => {
  const root = mkdtempSync(join(tmpdir(), 'plate-next-doctrine-'));

  temporaryRoots.push(root);
  mkdirSync(join(root, '.agents/rules'), { recursive: true });
  mkdirSync(join(root, 'docs/plans/templates'), { recursive: true });
  writeFileSync(
    join(root, '.agents/rules/plate-next.mdc'),
    'Current doctrine version: `3`.\n'
  );
  writeFileSync(join(root, 'docs/plans/templates/plate-next.md'), 'template\n');

  assert.equal(
    readDeclaredDoctrineVersion('Current doctrine version: `3`.\n'),
    3
  );
  assert.match(computeDoctrineFingerprint(root), /^sha256:[a-f0-9]{64}$/);
  assert.equal(
    haveMatchingSkillSource(
      "---\nargument-hint: '[sync]'\n---\n# Plate Next\nbody\n",
      "---\nargument-hint: '[sync]'\nname: plate-next\nmetadata:\n  skiller:\n    source: .agents/rules/plate-next.mdc\n---\n# Plate Next\nbody\n"
    ),
    true
  );
  assert.equal(
    haveMatchingSkillSource(
      "---\nargument-hint: '[sync]'\n---\n# Plate Next\nbody\n",
      "---\nargument-hint: '[old]'\nname: plate-next\n---\n# Plate Next\nbody\n"
    ),
    false
  );
  assert.equal(
    haveMatchingSkillSource(
      "---\nargument-hint: '[sync]'\n---\n# Plate Next\nbody\n",
      "---\nargument-hint: '[sync]'\nname: stale-name\nmetadata:\n  skiller:\n    source: .agents/rules/plate-next.mdc\n---\n# Plate Next\nbody\n"
    ),
    false
  );
});

test('validates contiguous doctrine history and exact package enrollment', () => {
  const root = createRoot();
  const registry = createRegistry();

  assert.deepEqual(
    validateRegistry({ registry, reviewedSlugs: ['alpha'], root }),
    []
  );
  assert.deepEqual(
    validateRegistry({ registry, reviewedSlugs: ['alpha', 'beta'], root }),
    ['Missing tracked packages: beta.']
  );

  registry.versions[1].version = 2;

  assert.ok(
    validateRegistry({ registry, reviewedSlugs: ['alpha'], root }).some(
      (error) => error.includes('contiguous from 0')
    )
  );
});

test('rejects an unversioned doctrine edit and stale generated skill', () => {
  const root = createRoot();
  const registry = createRegistry();
  const errors = validateRegistry({
    currentDoctrineFingerprint: `sha256:${'1'.repeat(64)}`,
    declaredVersion: 2,
    generatedSkillMatches: false,
    registry,
    reviewedSlugs: ['alpha'],
    root,
  });

  assert.ok(
    errors.some((error) => error.includes('does not match latestVersion'))
  );
  assert.ok(
    errors.some((error) => error.includes('bump the doctrine version'))
  );
  assert.ok(
    errors.some((error) => error.includes('Generated Plate Next skill'))
  );
});

test('reports malformed version history without throwing', () => {
  const root = createRoot();
  const registry = createRegistry();

  registry.versions = null;

  assert.doesNotThrow(() =>
    validateRegistry({
      currentDoctrineFingerprint: `sha256:${'1'.repeat(64)}`,
      declaredVersion: 1,
      generatedSkillMatches: true,
      registry,
      reviewedSlugs: ['alpha'],
      root,
    })
  );
  assert.ok(
    validateRegistry({
      registry,
      reviewedSlugs: ['alpha'],
      root,
    }).includes('versions must be an array.')
  );
});

test('keeps retired packages in history but out of the active enrollment', () => {
  const root = createRoot();
  const registry = createRegistry();

  registry.retiredPackages.caption = {
    appliedVersion: 0,
    evidence: 'docs/plans/delete-caption.md',
    retiredAt: '2026-07-23',
  };

  assert.deepEqual(
    validateRegistry({ registry, reviewedSlugs: ['alpha'], root }),
    []
  );
  assert.equal(
    getPackageStatuses({
      registry,
      root,
      slugs: ['alpha', 'caption'],
    })[1].status,
    'retired'
  );
});

test('fingerprint ignores generated output and changes with package source', () => {
  const root = createRoot();
  const packageDirectory = join(root, 'packages/alpha');
  const before = computePackageFingerprint(root, 'alpha');

  mkdirSync(join(packageDirectory, 'dist'), { recursive: true });
  writeFileSync(join(packageDirectory, 'dist/index.js'), 'generated\n');
  writeFileSync(join(packageDirectory, 'CHANGELOG.md'), 'release noise\n');

  assert.deepEqual(computePackageFingerprint(root, 'alpha'), before);

  writeFileSync(
    join(packageDirectory, 'src/index.ts'),
    'export const value = 2;\n'
  );

  assert.notEqual(
    computePackageFingerprint(root, 'alpha').fingerprint,
    before.fingerprint
  );
});

test('classifies stale, current, and source-drifted packages', () => {
  const root = createRoot();
  const current = computePackageFingerprint(root, 'alpha');
  const registry = createRegistry({
    appliedVersion: 1,
    evidence: 'docs/plans/alpha.md',
    fingerprint: current.fingerprint,
    verifiedAt: '2026-07-25',
  });

  assert.equal(
    classifyPackage({
      currentFingerprint: null,
      entry: { appliedVersion: 0, fingerprint: null },
      latestVersion: 1,
    }).status,
    'stale'
  );
  assert.equal(
    getPackageStatuses({ registry, root, slugs: ['alpha'] })[0].status,
    'current'
  );

  writeFileSync(
    join(root, 'packages/alpha/src/index.ts'),
    'export const value = 3;\n'
  );

  assert.equal(
    getPackageStatuses({ registry, root, slugs: ['alpha'] })[0].status,
    'drifted'
  );
});
