import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { TColumnGroupElement } from '@platejs/utils';

import { BaseColumnPlugin } from '../BaseColumnPlugin';

const createEditor = (value = twoColumns) =>
  createBaseEditor({ plugins: [BaseColumnPlugin], value });

const getColumnGroup = (editor: ReturnType<typeof createEditor>) => {
  const entry = editor.read.nodes.get<TColumnGroupElement>([0]);
  assert(entry);

  return entry[0];
};

const twoColumns = [
  {
    children: [
      {
        children: [{ children: [{ text: 'Column 1 text' }], type: 'p' }],
        type: 'column',
        width: '50%',
      },
      {
        children: [{ children: [{ text: 'Column 2 text' }], type: 'p' }],
        type: 'column',
        width: '50%',
      },
    ],
    type: 'column_group',
  },
];

describe('setColumns', () => {
  it('updates widths without changing content', () => {
    const editor = createEditor();

    editor.update.column.set({ at: [0], widths: ['30%', '70%'] });

    const group = getColumnGroup(editor);

    expect(group.children.map((column) => column.width)).toEqual([
      '30%',
      '70%',
    ]);
    expect(editor.read.text.string([0, 0])).toBe('Column 1 text');
    expect(editor.read.text.string([0, 1])).toBe('Column 2 text');
  });

  it('adds empty columns while preserving existing content', () => {
    const editor = createEditor();

    editor.update.column.set({
      at: [0],
      widths: ['33%', '33%', '34%'],
    });

    const group = getColumnGroup(editor);

    expect(group.children.map((column) => column.width)).toEqual([
      '33%',
      '33%',
      '34%',
    ]);
    expect(editor.read.text.string([0, 0])).toBe('Column 1 text');
    expect(editor.read.text.string([0, 1])).toBe('Column 2 text');
    expect(editor.read.text.string([0, 2])).toBe('');
  });

  it('merges removed column content into the last kept column', () => {
    const editor = createEditor([
      {
        children: [
          {
            children: [{ children: [{ text: 'A' }], type: 'p' }],
            type: 'column',
            width: '25%',
          },
          {
            children: [{ children: [{ text: 'B' }], type: 'p' }],
            type: 'column',
            width: '25%',
          },
          {
            children: [{ children: [{ text: 'C' }], type: 'p' }],
            type: 'column',
            width: '25%',
          },
          {
            children: [{ children: [{ text: 'D' }], type: 'p' }],
            type: 'column',
            width: '25%',
          },
        ],
        type: 'column_group',
      },
    ]);

    editor.update.column.set({ at: [0], widths: ['50%', '50%'] });

    const group = getColumnGroup(editor);

    expect(group.children).toHaveLength(2);
    expect(group.children.map((column) => column.width)).toEqual([
      '50%',
      '50%',
    ]);
    expect(editor.read.text.string([0, 0])).toBe('A');
    expect(editor.read.text.string([0, 1])).toBe('BCD');
  });

  it('preserves content across repeated column count changes', () => {
    const editor = createEditor();

    editor.update.column.set({
      at: [0],
      widths: ['33%', '33%', '34%'],
    });
    editor.update.nodes.insert(
      { children: [{ text: 'Column 3 text' }], type: 'p' },
      { at: [0, 2, 1] }
    );
    editor.update.column.set({ at: [0], widths: ['50%', '50%'] });
    editor.update.column.set({
      at: [0],
      widths: ['33%', '33%', '34%'],
    });

    expect(editor.read.text.string([0, 0])).toBe('Column 1 text');
    expect(editor.read.text.string([0, 1])).toBe('Column 2 textColumn 3 text');
    expect(editor.read.text.string([0, 2])).toBe('');
  });

  it('does nothing without a valid target or widths', () => {
    const editor = createEditor();

    editor.update.column.set({ widths: ['100%'] });
    editor.update.column.set({ at: [999], widths: ['100%'] });
    editor.update.column.set({ at: [0], widths: [] });

    expect(editor.read.children()).toEqual(twoColumns);
  });

  it('normalizes widths through the column group normalizer', () => {
    const editor = createEditor();

    editor.update.column.set({ at: [0], widths: ['40%', '40%'] });

    const group = getColumnGroup(editor);

    expect(group.children.map((column) => column.width)).toEqual([
      '50%',
      '50%',
    ]);
  });
});
