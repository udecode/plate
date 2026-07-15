import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { failInvariant } from '@platejs/plite/internal';

describe('internal invariant contract', () => {
  it('throws a contextual Plite invariant error', () => {
    assert.throws(
      () => failInvariant('Expected a document start point'),
      new Error('Plite invariant failed: Expected a document start point')
    );
  });
});
