import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  addPackageChangelogLinks,
  extractReleaseChanges,
  generateRawReleaseNotes,
  getFullChangelog,
  getGlobalReleaseVersion,
  getPackageChangelogUrls,
  getWorkspacePackages,
  parsePublishedPackages,
  validateAiReleaseNotes,
} from './release-notes.mjs';

test('selects the highest published package version for the global release', () => {
  assert.equal(
    getGlobalReleaseVersion([
      { name: '@platejs/test', version: '53.0.2' },
      { name: '@platejs/cli', version: '0.1.2' },
      { name: 'platejs', version: '53.0.1' },
    ]),
    '53.0.2'
  );
});

test('parses changesets published package output safely', () => {
  assert.deepEqual(
    parsePublishedPackages('[{"name":"@platejs/test","version":"53.0.2"}]'),
    [{ name: '@platejs/test', version: '53.0.2' }]
  );
  assert.deepEqual(parsePublishedPackages('not json'), []);
});

test('extracts exact package changelog sections and preserves change types', () => {
  const changelog = `# @platejs/cli

## 54.0.0

### Major Changes

- Remove \`oldApi\`.

### Minor Changes

- Add \`newApi\`.

### Patch Changes

- Fix docs.

## 53.0.0

### Major Changes

- Older major.
`;

  assert.deepEqual(extractReleaseChanges(changelog, '54.0.0'), {
    body: '### Major Changes\n\n- Remove `oldApi`.\n\n### Minor Changes\n\n- Add `newApi`.\n\n### Patch Changes\n\n- Fix docs.',
    type: 'major',
  });
});

test('generates raw release notes from published package changelogs', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'plate-release-notes-'));
  const packageRoot = path.join(root, 'packages');
  const packageDirectory = path.join(packageRoot, 'browser');

  await mkdir(packageDirectory, { recursive: true });
  await writeFile(
    path.join(packageDirectory, 'package.json'),
    JSON.stringify({ name: '@platejs/test', version: '53.0.2' })
  );
  await writeFile(
    path.join(packageDirectory, 'CHANGELOG.md'),
    `# @platejs/test

## 53.0.2

### Patch Changes

- [#4954](https://github.com/udecode/plate/pull/4954) by [@dylans](https://github.com/dylans) – Fix ordered list numbering.
`
  );

  const body = await generateRawReleaseNotes({
    fullChangelog: {
      label: 'v53.0.1...v53.0.2',
      url: 'https://github.com/udecode/plate/compare/v53.0.1...v53.0.2',
    },
    publishedPackages: [{ name: '@platejs/test', version: '53.0.2' }],
    workspacePackages: await getWorkspacePackages([packageRoot]),
  });

  assert.match(body, /## `@platejs\/test`/);
  assert.match(body, /### Patch Changes/);
  assert.match(body, /Fix ordered list numbering/);
  assert.match(body, /## Contributors/);
  assert.match(body, /@dylans/);
  assert.match(
    body,
    /Full changelog: \[`v53\.0\.1\.\.\.v53\.0\.2`\]\(https:\/\/github\.com\/udecode\/plate\/compare\/v53\.0\.1\.\.\.v53\.0\.2\)/
  );
  assert.doesNotMatch(body, /For detailed changes/);
});

test('builds changelog URLs for every published workspace package', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'plate-detailed-changes-'));
  const packageRoot = path.join(root, 'packages');
  const testDirectory = path.join(packageRoot, 'test');
  const plateDirectory = path.join(packageRoot, 'platejs');

  await mkdir(testDirectory, { recursive: true });
  await mkdir(plateDirectory, { recursive: true });
  await writeFile(
    path.join(testDirectory, 'package.json'),
    JSON.stringify({ name: '@platejs/test', version: '53.0.5' })
  );
  await writeFile(
    path.join(plateDirectory, 'package.json'),
    JSON.stringify({ name: 'platejs', version: '53.0.5' })
  );

  assert.deepEqual(
    getPackageChangelogUrls({
      commitRef: 'abc123',
      publishedPackages: [
        { name: '@platejs/test', version: '53.0.5' },
        { name: 'platejs', version: '53.0.5' },
      ],
      repoRootDirectory: root,
      workspacePackages: await getWorkspacePackages([packageRoot]),
    }),
    new Map([
      [
        '@platejs/test',
        'https://github.com/udecode/plate/blob/abc123/packages/test/CHANGELOG.md',
      ],
      [
        'platejs',
        'https://github.com/udecode/plate/blob/abc123/packages/platejs/CHANGELOG.md',
      ],
    ])
  );
});

test('adds package changelog links only during AI finalization', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'plate-package-links-'));
  const packageRoot = path.join(root, 'packages');
  const testDirectory = path.join(packageRoot, 'test');
  const plateDirectory = path.join(packageRoot, 'platejs');

  await mkdir(testDirectory, { recursive: true });
  await mkdir(plateDirectory, { recursive: true });
  await writeFile(
    path.join(testDirectory, 'package.json'),
    JSON.stringify({ name: '@platejs/test', version: '53.0.5' })
  );
  await writeFile(
    path.join(plateDirectory, 'package.json'),
    JSON.stringify({ name: 'platejs', version: '53.0.5' })
  );

  const content = `## \`@platejs/test\`

### Patch Changes

- Fix lists.

## \`platejs\`

### Patch Changes

- Update wrapper.

## Contributors

Thanks to everyone who contributed to this release:

@alice

Full changelog: [\`v53.0.4...v53.0.5\`](https://github.com/udecode/plate/compare/v53.0.4...v53.0.5)
`;

  const linkedContent = addPackageChangelogLinks(content, {
    commitRef: 'abc123',
    publishedPackages: [
      { name: '@platejs/test', version: '53.0.5' },
      { name: 'platejs', version: '53.0.5' },
    ],
    repoRootDirectory: root,
    workspacePackages: await getWorkspacePackages([packageRoot]),
  });

  assert.match(
    linkedContent,
    /## `@platejs\/test`[\s\S]*For detailed changes, see \[`CHANGELOG`\]\(https:\/\/github\.com\/udecode\/plate\/blob\/abc123\/packages\/test\/CHANGELOG\.md\)[\s\S]*## `platejs`/
  );
  assert.match(
    linkedContent,
    /## `platejs`[\s\S]*For detailed changes, see \[`CHANGELOG`\]\(https:\/\/github\.com\/udecode\/plate\/blob\/abc123\/packages\/platejs\/CHANGELOG\.md\)[\s\S]*## Contributors/
  );
});

test('uses release index package tags for full changelog fallback', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'plate-release-index-'));
  const releaseIndexFile = path.join(root, 'release-index.json');

  await writeFile(
    releaseIndexFile,
    JSON.stringify([
      {
        packageTag: '@platejs/test@98.0.0',
        tag: 'v98.0.0',
      },
    ])
  );

  assert.deepEqual(
    await getFullChangelog({
      globalReleaseTags: ['v1.0.0'],
      publishedPackages: [{ name: 'platejs', version: '99.0.0' }],
      releaseIndexFile,
      version: '99.0.0',
    }),
    {
      label: 'v98.0.0...v99.0.0',
      url: 'https://github.com/udecode/plate/compare/%40platejs%2Ftest%4098.0.0...platejs%4099.0.0',
    }
  );
});

test('uses previous global tag when it matches the release index version', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'plate-release-index-'));
  const releaseIndexFile = path.join(root, 'release-index.json');

  await writeFile(
    releaseIndexFile,
    JSON.stringify([
      {
        packageTag: 'platejs@99.0.0',
        tag: 'v99.0.0',
      },
    ])
  );

  assert.deepEqual(
    await getFullChangelog({
      globalReleaseTags: ['v99.0.0'],
      publishedPackages: [{ name: 'platejs', version: '99.0.1' }],
      releaseIndexFile,
      version: '99.0.1',
    }),
    {
      label: 'v99.0.0...v99.0.1',
      url: 'https://github.com/udecode/plate/compare/v99.0.0...v99.0.1',
    }
  );
});

test('validates AI release notes preserve deterministic structure', () => {
  const raw = `## \`@platejs/cli\`

### Major Changes

- Removed \`oldApi\` ([#5000](https://github.com/udecode/plate/pull/5000))
> **Migration:** Use \`newApi\`.

For detailed changes, see [\`CHANGELOG\`](https://github.com/udecode/plate/blob/abc/packages/table/CHANGELOG.md)

## Contributors

Thanks to everyone who contributed to this release:

@alice
`;
  const good = raw.replace('Removed `oldApi`', 'Removed `oldApi` from tables');
  const bad = raw
    .replace('## `@platejs/cli`', '## `platejs`')
    .replace('[#5000](https://github.com/udecode/plate/pull/5000)', '')
    .replace('> **Migration:** Use `newApi`.\n', '')
    .replace(
      '\n## Contributors\n\nThanks to everyone who contributed to this release:\n\n@alice\n',
      ''
    );

  assert.deepEqual(validateAiReleaseNotes(raw, good), {
    errors: [],
    valid: true,
  });
  assert.equal(validateAiReleaseNotes(raw, bad).valid, false);
  assert.match(
    validateAiReleaseNotes(raw, bad).errors.join('\n'),
    /AI output dropped Contributors section\./
  );
});

test('validates AI release notes preserve the Contributors section itself', () => {
  const raw = `## \`@platejs/cli\`

### Patch Changes

- [#5000](https://github.com/udecode/plate/pull/5000) by [@alice](https://github.com/alice) – Fix table.

For detailed changes, see [\`CHANGELOG\`](https://github.com/udecode/plate/blob/abc/packages/table/CHANGELOG.md)

## Contributors

Thanks to everyone who contributed to this release:

@alice
`;
  const withoutContributors = raw.replace(
    '\n## Contributors\n\nThanks to everyone who contributed to this release:\n\n@alice\n',
    '\n'
  );

  assert.deepEqual(validateAiReleaseNotes(raw, withoutContributors), {
    errors: ['AI output dropped Contributors section.'],
    valid: false,
  });
});

test('validates AI release notes preserve comma-separated contributor handles', () => {
  const raw = `## \`@platejs/cli\`

### Patch Changes

- [#5000](https://github.com/udecode/plate/pull/5000) by [@alice](https://github.com/alice) – Fix table.
- [#5001](https://github.com/udecode/plate/pull/5001) by [@bob](https://github.com/bob) – Fix more.

For detailed changes, see [\`CHANGELOG\`](https://github.com/udecode/plate/blob/abc/packages/table/CHANGELOG.md)

## Contributors

Thanks to everyone who contributed to this release:

@alice, @bob
`;
  const missingBob = raw.replace('@alice, @bob', '@alice');

  assert.deepEqual(validateAiReleaseNotes(raw, missingBob), {
    errors: ['AI output dropped contributors.'],
    valid: false,
  });
});

test('validates AI release notes preserve exact PR links', () => {
  const raw = `## \`@platejs/cli\`

### Patch Changes

- Fix table ([#5000](https://github.com/udecode/plate/pull/5000))

For detailed changes, see [\`CHANGELOG\`](https://github.com/udecode/plate/blob/abc/packages/table/CHANGELOG.md)
`;
  const wrongPullRequest = raw.replace(
    '[#5000](https://github.com/udecode/plate/pull/5000)',
    '[#5999](https://github.com/udecode/plate/pull/5999)'
  );

  assert.deepEqual(validateAiReleaseNotes(raw, wrongPullRequest), {
    errors: ['AI output changed PR links.'],
    valid: false,
  });
});

test('validates AI release notes preserve exact commit links', () => {
  const raw = `## \`plitejs\`

### Patch Changes

- Updated \`slate-react\`. ([\`ce9ec87\`](https://github.com/udecode/plate/commit/ce9ec871c9547a8a3c78ded13a93049ef9fe049c))

For detailed changes, see [\`CHANGELOG\`](https://github.com/udecode/plate/blob/abc/packages/plitejs/CHANGELOG.md)
`;
  const withoutCommit = raw.replace(
    '([`ce9ec87`](https://github.com/udecode/plate/commit/ce9ec871c9547a8a3c78ded13a93049ef9fe049c))',
    ''
  );

  assert.deepEqual(validateAiReleaseNotes(raw, withoutCommit), {
    errors: ['AI output changed commit links.'],
    valid: false,
  });
});

test('validates AI release notes reject added release entries', () => {
  const raw = `## \`@platejs/cli\`

### Patch Changes

- Fix table ([#5000](https://github.com/udecode/plate/pull/5000))

For detailed changes, see [\`CHANGELOG\`](https://github.com/udecode/plate/blob/abc/packages/table/CHANGELOG.md)
`;
  const withAddedEntry = raw.replace(
    'For detailed changes',
    '- Invent unrelated change\n\nFor detailed changes'
  );

  assert.deepEqual(validateAiReleaseNotes(raw, withAddedEntry), {
    errors: ['AI output changed release entry count.'],
    valid: false,
  });
});
