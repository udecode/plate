import type { Value } from 'platejs';
import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';
import type { ColumnEditor } from './ColumnEditor';
import { moveMiddleColumn } from './moveMiddleColumn';

type ColumnTestEditor = ColumnEditor & { children: Value };

const createColumnTestEditor = (value: Value): ColumnTestEditor =>
  createPlateRuntimeEditor({
    initialValue: value,
    plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
  }) as unknown as ColumnTestEditor;

describe('moveMiddleColumn', () => {
  it('merge a non-empty middle column into the first column and remove the wrapper', () => {
    const editor = createColumnTestEditor([
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
    ]);

    moveMiddleColumn(editor, editor.api.node([0])! as any, {
      direction: 'left',
    });

    const columnGroup = editor.children[0] as any;

    expect(columnGroup.children).toHaveLength(2);
    expect(columnGroup.children[0].children[0].children[0].text).toBe('Left');
    expect(columnGroup.children[0].children[1].children[0].text).toBe('Middle');
    expect(columnGroup.children[1].children[0].children[0].text).toBe('Right');
  });

  it('remove an empty middle column and report failure', () => {
    const editor = createColumnTestEditor([
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
    ]);

    const result = moveMiddleColumn(editor, editor.api.node([0])! as any, {
      direction: 'left',
    });
    const columnGroup = editor.children[0] as any;

    expect(result).toBe(false);
    expect(columnGroup.children).toHaveLength(2);
    expect(columnGroup.children[0].children[0].children[0].text).toBe('Left');
    expect(columnGroup.children[1].children[0].children[0].text).toBe('Right');
  });
});
