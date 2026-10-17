import { createAuthoredPlugin } from 'plitejs/authored';

import { authoredTestApi } from '../../../authored/__tests__/authoredTestApi';
import { createEditor } from '../../../core';
import { BaseListPlugin } from './BaseListPlugin';

// S3 of docs/plans/2026-10-10-authored-values.md: a split copies the pending
// writes of the keys it keeps, and only those.
describe('list items an Enter splits after a pending property write', () => {
  it('leaves the continued item without a listStart the split drops', () => {
    const editor = (value: unknown, author: string) => {
      const proof = createAuthoredPlugin({
        authorId: author,
        createChangeId: () => `${author}:1`,
        intent: 'propose',
        now: () => 1,
        // Pending list changes arrive as loaded content while Suggesting
        // refuses lists.
        vetoes: false,
      });

      return createEditor({
        initialValue: value as never,
        plugins: [BaseListPlugin, proof],
      });
    };
    const alice = editor(
      [
        {
          children: [{ text: 'ab' }],
          indent: 1,
          listStart: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      'alice'
    );

    alice.update((tx) => tx.nodes.set({ listStart: 3 } as never, { at: [0] }));
    const bob = editor(alice.read.value().children, 'bob');

    bob.update((tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.break.insert();
    });
    const judge = editor(bob.read.value().children, 'zed');

    authoredTestApi(judge).decide({ action: 'reject', changes: ['alice:1'] });

    expect(
      (judge.read.children() as ReadonlyArray<{ listStart?: number }>).map(
        (node) => node.listStart ?? null
      )
    ).toEqual([1, null]);
  });
});
