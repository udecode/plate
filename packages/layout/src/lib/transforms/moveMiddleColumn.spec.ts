import { createBaseEditor } from '@platejs/core';
import type { TColumnGroupElement } from '@platejs/utils';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

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

    editor.update.column.moveMiddle(
      editor.read.nodes.get<TColumnGroupElement>([0], { required: true }),
      {
        direction: 'left',
      }
    );

    const columnGroup = editor.read.nodes.get<TColumnGroupElement>([0], {
      required: true,
    })[0];

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
      editor.read.nodes.get<TColumnGroupElement>([0], { required: true }),
      { direction: 'left' }
    );
    const columnGroup = editor.read.nodes.get<TColumnGroupElement>([0], {
      required: true,
    })[0];

    expect(result).toBe(false);
    expect(columnGroup.children).toHaveLength(2);
    expect(editor.read.text.string([0, 0])).toBe('Left');
    expect(editor.read.text.string([0, 1])).toBe('Right');
  });
});
