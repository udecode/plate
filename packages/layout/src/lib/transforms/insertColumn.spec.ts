import type { Value } from 'platejs';
import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';
import type { ColumnEditor } from './ColumnEditor';
import { insertColumn } from './insertColumn';

type ColumnTestEditor = ColumnEditor & { children: Value };

const createColumnTestEditor = (value: Value): ColumnTestEditor =>
  createPlateRuntimeEditor({
    initialValue: value,
    plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
  }) as unknown as ColumnTestEditor;

describe('insertColumn', () => {
  it('insert a column with the default width and an empty block', () => {
    const editor = createColumnTestEditor([
      {
        children: [
          {
            children: [{ children: [{ text: 'First' }], type: 'p' }],
            type: 'column',
            width: '67%',
          },
        ],
        type: 'column_group',
      },
    ]);

    insertColumn(editor, { at: [0, 1] });

    const columnGroup = editor.children[0] as any;

    expect(columnGroup.children).toHaveLength(2);
    expect(columnGroup.children[1].type).toBe('column');
    expect(columnGroup.children[1].width).toBe('33%');
    expect(columnGroup.children[0].width).toBe('67%');
    expect(columnGroup.children[1].children[0].type).toBe('p');
    expect(columnGroup.children[1].children[0].children[0].text).toBe('');
  });

  it('respect a custom width and insertion path', () => {
    const editor = createColumnTestEditor([
      {
        children: [
          {
            children: [{ children: [{ text: 'Existing' }], type: 'p' }],
            type: 'column',
            width: '75%',
          },
        ],
        type: 'column_group',
      },
    ]);

    insertColumn(editor, { at: [0, 0], width: '25%' });

    const columnGroup = editor.children[0] as any;

    expect(columnGroup.children).toHaveLength(2);
    expect(columnGroup.children[0].width).toBe('25%');
    expect(columnGroup.children[1].width).toBe('75%');
    expect(columnGroup.children[0].children[0].children[0].text).toBe('');
    expect(columnGroup.children[1].children[0].children[0].text).toBe(
      'Existing'
    );
  });
});
