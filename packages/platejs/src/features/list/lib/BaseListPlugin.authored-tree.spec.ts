import { createAuthoredPlugin } from 'plitejs/authored';

import { authoredTestApi } from '../../../authored/__tests__/authoredTestApi';
import { createEditor } from '../../../core';
import { BaseParagraphPlugin } from '../../../lib';
import { BaseIndentPlugin } from '../../indent';
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
        // refuses list property writes.
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

it('records text inserted at the start of a numbered list paragraph while Suggesting', () => {
  const editor = createEditor({
    initialValue: [
      {
        children: [{ text: 'item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
    ],
    plugins: [
      BaseParagraphPlugin,
      BaseIndentPlugin.configure({ targetPlugins: ['paragraph'] }),
      BaseListPlugin.configure({ targetPlugins: ['paragraph'] }),
      createAuthoredPlugin({ authorId: 'bob', intent: 'propose' }),
    ],
  });
  const refusals: unknown[] = [];

  editor.api.authored.subscribeRefusals((refusal) => refusals.push(refusal));
  editor.update((tx) => {
    tx.text.insert('X', { at: { offset: 0, path: [0, 0] } });
  });

  expect(refusals).toEqual([]);
  expect(editor.read.text.string([0])).toBe('Xitem');
  expect(editor.read.authored.changes().items).toHaveLength(1);
});

describe('S14 Suggesting text in a list item around a refused Enter', () => {
  it('keeps the item and caret after Enter refuses, then records more text', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'item' }],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({ targetPlugins: ['paragraph'] }),
        BaseListPlugin.configure({ targetPlugins: ['paragraph'] }),
        createAuthoredPlugin({ authorId: 'bob', intent: 'propose' }),
      ],
    });
    const refusals: unknown[] = [];
    const original = editor.read.children();

    editor.api.authored.subscribeRefusals((refusal) => refusals.push(refusal));
    editor.update((tx) => tx.selection.set({ offset: 4, path: [0, 0] }));
    editor.update((tx) => tx.text.insert(' now'));

    expect(refusals).toEqual([]);
    expect(editor.read.text.string([0])).toBe('item now');
    expect(editor.read.authored.changes().items).toHaveLength(1);

    const before = editor.read.value();
    const selection = editor.read.selection();

    editor.update((tx) => tx.break.insert());

    expect(refusals).toEqual([
      expect.objectContaining({ code: 'veto', reasons: ['list'] }),
    ]);
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.selection()).toEqual(selection);

    editor.update((tx) => tx.text.insert('new'));

    expect(editor.read.children()).toHaveLength(1);
    expect(editor.read.text.string([0])).toBe('item nownew');
    expect(editor.read.authored.changes().items.length).toBeGreaterThan(0);
    expect(refusals).toHaveLength(1);

    authoredTestApi(editor).decide({
      action: 'reject',
      changes: editor.read.authored.changes().items.map(({ id }) => id),
    });

    expect(editor.read.children()).toEqual(original);
  });
});
