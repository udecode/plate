import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AUTO_RELEASE_END,
  AUTO_RELEASE_START,
  hasChangesetFile,
  isAutoReleaseChecked,
  upsertAutoReleaseBlock,
} from './auto-release-pr.mjs';

test('detects real changeset files', () => {
  assert.equal(hasChangesetFile(['.changeset/media-redos.md']), true);
  assert.equal(
    hasChangesetFile(['.changeset/README.md', 'packages/media/src/index.ts']),
    false
  );
});

test('adds an unchecked auto-release block to changeset PRs', () => {
  const body = upsertAutoReleaseBlock('## Summary\nFix media parser.', {
    hasChangeset: true,
  });

  assert.equal(
    body,
    `## Summary
Fix media parser.

${AUTO_RELEASE_START}
**Auto release**
- [ ] Auto-merge the Version Packages PR after this PR lands.
${AUTO_RELEASE_END}
`
  );
});

test('preserves a checked auto-release block', () => {
  const body = `${AUTO_RELEASE_START}
**Auto release**
- [x] Auto-merge the Version Packages PR after this PR lands.
${AUTO_RELEASE_END}
`;

  const nextBody = upsertAutoReleaseBlock(body, { hasChangeset: true });

  assert.equal(isAutoReleaseChecked(nextBody), true);
  assert.match(nextBody, /- \[x\] Auto-merge/);
});

test('removes the auto-release block when a PR has no changeset', () => {
  const body = `## Summary
Docs only.

${AUTO_RELEASE_START}
**Auto release**
- [x] Auto-merge the Version Packages PR after this PR lands.
${AUTO_RELEASE_END}
`;

  assert.equal(
    upsertAutoReleaseBlock(body, { hasChangeset: false }),
    '## Summary\nDocs only.'
  );
});

test('only treats the managed checkbox as release intent', () => {
  assert.equal(
    isAutoReleaseChecked(
      '- [x] Auto-merge the Version Packages PR after this PR lands.'
    ),
    false
  );
});
