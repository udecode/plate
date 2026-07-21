import { createBaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { selectBlockSelectionNodes } from './selectBlockSelectionNodes';

describe('selectBlockSelectionNodes', () => {
  it('sets the editor selection through the editor update transaction', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
        {
          id: 'block2',
          children: [{ text: 'Two' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    editor.update((tx, context) => {
      selectBlockSelectionNodes(editor, tx, context);
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).toEqual(new Set());
  });

  it('sets a range across all selected blocks', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
        {
          id: 'block2',
          children: [{ text: 'Two' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1', 'block2']));

    editor.update((tx, context) => {
      selectBlockSelectionNodes(editor, tx, context);
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).toEqual(new Set());
  });

  it('does not mutate plugin state when no model range is found', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['missing']));

    const selectedIds = editor
      .plugin(BlockSelectionPlugin)
      .getOption('selectedIds');

    editor.update((tx, context) => {
      selectBlockSelectionNodes(editor, tx, context);
    });

    expect(editor.read.selection()).toBeNull();
    expect(editor.plugin(BlockSelectionPlugin).getOption('selectedIds')).toBe(
      selectedIds
    );
  });

  it('keeps plugin selection intact when publication rolls back', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));
    const selectedIds = editor
      .plugin(BlockSelectionPlugin)
      .getOption('selectedIds');

    expect(() =>
      editor.update((tx, context) => {
        selectBlockSelectionNodes(editor, tx, context);
        throw new Error('rollback');
      })
    ).toThrow('rollback');
    expect(editor.read.selection()).toBeNull();
    expect(editor.plugin(BlockSelectionPlugin).getOption('selectedIds')).toBe(
      selectedIds
    );
  });

  it('reads blocks inserted earlier in the same transaction', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block2']));

    editor.update((tx, context) => {
      tx.nodes.insert(
        { id: 'block2', children: [{ text: 'Two' }], type: 'p' },
        { at: [1] }
      );
      selectBlockSelectionNodes(editor, tx, context);
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
    ).toEqual(new Set());
  });
});
