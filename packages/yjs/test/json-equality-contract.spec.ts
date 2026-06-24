import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { areJsonLikeValuesEqual } from '../src/core/json-equality';

describe('@platejs/yjs JSON-like equality contract', () => {
  it('treats object key order and undefined fields as insignificant', () => {
    assert.equal(
      areJsonLikeValuesEqual(
        {
          cursor: {
            name: 'Ada',
            palette: ['tomato', 'white'],
            accent: undefined,
          },
          role: 'reviewer',
        },
        {
          role: 'reviewer',
          cursor: {
            palette: ['tomato', 'white'],
            name: 'Ada',
          },
        }
      ),
      true
    );
  });

  it('treats array order and defined object keys as significant', () => {
    assert.equal(
      areJsonLikeValuesEqual(['tomato', 'white'], ['white', 'tomato']),
      false
    );
    assert.equal(
      areJsonLikeValuesEqual({ name: 'Ada' }, { name: 'Ada', role: null }),
      false
    );
  });
});
