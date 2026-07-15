import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { TColumnGroupElement } from '@platejs/utils';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

const getColumnGroupEntry = (editor: ReturnType<typeof createBaseEditor>) => {
  const entry = editor.read.nodes.get<TColumnGroupElement>([0]);
  assert(entry);

  return entry;
};

describe('moveMiddleColumn', () => {
  it('merge a non-empty middle column into the first column and remove the wrapper', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'Left' }], type: 'p' }],
              type: 'column',
              width: '33%',
            },
            {
              children: [{ children: [{ text: 'Middle' }], type: 'p' }],
              type: 'column',
              width: '33%',
            },
            {
              children: [{ children: [{ text: 'Right' }], type: 'p' }],
              type: 'column',
              width: '34%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    editor.update.column.moveMiddle(getColumnGroupEntry(editor), {
      direction: 'left',
    });

    const [columnGroup] = getColumnGroupEntry(editor);

    expect(columnGroup.children).toHaveLength(2);
    expect(editor.read.text.string([0, 0])).toBe('LeftMiddle');
    expect(editor.read.text.string([0, 1])).toBe('Right');
  });

  it('remove an empty middle column and report failure', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'Left' }], type: 'p' }],
              type: 'column',
              width: '33%',
            },
            {
              children: [{ children: [{ text: '' }], type: 'p' }],
              type: 'column',
              width: '33%',
            },
            {
              children: [{ children: [{ text: 'Right' }], type: 'p' }],
              type: 'column',
              width: '34%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    const result = editor.update.column.moveMiddle(
      getColumnGroupEntry(editor),
      { direction: 'left' }
    );
    const [columnGroup] = getColumnGroupEntry(editor);

    expect(result).toBe(false);
    expect(columnGroup.children).toHaveLength(2);
    expect(editor.read.text.string([0, 0])).toBe('Left');
    expect(editor.read.text.string([0, 1])).toBe('Right');
  });
});
