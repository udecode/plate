import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  extractReleaseChanges,
  generateRawReleaseNotes,
  getGlobalReleaseVersion,
  getWorkspacePackages,
  parsePublishedPackages,
  validateAiReleaseNotes,
} from './release-notes.mjs';

test('selects the highest published package version for the global release', () => {
  assert.equal(
    getGlobalReleaseVersion([
      { name: '@platejs/list', version: '53.0.2' },
      { name: 'depset', version: '0.1.2' },
      { name: '@platejs/table', version: '53.0.1' },
    ]),
    '53.0.2'
  );
});

test('parses changesets published package output safely', () => {
  assert.deepEqual(
    parsePublishedPackages('[{"name":"@platejs/list","version":"53.0.2"}]'),
    [{ name: '@platejs/list', version: '53.0.2' }]
  );
  assert.deepEqual(parsePublishedPackages('not json'), []);
});

test('extracts exact package changelog sections and preserves change types', () => {
  const changelog = `# @platejs/table

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
  const packageDirectory = path.join(packageRoot, 'list');

  await mkdir(packageDirectory, { recursive: true });
  await writeFile(
    path.join(packageDirectory, 'package.json'),
    JSON.stringify({ name: '@platejs/list', version: '53.0.2' })
  );
  await writeFile(
    path.join(packageDirectory, 'CHANGELOG.md'),
    `# @platejs/list

## 53.0.2

### Patch Changes

- [#4954](https://github.com/udecode/plate/pull/4954) by [@dylans](https://github.com/dylans) – Fix ordered list numbering.
`
  );

  const body = await generateRawReleaseNotes({
    commitRef: 'abc123',
    publishedPackages: [{ name: '@platejs/list', version: '53.0.2' }],
    workspacePackages: await getWorkspacePackages([packageRoot]),
  });

  assert.match(body, /## `@platejs\/list`/);
  assert.match(body, /### Patch Changes/);
  assert.match(body, /Fix ordered list numbering/);
  assert.match(
    body,
    /For detailed changes, see \[`CHANGELOG`\]\(https:\/\/github\.com\/udecode\/plate\/blob\/abc123\//
  );
  assert.match(body, /## Contributors/);
  assert.match(body, /@dylans/);
  assert.doesNotMatch(body, /compare\/v/);
  assert.doesNotMatch(body, /Full changelog/);
});

test('validates AI release notes preserve deterministic structure', () => {
  const raw = `## \`@platejs/table\`

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
    .replace('## `@platejs/table`', '## `@platejs/core`')
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
  const raw = `## \`@platejs/table\`

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
  const raw = `## \`@platejs/table\`

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
  const raw = `## \`@platejs/table\`

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
  const raw = `## \`@platejs/slate\`

### Patch Changes

- Updated \`slate-react\`. ([\`ce9ec87\`](https://github.com/udecode/plate/commit/ce9ec871c9547a8a3c78ded13a93049ef9fe049c))

For detailed changes, see [\`CHANGELOG\`](https://github.com/udecode/plate/blob/abc/packages/slate/CHANGELOG.md)
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
  const raw = `## \`@platejs/table\`

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
