import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ContentSlice } from '../../../packages/plitejs/src/index';

describe('ContentSlice value benchmark authority', () => {
  it('measures the live immutable value boundary', () => {
    const source = [
      {
        children: [{ text: 'before' }],
        type: 'paragraph',
      },
    ];
    const closed = ContentSlice.closed(source);
    const decoded = ContentSlice.fromJSON({
      content: source,
      openEnd: 0,
      openStart: 0,
    });

    source[0].children[0] = { text: 'after' };

    assert.deepEqual(closed.content, [
      { children: [{ text: 'before' }], type: 'paragraph' },
    ]);
    assert.deepEqual(decoded.content, closed.content);
    assert.notEqual(closed.content, source);
    assert.equal(Object.isFrozen(closed.content[0].children[0]), true);
    assert.equal(ContentSlice.fromJSON(closed), closed);
    assert.equal(ContentSlice.fromJSON(decoded), decoded);
  });
});
