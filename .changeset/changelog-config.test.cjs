'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');

const { __test } = require('./changelog-config.js');

test('formats dependency-only changelog lines without versions', () => {
  assert.equal(
    __test.formatDependencyReleaseLine([
      { name: '@platejs/core' },
      { name: '@platejs/utils' },
    ]),
    'Updated `@platejs/core`, `@platejs/utils`.'
  );
});

test('detects auto runtime dependent changesets', () => {
  assert.equal(
    __test.isAutoRuntimeDependentsChangeset({
      summary:
        'Republish runtime dependents of `@platejs/core` so published workspace dependency graphs stay aligned.',
    }),
    true
  );
});
