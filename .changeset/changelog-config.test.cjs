'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');

const changelogConfig = require('./changelog-config.js');

test('suppresses dependency-only changelog lines', async () => {
  assert.equal(await changelogConfig.getDependencyReleaseLine([], []), '');
});

test('keeps code samples opaque when generating a release line', async () => {
  const summary = `Declare lifecycle handlers inline:

\`\`\`tsx
const AnalyticsPlugin = definePlatePlugin('analytics', {
  on: {
    commit: ({ commit }) => reportCommit(commit),
  },
});
\`\`\``;

  const releaseLine = await changelogConfig.getReleaseLine(
    { summary },
    'minor',
    { repo: 'udecode/plate' }
  );

  assert.match(
    releaseLine,
    /commit: \(\{ commit \}\) => reportCommit\(commit\)/u
  );
});
