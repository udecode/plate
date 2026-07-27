import { createBaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

describe('selectBlockSelectionNodes', () => {
  it('sets the editor selection through the editor update transaction', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      initialValue: [
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
      .store.set({ selectedIds: new Set(['block1']) });

    editor.update((tx) => {
      tx.blockSelection.select();
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedIds')
    ).toEqual(new Set());
  });

  it('sets a range across all selected blocks', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      initialValue: [
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
      .store.set({ selectedIds: new Set(['block1', 'block2']) });

    editor.update((tx) => {
      tx.blockSelection.select();
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedIds')
    ).toEqual(new Set());
  });

  it('does not mutate plugin state when no model range is found', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['missing']) });

    const selectedIds = editor
      .plugin(BlockSelectionPlugin)
      .store.get('selectedIds');

    editor.update((tx) => {
      tx.blockSelection.select();
    });

    expect(editor.read.selection()).toBeNull();
    expect(editor.plugin(BlockSelectionPlugin).store.get('selectedIds')).toBe(
      selectedIds
    );
  });

  it('keeps plugin selection intact when publication rolls back', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['block1']) });
    const selectedIds = editor
      .plugin(BlockSelectionPlugin)
      .store.get('selectedIds');

    expect(() =>
      editor.update((tx) => {
        tx.blockSelection.select();
        throw new Error('rollback');
      })
    ).toThrow('rollback');
    expect(editor.read.selection()).toBeNull();
    expect(editor.plugin(BlockSelectionPlugin).store.get('selectedIds')).toBe(
      selectedIds
    );
  });

  it('reads blocks inserted earlier in the same transaction', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      initialValue: [
        {
          id: 'block1',
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['block2']) });

    editor.update((tx) => {
      tx.nodes.insert(
        { id: 'block2', children: [{ text: 'Two' }], type: 'p' },
        { at: [1] }
      );
      tx.blockSelection.select();
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 3, path: [1, 0] },
    });
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedIds')
    ).toEqual(new Set());
  });
});
