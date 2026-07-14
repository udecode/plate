import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';
import type { Value } from '@platejs/plite';
import type { TTableCellElement } from '@platejs/utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { BaseTablePlugin } from '../BaseTablePlugin';
import { getCellIndices } from './getCellIndices';

const value: Value = [
  {
    children: [
      {
        children: [
          {
            children: [{ children: [{ text: '11' }], type: 'p' }],
            id: 'c11',
            type: 'td',
          },
          {
            children: [{ children: [{ text: '12' }], type: 'p' }],
            id: 'c12',
            type: 'td',
          },
        ],
        type: 'tr',
      },
    ],
    type: 'table',
  },
];

describe('getCellIndices', () => {
  it('computes and caches indices on the table plugin', () => {
    const editor = createPlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins(),
      value,
    });
    const cell = editor.read.nodes.get<TTableCellElement>([0, 0, 1], {
      required: true,
    })[0];

    expect(getCellIndices(editor, cell)).toEqual({ col: 1, row: 0 });
    expect(
      editor.plugin(BaseTablePlugin).getOptions()._cellIndices.c12
    ).toEqual({ col: 1, row: 0 });
    expect(getCellIndices(editor, cell)).toEqual({ col: 1, row: 0 });
  });

  it('warns and falls back when the cell does not belong to a table', () => {
    const warn = mock();
    const DebugPlugin = createPlatePlugin({
      key: 'table-test-debug',
    }).extendEditorApi(() => ({ debug: { warn } }));
    const orphanValue: Value = [{ children: [{ text: '' }], type: 'p' }];
    const editor = createPlateEditor({
      plugins: [...getTestTablePlugins(), DebugPlugin],
      value: orphanValue,
    });
    const cell: TTableCellElement = {
      children: [{ text: '' }],
      id: 'orphan',
      type: 'td',
    };

    expect(getCellIndices(editor, cell)).toEqual({ col: 0, row: 0 });
    expect(warn).toHaveBeenCalledWith(
      'No cell indices found for element. Make sure all table cells have an id.',
      'TABLE_CELL_INDICES'
    );
  });
});
