'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');

const changelogConfigPath = require.resolve('./changelog-config.js');
const githubInfoPath = require.resolve('@changesets/get-github-info');

const loadChangelogConfig = (githubInfo) => {
  delete require.cache[changelogConfigPath];
  delete require.cache[githubInfoPath];

  if (githubInfo) {
    require.cache[githubInfoPath] = {
      exports: githubInfo,
      filename: githubInfoPath,
      id: githubInfoPath,
      loaded: true,
    };
  }

  return require('./changelog-config.js');
};

test('suppresses dependency-only changelog lines', async () => {
  const changelogConfig = loadChangelogConfig();

  assert.equal(await changelogConfig.getDependencyReleaseLine([], []), '');
});

test('falls back to explicit PR metadata when GitHub info fetch fails', async () => {
  const changelogConfig = loadChangelogConfig({
    getInfo: async () => {
      throw new Error('unexpected commit lookup');
    },
    getInfoFromPullRequest: async () => {
      throw new Error('Invalid response body while trying to fetch GraphQL');
    },
  });

  const releaseLine = await changelogConfig.getReleaseLine(
    {
      commit: 'ignored',
      summary: `pr: #5045
commit: abc123
user: zbeyens

Support AI SDK v7 chat helper types.`,
    },
    'minor',
    { repo: 'udecode/plate' }
  );

  assert.match(
    releaseLine,
    /\[#5045\]\(https:\/\/github\.com\/udecode\/plate\/pull\/5045\)/
  );
  assert.match(releaseLine, /\[@zbeyens\]\(https:\/\/github\.com\/zbeyens\)/);
  assert.match(releaseLine, /Support AI SDK v7 chat helper types\./);
});

test('falls back to commit link when commit metadata lookup fails', async () => {
  const changelogConfig = loadChangelogConfig({
    getInfo: async () => {
      throw new Error('Premature close');
    },
    getInfoFromPullRequest: async () => {
      throw new Error('unexpected PR lookup');
    },
  });

  const releaseLine = await changelogConfig.getReleaseLine(
    {
      commit: 'def456',
      summary: 'Fix release changelog generation.',
    },
    'patch',
    { repo: 'udecode/plate' }
  );

  assert.match(
    releaseLine,
    /\[`def456`\]\(https:\/\/github\.com\/udecode\/plate\/commit\/def456\)/
  );
  assert.match(releaseLine, /Fix release changelog generation\./);
});
