import type { Value } from 'platejs';
import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';
import type { ColumnEditor } from './ColumnEditor';
import { insertColumnGroup } from './insertColumnGroup';

type ColumnTestEditor = ColumnEditor & { children: Value };

const createColumnTestEditor = (value: Value): ColumnTestEditor =>
  createPlateRuntimeEditor({
    initialValue: value,
    plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
  }) as unknown as ColumnTestEditor;

describe('insertColumnGroup', () => {
  it('insert a column group with evenly sized columns', () => {
    const editor = createColumnTestEditor([
      { children: [{ text: 'Before' }], type: 'p' },
    ]);

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
    const editor = createColumnTestEditor([
      { children: [{ text: 'Before' }], type: 'p' },
    ]);

    insertColumnGroup(editor, { at: [1], columns: 2, select: true });

    expect(editor.api.block()?.[1]).toEqual([1, 0, 0]);
  });
});
