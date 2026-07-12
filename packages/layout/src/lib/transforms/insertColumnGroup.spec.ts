import { createBaseEditor } from '@platejs/core';
import type { TColumnGroupElement } from '@platejs/utils';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

describe('insertColumnGroup', () => {
  it('insert a column group with evenly sized columns', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: [{ children: [{ text: 'Before' }], type: 'p' }],
    });

    editor.update.column.insertGroup({ at: [1], columns: 3 });

    const columnGroup = editor.read.nodes.get<TColumnGroupElement>([1], {
      required: true,
    })[0];

    expect(columnGroup.type).toBe('column_group');
    expect(columnGroup.children).toHaveLength(3);
    expect(columnGroup.children[0].width).toContain('33.3333');
    expect(columnGroup.children[1].width).toContain('33.3333');
    expect(columnGroup.children[2].width).toContain('33.3333');
    expect(columnGroup.children[0].children[0]).toMatchObject({ type: 'p' });
  });

  it('select the first inserted block when asked', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: [{ children: [{ text: 'Before' }], type: 'p' }],
    });

    editor.update.column.insertGroup({ at: [1], columns: 2, select: true });

    expect(editor.read.nodes.block()?.[1]).toEqual([1, 0, 0]);
  });
});
