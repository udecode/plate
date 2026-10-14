import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, NodeApi } from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';

const struck = (text: string) => ({
  authored: [{ at: 1, author: 'alice', change: 'alice:1', kind: 'delete' }],
  text,
});
const paragraph = (...children: Array<Record<string, unknown>>) => ({
  type: 'paragraph',
  children,
});
const editorWith = (...children: Array<Record<string, unknown>>) =>
  createEditor({
    plugins: [createAuthoredPlugin({ authorId: 'bob' })],
    initialValue: [paragraph(...children)],
  });

describe('authored review tree content reads', () => {
  it('finds content text across struck text and never inside it', () => {
    const editor = editorWith({ text: 'keep ' }, struck('gone '), {
      text: 'NEW tail',
    });

    assert.deepEqual(
      NodeApi.findTextRanges(editor, 'keep NEW', { content: true }),
      [
        {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 3, path: [0, 2] },
        },
      ]
    );
    assert.deepEqual(
      NodeApi.findTextRanges(editor, 'gone', { content: true }),
      []
    );
  });
});
