'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');

const changelogConfig = require('./changelog-config.js');

test('suppresses dependency-only changelog lines', async () => {
  assert.equal(await changelogConfig.getDependencyReleaseLine([], []), '');
});
