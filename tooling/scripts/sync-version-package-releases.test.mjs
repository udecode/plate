import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterMergedVersionPackagePullRequests,
  filterReleasesFromVersion,
  mergeReleases,
  parseVersionPackagesPullRequest,
} from './sync-version-package-releases.mjs';

test('parses Version Packages PR body into release entries', () => {
  const releases = parseVersionPackagesPullRequest({
    body: `This PR was opened by Changesets.

# Releases
## @platejs/ai@53.0.3

### Patch Changes

-   [#4945](https://github.com/udecode/plate/pull/4945) by [@felixfeng33](https://github.com/felixfeng33) – Clear block streaming state

## platejs@53.0.3

### Patch Changes

-   Updated \`@platejs/utils\`.

## @platejs/footnote@53.0.3

### Minor Changes

-   [#4941](https://github.com/udecode/plate/pull/4941) by [@zbeyens](https://github.com/zbeyens) – Add \`FootnoteReferencePlugin\`, \`FootnoteDefinitionPlugin\`, and
    \`FootnoteInputPlugin\` for real footnote nodes and inline \`[^\` combobox
    insertion in Plate editors.

## depset@0.1.2

### Patch Changes

-   [#4891](https://github.com/udecode/plate/pull/4891) by [@zbeyens](https://github.com/zbeyens) – Fix TypeScript 6 compatibility.
`,
    mergedAt: '2026-04-29T07:11:20Z',
    mergeCommit: { oid: 'abc123' },
    title: '[Release] Version packages',
    url: 'https://github.com/udecode/plate/pull/4969',
  });
  const release = releases.find((item) => item.tag === 'v53.0.3');
  const depsetRelease = releases.find((item) => item.tag === 'v0.1.2');

  assert.equal(releases.length, 2);
  assert.equal(release.tag, 'v53.0.3');
  assert.equal(release.date, '2026-04-29');
  assert.equal(
    release.changelogUrl,
    'https://github.com/udecode/plate/blob/abc123/packages/plate/CHANGELOG.md'
  );
  assert.equal(release.packageTag, 'platejs@53.0.3');
  assert.match(release.content, /^`@platejs\/ai`$/m);
  assert.match(release.content, /### Bug Fixes/);
  assert.match(
    release.content,
    /- Clear block streaming state \(\[#4945\]\(https:\/\/github\.com\/udecode\/plate\/pull\/4945\)\)/
  );
  assert.doesNotMatch(release.content, / by \[/);
  assert.match(release.content, /^`platejs`$/m);
  assert.match(
    release.content,
    /- Add `FootnoteReferencePlugin`, `FootnoteDefinitionPlugin`, and `FootnoteInputPlugin` for real footnote nodes and inline `\[\^` combobox insertion in Plate editors\. \(\[#4941\]\(https:\/\/github\.com\/udecode\/plate\/pull\/4941\)\)/
  );
  assert.doesNotMatch(
    release.content,
    /and \(\[#4941\]\(https:\/\/github\.com\/udecode\/plate\/pull\/4941\)\)\n {4}`FootnoteInputPlugin`/
  );
  assert.deepEqual(release.contributors, [
    {
      url: 'https://github.com/felixfeng33',
      username: '@felixfeng33',
    },
    {
      url: 'https://github.com/zbeyens',
      username: '@zbeyens',
    },
  ]);
  assert.equal(depsetRelease.tag, 'v0.1.2');
  assert.equal(depsetRelease.packageTag, 'depset@0.1.2');
  assert.match(depsetRelease.content, /^`depset`$/m);
});

test('filters unmerged Version Packages PRs from release history', () => {
  assert.deepEqual(
    filterMergedVersionPackagePullRequests([
      {
        mergedAt: null,
        number: 1,
        title: '[Release] Version packages',
      },
      {
        mergedAt: '2026-04-29T07:11:20Z',
        number: 2,
        title: '[Release] Version packages',
      },
      {
        mergedAt: '2026-05-01T07:11:20Z',
        number: 3,
        title: '[Release] Version packages (beta)',
      },
      {
        mergedAt: '2026-04-29T07:11:20Z',
        number: 4,
        title: 'docs: update releases',
      },
    ]).map((pullRequest) => pullRequest.number),
    [2, 3]
  );
});

test('parses beta Version Packages PR titles', () => {
  const [release] = parseVersionPackagesPullRequest({
    body: `# Releases
## @platejs/core@54.0.0-beta.1

### Patch Changes

-   [#5030](https://github.com/udecode/plate/pull/5030) by [@zbeyens](https://github.com/zbeyens) – Prepare beta release.
`,
    mergedAt: '2026-06-16T00:00:00Z',
    title: '[Release] Version packages (beta)',
    url: 'https://github.com/udecode/plate/pull/5033',
  });

  assert.equal(release.tag, 'v54.0.0-beta.1');
});

test('falls back to first package tag and builds compare URLs', () => {
  const releases = mergeReleases(
    [
      {
        content: 'older',
        date: '2026-04-25',
        packageTag: '@platejs/media@53.0.1',
        tag: 'v53.0.1',
        title: 'v53.0.1',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/1',
      },
    ],
    [
      {
        content: 'newer',
        contributors: [
          { url: 'https://github.com/beta', username: '@beta' },
          { url: 'https://github.com/alpha', username: '@alpha' },
        ],
        date: '2026-04-25',
        packageTag: '@platejs/list@53.0.2',
        tag: 'v53.0.2',
        title: 'v53.0.2',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/2',
      },
    ]
  );

  assert.equal(releases[0].url, 'https://github.com/udecode/plate/pull/2');
  assert.match(
    releases[0].content,
    /\[`CHANGELOG`\]\(https:\/\/github\.com\/udecode\/plate\/pull\/2\) · \[`v53\.0\.1\.\.\.v53\.0\.2`\]\(https:\/\/github\.com\/udecode\/plate\/compare\/%40platejs%2Fmedia%4053\.0\.1\.\.\.%40platejs%2Flist%4053\.0\.2\) · By \[@beta\]\(https:\/\/github\.com\/beta\), \[@alpha\]\(https:\/\/github\.com\/alpha\)/
  );
  assert.doesNotMatch(releases[0].content, /For detailed changes/);
  assert.doesNotMatch(releases[0].content, /Full changelog:/);
  assert.equal(releases[1].url, 'https://github.com/udecode/plate/pull/1');
  assert.match(
    releases[1].content,
    /\[`CHANGELOG`\]\(https:\/\/github\.com\/udecode\/plate\/pull\/1\) · \[`v53\.0\.1`\]\(https:\/\/github\.com\/udecode\/plate\/pull\/1\)/
  );
});

test('uses GitHub Release URLs without fake package changelog footer links', () => {
  const releases = mergeReleases(
    [
      {
        content: 'older',
        date: '2026-05-12',
        packageTag: '@platejs/ai@53.0.4',
        tag: 'v53.0.4',
        title: 'v53.0.4',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4975',
      },
    ],
    [
      {
        content: 'newer',
        contributors: [
          {
            url: 'https://github.com/github-actions%5Bbot%5D',
            username: '@github-actions\\[bot\\]',
          },
        ],
        date: '2026-05-21',
        changelogUrl:
          'https://github.com/udecode/plate/blob/d09298282dd3af8022052e51c212eb6cdcdd3843/packages/plate/CHANGELOG.md',
        packageTag: 'platejs@53.0.5',
        tag: 'v53.0.5',
        title: 'v53.0.5',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4978',
      },
    ],
    {
      releaseUrlsByTag: new Map([
        ['v53.0.5', 'https://github.com/udecode/plate/releases/tag/v53.0.5'],
      ]),
    }
  );

  assert.equal(
    releases[0].url,
    'https://github.com/udecode/plate/releases/tag/v53.0.5'
  );
  assert.match(
    releases[0].content,
    /\[`v53\.0\.4\.\.\.v53\.0\.5`\]\(https:\/\/github\.com\/udecode\/plate\/compare\/%40platejs%2Fai%4053\.0\.4\.\.\.platejs%4053\.0\.5\) · By \[@github-actions\\\[bot\\\]\]\(https:\/\/github\.com\/github-actions%5Bbot%5D\)/
  );
  assert.doesNotMatch(releases[0].content, /\[`CHANGELOG`\]/);
  assert.doesNotMatch(releases[0].content, /pull\/4978/);
  assert.equal(releases[1].url, 'https://github.com/udecode/plate/pull/4975');
});

test('compares global tags when adjacent GitHub Releases exist', () => {
  const releases = mergeReleases(
    [
      {
        content: 'older',
        date: '2026-05-21',
        packageTag: 'platejs@53.0.5',
        tag: 'v53.0.5',
        title: 'v53.0.5',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4978',
      },
    ],
    [
      {
        content: 'newer',
        date: '2026-05-22',
        packageTag: 'platejs@53.0.6',
        tag: 'v53.0.6',
        title: 'v53.0.6',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4999',
      },
    ],
    {
      releaseUrlsByTag: new Map([
        ['v53.0.5', 'https://github.com/udecode/plate/releases/tag/v53.0.5'],
        ['v53.0.6', 'https://github.com/udecode/plate/releases/tag/v53.0.6'],
      ]),
    }
  );

  assert.match(
    releases[0].content,
    /\[`v53\.0\.5\.\.\.v53\.0\.6`\]\(https:\/\/github\.com\/udecode\/plate\/compare\/v53\.0\.5\.\.\.v53\.0\.6\)/
  );
});

test('parses wrapper-only Changesets entries', () => {
  const [release] = parseVersionPackagesPullRequest({
    body: `# Releases
## @udecode/plate-ai@49.0.0

### Major Changes

-   [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –

    -   Copilot API method changes:
        -   \`editor.api.copilot.accept\` is now \`editor.tf.copilot.accept\`.
    -   Removed default shortcuts for Copilot.
`.replaceAll('\n', '\r\n'),
    mergedAt: '2025-06-11T00:00:00Z',
    title: '[Release] Version packages',
    url: 'https://github.com/udecode/plate/pull/4339',
  });

  assert.match(
    release.content,
    /- Copilot API method changes: \(\[#4327\]\(https:\/\/github\.com\/udecode\/plate\/pull\/4327\)\)/
  );
  assert.match(
    release.content,
    / {4}- `editor\.api\.copilot\.accept` is now `editor\.tf\.copilot\.accept`\./
  );
  assert.match(release.content, /- Removed default shortcuts for Copilot\./);
  assert.doesNotMatch(release.content, /\r/);
  assert.doesNotMatch(release.content, / by \[/);
  assert.deepEqual(release.contributors, [
    {
      url: 'https://github.com/zbeyens',
      username: '@zbeyens',
    },
  ]);
});

test('parses commit-linked Changesets entries', () => {
  const [release] = parseVersionPackagesPullRequest({
    body: `# Releases
## @platejs/slate@53.0.5

### Patch Changes

-   [\`ce9ec87\`](https://github.com/udecode/plate/commit/ce9ec871c9547a8a3c78ded13a93049ef9fe049c) by [@github-actions\\[bot\\]](https://github.com/github-actions%5Bbot%5D) – Updated \`slate-react\`.
`,
    mergedAt: '2026-05-01T00:00:00Z',
    title: '[Release] Version packages',
    url: 'https://github.com/udecode/plate/pull/4978',
  });

  assert.match(
    release.content,
    /- Updated `slate-react`\. \(\[`ce9ec87`\]\(https:\/\/github\.com\/udecode\/plate\/commit\/ce9ec871c9547a8a3c78ded13a93049ef9fe049c\)\)/
  );
  assert.doesNotMatch(release.content, / by \[/);
  assert.deepEqual(release.contributors, [
    {
      url: 'https://github.com/github-actions%5Bbot%5D',
      username: '@github-actions\\[bot\\]',
    },
  ]);
});

test('filters generated release history from a version floor', () => {
  assert.deepEqual(
    filterReleasesFromVersion(
      [
        { tag: 'v53.0.3' },
        { tag: 'v52.3.7' },
        { tag: 'v49.0.0' },
        { tag: 'v48.6.1' },
      ],
      'v49'
    ).map((release) => release.tag),
    ['v53.0.3', 'v52.3.7', 'v49.0.0']
  );
});
