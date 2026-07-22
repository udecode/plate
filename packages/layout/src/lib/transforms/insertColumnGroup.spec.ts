import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import { type TColumnGroupElement, NODES } from '@platejs/utils';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

describe('insertColumnGroup', () => {
  it('insert a column group with evenly sized columns', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      initialValue: [{ children: [{ text: 'Before' }], type: 'p' }],
    });

    editor.update.column.insertGroup({ at: [1], columns: 3 });

    const entry = editor.read.nodes.get<TColumnGroupElement>([1]);
    assert(entry);
    const [columnGroup] = entry;

    expect(BaseColumnPlugin.key).toBe('columnGroup');
    expect(BaseColumnPlugin.type).toBe(NODES.columnGroup);
    expect(columnGroup.type).toBe(NODES.columnGroup);
    expect(columnGroup.children).toHaveLength(3);
    expect(columnGroup.children[0].width).toContain('33.3333');
    expect(columnGroup.children[1].width).toContain('33.3333');
    expect(columnGroup.children[2].width).toContain('33.3333');
    expect(columnGroup.children[0].children[0]).toMatchObject({ type: 'p' });
  });

  it('select the first inserted block when asked', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      initialValue: [{ children: [{ text: 'Before' }], type: 'p' }],
    });

    editor.update.column.insertGroup({ at: [1], columns: 2, select: true });

    expect(editor.read.nodes.block()?.[1]).toEqual([1, 0, 0]);
  });
});
