import { createPlateEditor } from '@platejs/core/react';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';
import { BlockMenuPlugin } from './BlockMenuPlugin';

const createBlockSelectionEditor = () =>
  createPlateEditor({
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

const runSelectAllShortcut = (editor: ReturnType<typeof createPlateEditor>) =>
  editor.runtime.shortcuts['blockSelection.selectAll']?.handler?.({
    editor,
    event: new KeyboardEvent('keydown'),
    eventDetails: {},
  });

describe('BlockSelectionPlugin', () => {
  it('progresses from the current block to every selectable block', () => {
    const editor = createBlockSelectionEditor();

    editor.update.selection.set({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    expect(runSelectAllShortcut(editor)).toBe(true);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    expect(runSelectAllShortcut(editor)).toBe(true);
    expect([
      ...editor.plugin(BlockSelectionPlugin).getOption('selectedIds')!,
    ]).toEqual(['block1', 'block2']);
  });

  it('leaves select-all to the browser when custom handling is disabled', () => {
    const editor = createBlockSelectionEditor();

    editor.plugin(BlockSelectionPlugin).setOption('disableSelectAll', true);
    editor.update.selection.set({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    expect(runSelectAllShortcut(editor)).toBe(false);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
  });

  it('applies generic mark transforms to selected blocks', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    editor.update.marks.toggle('bold');

    expect(editor.read.children()[0].children[0]).toMatchObject({
      bold: true,
    });
    expect(editor.read.children()[1].children[0]).not.toHaveProperty('bold');
    expect([
      ...editor.plugin(BlockSelectionPlugin).getOption('selectedIds')!,
    ]).toEqual(['block1']);
  });

  it('applies generic node transforms to selected blocks', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    editor.update.nodes.set({ variant: 'lead' });

    expect(editor.read.children()[0]).toMatchObject({ variant: 'lead' });
    expect(editor.read.children()[1]).not.toHaveProperty('variant');
    expect([
      ...editor.plugin(BlockSelectionPlugin).getOption('selectedIds')!,
    ]).toEqual(['block1']);
  });

  it('clears selected blocks on ordinary selection changes', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    editor.update.selection.set({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    expect([
      ...editor.plugin(BlockSelectionPlugin).getOption('selectedIds')!,
    ]).toEqual([]);
  });

  it('keeps selected blocks when the block menu is open', () => {
    const editor = createBlockSelectionEditor();

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));
    editor.plugin(BlockMenuPlugin).setOption('openId', 'block1');

    editor.update.selection.set({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    expect([
      ...editor.plugin(BlockSelectionPlugin).getOption('selectedIds')!,
    ]).toEqual(['block1']);
  });
});
