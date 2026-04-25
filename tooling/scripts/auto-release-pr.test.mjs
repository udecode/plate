import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AUTO_RELEASE_END,
  AUTO_RELEASE_START,
  getChangesetReleaseType,
  hasChangesetFile,
  isAutoReleaseChecked,
  isVersionPackagesTitle,
  shouldManageAutoReleaseBlock,
  upsertAutoReleaseBlock,
} from './auto-release-pr.mjs';

test('uses repo-neutral auto-release markers', () => {
  assert.equal(AUTO_RELEASE_START, '<!-- auto-release:start -->');
  assert.equal(AUTO_RELEASE_END, '<!-- auto-release:end -->');
});

test('detects real changeset files', () => {
  assert.equal(hasChangesetFile(['.changeset/media-redos.md']), true);
  assert.equal(
    hasChangesetFile(['.changeset/README.md', 'packages/media/src/index.ts']),
    false
  );
});

test('detects Version packages release PR titles', () => {
  assert.equal(isVersionPackagesTitle('[Release] Version packages'), true);
  assert.equal(isVersionPackagesTitle('chore: Version Packages'), true);
  assert.equal(isVersionPackagesTitle('Fix media parser'), false);
});

test('does not manage auto-release blocks on Version packages PRs', () => {
  assert.equal(
    shouldManageAutoReleaseBlock({
      files: ['.changeset/media-redos.md'],
      title: '[Release] Version packages',
    }),
    false
  );
  assert.equal(
    shouldManageAutoReleaseBlock({
      files: ['.changeset/media-redos.md'],
      title: 'Fix media parser',
    }),
    true
  );
});

test('detects the highest changeset release type from PR file patches', () => {
  assert.equal(
    getChangesetReleaseType([
      {
        filename: '.changeset/media-redos.md',
        patch: `@@ -0,0 +1,5 @@
+---
+"@platejs/media": patch
+---
+
+Fix parser`,
      },
    ]),
    'patch'
  );

  assert.equal(
    getChangesetReleaseType([
      {
        filename: '.changeset/media-redos.md',
        patch: `@@ -0,0 +1,5 @@
+---
+"@platejs/media": patch
+---
+Fix parser`,
      },
      {
        filename: '.changeset/core-api.md',
        patch: `@@ -0,0 +1,5 @@
+---
+"@platejs/core": minor
+---
+Add API`,
      },
    ]),
    'minor'
  );

  assert.equal(
    getChangesetReleaseType([
      {
        filename: '.changeset/core-break.md',
        patch: `@@ -0,0 +1,5 @@
+---
+"@platejs/core": major
+---
+Remove API`,
      },
      {
        filename: '.changeset/media-redos.md',
        patch: `@@ -0,0 +1,5 @@
+---
+"@platejs/media": patch
+---
+Fix parser`,
      },
    ]),
    'major'
  );
});

test('adds a checked auto-release block to patch-only changeset PRs', () => {
  const body = upsertAutoReleaseBlock('## Summary\nFix media parser.', {
    defaultChecked: true,
    hasChangeset: true,
  });

  assert.equal(
    body,
    `${AUTO_RELEASE_START}
- [x] Auto release
${AUTO_RELEASE_END}

## Summary
Fix media parser.
`
  );
});

test('adds an unchecked auto-release block to minor or major changeset PRs', () => {
  const body = upsertAutoReleaseBlock('## Summary\nAdd API.', {
    defaultChecked: false,
    hasChangeset: true,
  });

  assert.match(body, /- \[ \] Auto release/);
});

test('preserves a checked auto-release block', () => {
  const body = `${AUTO_RELEASE_START}
- [x] Auto release
${AUTO_RELEASE_END}
`;

  const nextBody = upsertAutoReleaseBlock(body, { hasChangeset: true });

  assert.equal(isAutoReleaseChecked(nextBody), true);
  assert.match(nextBody, /- \[x\] Auto release/);
});

test('removes the auto-release block when a PR has no changeset', () => {
  const body = `## Summary
Docs only.

${AUTO_RELEASE_START}
- [x] Auto release
${AUTO_RELEASE_END}
`;

  assert.equal(
    upsertAutoReleaseBlock(body, { hasChangeset: false }),
    '## Summary\nDocs only.'
  );
});

test('only treats the managed checkbox as release intent', () => {
  assert.equal(isAutoReleaseChecked('- [x] Auto release'), false);
});

test('keeps old checked blocks checked while rewriting the label', () => {
  const body = `${AUTO_RELEASE_START}
- [x] Auto-merge the Version Packages PR after this PR lands.
${AUTO_RELEASE_END}

## Summary
Fix media parser.
`;

  const nextBody = upsertAutoReleaseBlock(body, { hasChangeset: true });

  assert.match(nextBody, /- \[x\] Auto release/);
  assert.doesNotMatch(nextBody, /Version Packages/);
});

test('rewrites old managed markers to the repo-neutral markers', () => {
  const body = `<!-- plate:auto-release:start -->
- [x] Auto release
<!-- plate:auto-release:end -->

## Summary
Fix media parser.
`;

  const nextBody = upsertAutoReleaseBlock(body, { hasChangeset: true });

  assert.match(nextBody, /^<!-- auto-release:start -->/);
  assert.doesNotMatch(nextBody, /plate:auto-release/);
  assert.match(nextBody, /- \[x\] Auto release/);
});
