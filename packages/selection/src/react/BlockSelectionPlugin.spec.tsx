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

describe('BlockSelectionPlugin', () => {
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
