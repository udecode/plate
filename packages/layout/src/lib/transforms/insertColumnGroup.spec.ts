import { createSlateEditor } from 'platejs';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';
import { insertColumnGroup } from './insertColumnGroup';

describe('insertColumnGroup', () => {
  it('insert a column group with evenly sized columns', () => {
    const editor = createSlateEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: [{ children: [{ text: 'Before' }], type: 'p' }],
    });

    insertColumnGroup(editor, { at: [1], columns: 3 });

    const columnGroup = editor.children[1] as any;

    expect(columnGroup.type).toBe('column_group');
    expect(columnGroup.children).toHaveLength(3);
    expect(columnGroup.children[0].width).toContain('33.3333');
    expect(columnGroup.children[1].width).toContain('33.3333');
    expect(columnGroup.children[2].width).toContain('33.3333');
    expect(columnGroup.children[0].children[0].type).toBe('p');
  });

  it('select the first inserted block when asked', () => {
    const editor = createSlateEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: [{ children: [{ text: 'Before' }], type: 'p' }],
    });

    insertColumnGroup(editor, { at: [1], columns: 2, select: true });

    expect(editor.api.block()?.[1]).toEqual([1, 0, 0]);
  });
});
