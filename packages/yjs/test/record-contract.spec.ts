import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isRecord } from '../src/core/record';

describe('@platejs/yjs record guard contract', () => {
  it('accepts plain objects but not arrays', () => {
    assert.equal(isRecord({ key: 'value' }), true);
    assert.equal(isRecord([]), false);
    assert.equal(isRecord(null), false);
  });
});
