import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor } from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';

const mark = (kind: 'delete' | 'insert', author: string, at: number) => ({
  at,
  author,
  change: 'c1',
  kind,
});

describe('authored review tree marks', () => {
  it('refuses a document whose leaves of one change disagree about the author', () => {
    assert.throws(
      () =>
        createEditor({
          plugins: [createAuthoredPlugin({ authorId: 'alice' })],
          initialValue: [
            {
              type: 'paragraph',
              children: [
                { text: 'gone ', authored: [mark('delete', 'bob', 1)] },
                { text: 'new', authored: [mark('insert', 'alice', 1)] },
              ],
            },
          ],
        }),
      /Change c1 has marks with different authors\./
    );
  });

  it('refuses a document holding an Editing insertion', () => {
    assert.throws(
      () =>
        createEditor({
          plugins: [createAuthoredPlugin({ authorId: 'alice' })],
          initialValue: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'typed',
                  authored: [
                    { ...mark('insert', 'bob', 1), change: '~edit:bob' },
                  ],
                },
              ],
            },
          ],
        }),
      /An Editing mark of kind "insert" never stays stored/
    );
  });

  it('keeps the claim of an Editing deletion that no pending join holds', () => {
    const children = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'gone',
            authored: [{ ...mark('delete', 'bob', 1), change: '~edit:bob' }],
          },
        ],
      },
      { type: 'paragraph', children: [{ text: 'next' }] },
    ];
    const editor = createEditor({
      plugins: [createAuthoredPlugin({ authorId: 'alice' })],
      initialValue: children,
    });

    assert.deepEqual(editor.read.children(), children);
  });

  it('loads a replacement whose marks agree and keeps them in the value', () => {
    const children = [
      {
        type: 'paragraph',
        children: [
          { text: 'keep ' },
          { text: 'gone ', authored: [mark('delete', 'bob', 1)] },
          { text: 'new', authored: [mark('insert', 'bob', 1)] },
        ],
      },
    ];
    const editor = createEditor({
      plugins: [createAuthoredPlugin({ authorId: 'alice' })],
      initialValue: children,
    });

    assert.deepEqual(editor.read.children(), children);
  });
});
