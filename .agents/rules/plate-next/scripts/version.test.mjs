import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';

import {
  classifyPackage,
  computeDoctrineFingerprint,
  computePackageFingerprint,
  doctrinePaths,
  getPackageStatuses,
  haveMatchingRequiredResources,
  haveMatchingRequiredSkills,
  haveMatchingSkillSource,
  requiredGeneratedResources,
  requiredGeneratedSkills,
  readReviewedPackageSlugs,
  readDeclaredDoctrineVersion,
  selectDoctrineBaseRef,
  validateRegistry,
} from './version.mjs';

const temporaryRoots = [];

const createRoot = (slug = 'alpha') => {
  const root = mkdtempSync(join(tmpdir(), 'plate-next-version-'));
  const packageDirectory = join(root, 'packages', slug);

  temporaryRoots.push(root);
  mkdirSync(join(packageDirectory, 'src'), { recursive: true });
  mkdirSync(join(root, '.agents/skills/auto/references'), { recursive: true });
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
  for (const doctrinePath of doctrinePaths) {
    const target = join(root, doctrinePath);

    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, `${doctrinePath}\n`);
  }
  const history = {
    schemaVersion: 1,
    versions: [
      {
        date: null,
        doctrineFingerprint: null,
        migrationChecks: ['legacy'],
        summary: 'legacy',
        version: 0,
      },
      {
        date: '2026-08-17',
        doctrineFingerprint: `sha256:${'1'.repeat(64)}`,
        migrationChecks: ['current'],
        summary: 'current',
        version: 3,
      },
    ],
  };

  writeFileSync(
    join(root, '.agents/rules/plate-next/versions.json'),
    JSON.stringify(history)
  );
  writeFileSync(
    join(root, '.agents/rules/plate-next.mdc'),
    'Current doctrine version: `3`.\n'
  );
  writeFileSync(
    join(root, '.agents/rules/plate-plugin-creator.mdc'),
    'plugin authoring doctrine\n'
  );
  const before = computeDoctrineFingerprint(root);

  assert.equal(
    readDeclaredDoctrineVersion('Current doctrine version: `3`.\n'),
    3
  );
  assert.match(before, /^sha256:[a-f0-9]{64}$/);
  writeFileSync(
    join(root, '.agents/rules/plate-plugin-creator.mdc'),
    'updated plugin authoring doctrine\n'
  );
  assert.notEqual(computeDoctrineFingerprint(root), before);
  writeFileSync(
    join(root, '.agents/rules/plate-plugin-creator.mdc'),
    'plugin authoring doctrine\n'
  );

  history.versions[0].summary = 'tampered legacy';
  writeFileSync(
    join(root, '.agents/rules/plate-next/versions.json'),
    JSON.stringify(history)
  );
  assert.notEqual(computeDoctrineFingerprint(root), before);

  history.versions[0].summary = 'legacy';
  history.versions[1].doctrineFingerprint = `sha256:${'2'.repeat(64)}`;
  writeFileSync(
    join(root, '.agents/rules/plate-next/versions.json'),
    JSON.stringify(history)
  );
  assert.equal(computeDoctrineFingerprint(root), before);

  history.versions[1].migrationChecks = ['tampered current'];
  writeFileSync(
    join(root, '.agents/rules/plate-next/versions.json'),
    JSON.stringify(history)
  );
  assert.notEqual(computeDoctrineFingerprint(root), before);
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
  assert.equal(
    haveMatchingSkillSource(
      "---\nargument-hint: '[sync]'\n---\n# Plate Next\nbody\n",
      "---\nargument-hint: '[sync]'\nname: plate-next\nmetadata:\n  skiller:\n    source: .agents/rules/plate-next.mdc\n---\nextra instruction\n# Plate Next\nbody\n"
    ),
    false
  );
});

test('requires exact generated doctrine resources', () => {
  const root = createRoot();
  for (const [sourcePath, generatedPath] of requiredGeneratedResources) {
    const source = join(root, sourcePath);
    const generated = join(root, generatedPath);
    const value = `${sourcePath}\n`;

    mkdirSync(join(source, '..'), { recursive: true });
    mkdirSync(join(generated, '..'), { recursive: true });
    writeFileSync(source, value);
    writeFileSync(generated, value);
  }

  assert.equal(haveMatchingRequiredResources(root), true);

  writeFileSync(
    join(root, '.agents/skills/plate-plugin-creator/rules/typing.md'),
    'stale typing law\n'
  );

  assert.equal(haveMatchingRequiredResources(root), false);

  writeFileSync(
    join(root, '.agents/skills/plate-plugin-creator/rules/typing.md'),
    '.agents/rules/plate-plugin-creator/rules/typing.md\n'
  );
  writeFileSync(
    join(root, '.agents/skills/plate-ui/rules/component-shape.md'),
    'stale component shape\n'
  );

  assert.equal(haveMatchingRequiredResources(root), false);

  writeFileSync(
    join(root, '.agents/skills/plate-ui/rules/component-shape.md'),
    '.agents/rules/plate-ui/rules/component-shape.md\n'
  );
  writeFileSync(
    join(root, '.agents/skills/plate-ui/references/component-audit.md'),
    'stale component audit\n'
  );

  assert.equal(haveMatchingRequiredResources(root), false);

  writeFileSync(
    join(root, '.agents/skills/plate-ui/references/component-audit.md'),
    '.agents/rules/plate-ui/references/component-audit.md\n'
  );
  assert.equal(haveMatchingRequiredResources(root), true);

  writeFileSync(
    join(root, '.agents/skills/auto/references/regression-methodology.md'),
    'retired resource\n'
  );

  assert.equal(haveMatchingRequiredResources(root), false);
});

test('requires exact generated doctrine skill bodies', () => {
  const root = createRoot();
  for (const {
    generatedPath,
    heading,
    name,
    sourcePath,
  } of requiredGeneratedSkills) {
    const source = join(root, sourcePath);
    const generated = join(root, generatedPath);
    const description = `${name} doctrine`;

    mkdirSync(join(source, '..'), { recursive: true });
    mkdirSync(join(generated, '..'), { recursive: true });
    writeFileSync(
      source,
      `---\ndescription: ${description}\n---\n${heading}\nbody\n`
    );
    writeFileSync(
      generated,
      `---\ndescription: ${description}\nname: ${name}\nmetadata:\n  skiller:\n    source: ${sourcePath}\n---\n${heading}\nbody\n`
    );
  }

  assert.equal(haveMatchingRequiredSkills(root), true);

  writeFileSync(
    join(root, '.agents/skills/plate-ui/SKILL.md'),
    'stale generated skill\n'
  );

  assert.equal(haveMatchingRequiredSkills(root), false);
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

test('rejects an unversioned doctrine edit and stale generated output', () => {
  const root = createRoot();
  const registry = createRegistry();
  const errors = validateRegistry({
    currentDoctrineFingerprint: `sha256:${'1'.repeat(64)}`,
    declaredVersion: 2,
    generatedResourcesMatch: false,
    generatedSkillsMatch: false,
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
    errors.some((error) => error.includes('Required generated doctrine skills'))
  );
  assert.ok(
    errors.some((error) => error.includes('Required generated skill resources'))
  );
});

test('requires a version increment from the immutable base', () => {
  const root = createRoot();
  const baseRegistry = createRegistry();
  const registry = createRegistry();
  const changedFingerprint = `sha256:${'1'.repeat(64)}`;

  registry.versions[1].doctrineFingerprint = changedFingerprint;
  assert.ok(
    validateRegistry({
      baseRegistry,
      currentDoctrineFingerprint: changedFingerprint,
      declaredVersion: 1,
      registry,
      reviewedSlugs: ['alpha'],
      root,
    }).some((error) => error.includes('without a doctrine version increment'))
  );

  registry.latestVersion = 2;
  registry.versions.push({
    date: '2026-08-17',
    doctrineFingerprint: changedFingerprint,
    migrationChecks: ['Apply changed doctrine.'],
    summary: 'Changed doctrine.',
    version: 2,
  });
  assert.ok(
    validateRegistry({
      baseRegistry,
      currentDoctrineFingerprint: changedFingerprint,
      declaredVersion: 2,
      registry,
      reviewedSlugs: ['alpha'],
      root,
    }).some((error) => error.includes('exact prefix'))
  );

  registry.versions[1] = structuredClone(baseRegistry.versions[1]);

  assert.deepEqual(
    validateRegistry({
      baseRegistry,
      currentDoctrineFingerprint: changedFingerprint,
      declaredVersion: 2,
      registry,
      reviewedSlugs: ['alpha'],
      root,
    }),
    []
  );
});

test('selects an immutable doctrine base', () => {
  assert.equal(
    selectDoctrineBaseRef({
      dirty: true,
      override: undefined,
      versionCommits: ['current', 'previous'],
    }),
    'HEAD'
  );
  assert.equal(
    selectDoctrineBaseRef({
      dirty: false,
      override: undefined,
      versionCommits: ['current', 'previous'],
    }),
    'previous'
  );
  assert.equal(
    selectDoctrineBaseRef({
      dirty: false,
      override: 'origin/next',
      versionCommits: [],
    }),
    'origin/next'
  );
  assert.throws(
    () =>
      selectDoctrineBaseRef({
        dirty: false,
        override: undefined,
        versionCommits: ['current'],
      }),
    /PLATE_NEXT_BASE/
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
      generatedSkillsMatch: true,
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

  mkdirSync(join(root, 'docs/plans'), { recursive: true });
  writeFileSync(join(root, 'docs/plans/delete-caption.md'), '# Evidence\n');

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

test('requires existing repo-relative evidence plans', () => {
  const root = createRoot();
  const current = computePackageFingerprint(root, 'alpha');
  const registry = createRegistry({
    appliedVersion: 1,
    evidence: 'missing.md',
    fingerprint: current.fingerprint,
    verifiedAt: '2026-07-25',
  });

  assert.ok(
    validateRegistry({ registry, reviewedSlugs: ['alpha'], root }).some(
      (error) => error.includes('existing repo-relative docs/plans')
    )
  );

  mkdirSync(join(root, 'docs/plans'), { recursive: true });
  writeFileSync(join(root, 'docs/plans/alpha.md'), '# Evidence\n');
  registry.packages.alpha.evidence = 'docs/plans/alpha.md';

  assert.deepEqual(
    validateRegistry({ registry, reviewedSlugs: ['alpha'], root }),
    []
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

  const originalLocaleCompare = String.prototype.localeCompare;
  try {
    String.prototype.localeCompare = () => -1;
    assert.deepEqual(computePackageFingerprint(root, 'alpha'), before);
  } finally {
    String.prototype.localeCompare = originalLocaleCompare;
  }

  writeFileSync(
    join(packageDirectory, 'src/index.ts'),
    'export const value = 2;\n'
  );

  assert.notEqual(
    computePackageFingerprint(root, 'alpha').fingerprint,
    before.fingerprint
  );
});

test('fingerprint includes symlink targets and unambiguous record framing', () => {
  const root = createRoot();
  const packageDirectory = join(root, 'packages/alpha');
  const link = join(packageDirectory, 'entry-link');

  symlinkSync('src/index.ts', link);
  const linked = computePackageFingerprint(root, 'alpha');
  unlinkSync(link);
  symlinkSync('package.json', link);
  const relinked = computePackageFingerprint(root, 'alpha');

  assert.notEqual(relinked.fingerprint, linked.fingerprint);
  assert.ok(relinked.files.includes('entry-link'));

  unlinkSync(link);
  writeFileSync(join(packageDirectory, 'a'), 'X\0b\0Y');
  writeFileSync(join(packageDirectory, 'b'), 'Z');
  const first = computePackageFingerprint(root, 'alpha');

  writeFileSync(join(packageDirectory, 'a'), 'X');
  writeFileSync(join(packageDirectory, 'b'), 'Y\0b\0Z');
  const second = computePackageFingerprint(root, 'alpha');

  assert.notEqual(second.fingerprint, first.fingerprint);
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
