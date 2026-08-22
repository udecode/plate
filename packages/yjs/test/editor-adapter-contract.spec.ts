import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Descendant, Editor } from '@platejs/plite';

import { createYjsEditorAdapter } from '../src/core/editor-adapter';

describe('@platejs/yjs editor adapter', () => {
  it('reads 10k and 50k published roots without copying them', () => {
    for (const size of [10_000, 50_000]) {
      const children: readonly Descendant[] = Object.freeze(
        Array.from({ length: size }, (_, index) => ({
          children: [{ text: String(index) }],
          type: 'paragraph',
        }))
      );
      let reads = 0;
      const editor = {
        read: {
          value: () => {
            reads += 1;

            return { children, roots: { header: children } };
          },
        },
      } as unknown as Editor;
      const adapter = createYjsEditorAdapter(editor, (_root, value) => value);

      assert.equal(adapter.readChildren('main'), children);
      assert.equal(adapter.readChildren('header'), children);
      assert.equal(reads, 2);
    }
  });
});
