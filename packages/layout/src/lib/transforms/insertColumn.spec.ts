import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { TColumnGroupElement } from '@platejs/utils';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

describe('insertColumn', () => {
  it('insert a column with the default width and an empty block', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
    });

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'First' }], type: 'p' }],
                type: 'column',
                width: '34%',
              },
              {
                children: [{ children: [{ text: 'Second' }], type: 'p' }],
                type: 'column',
                width: '33%',
              },
            ],
            type: 'column_group',
          },
        ],
      });
      tx.column.insert({ at: [0, 2] });
    });

    const entry = editor.read.nodes.get<TColumnGroupElement>([0]);
    assert(entry);
    const [columnGroup] = entry;

    expect(columnGroup.children).toHaveLength(3);
    expect(columnGroup.children[2].type).toBe('column');
    expect(columnGroup.children[2].width).toBe('33%');
    expect(columnGroup.children[0].width).toBe('34%');
    expect(columnGroup.children[2].children[0]).toMatchObject({ type: 'p' });
  });

  it('respect a custom width and insertion path', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
    });

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'Existing' }], type: 'p' }],
                type: 'column',
                width: '50%',
              },
              {
                children: [{ children: [{ text: 'Second' }], type: 'p' }],
                type: 'column',
                width: '25%',
              },
            ],
            type: 'column_group',
          },
        ],
      });
      tx.column.insert({ at: [0, 0], width: '25%' });
    });

    const entry = editor.read.nodes.get<TColumnGroupElement>([0]);
    assert(entry);
    const [columnGroup] = entry;

    expect(columnGroup.children).toHaveLength(3);
    expect(columnGroup.children[0].width).toBe('25%');
    expect(columnGroup.children[1].width).toBe('50%');
    expect(editor.read.text.string([0, 0])).toBe('');
    expect(editor.read.text.string([0, 1])).toBe('Existing');
  });
});
