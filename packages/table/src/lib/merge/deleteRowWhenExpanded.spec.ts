import { createSlateEditor } from 'platejs';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import * as tableLib from '..';
import * as tableQueries from '../queries';
import { deleteRowWhenExpanded } from './deleteRowWhenExpanded';

describe('deleteRowWhenExpanded', () => {
  afterEach(() => {
    mock.restore();
  });

  it('removes every carried row when a selected row includes a rowspan cell', () => {
    const editor = createSlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins({ disableMerge: true }),
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: '11' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    } as any);
    const removeNodesSpy = spyOn(editor.tf, 'removeNodes').mockImplementation(
      () => {}
    );

    spyOn(tableQueries, 'getTableGridAbove').mockReturnValue([
      [{ children: [], rowSpan: 2, type: 'td' } as any, [0, 0, 0]],
      [{ children: [], type: 'td' } as any, [0, 0, 1]],
      [{ children: [], type: 'td' } as any, [0, 1, 0]],
    ] as any);
    spyOn(tableLib, 'getTableMergedColumnCount').mockReturnValue(2);
    spyOn(tableLib, 'getCellRowIndexByPath').mockImplementation(
      (path: any) => path.at(-2) ?? null
    );
    spyOn(
      editor.getApi(tableLib.BaseTablePlugin).table,
      'getRowSpan'
    ).mockImplementation((cell: any) => cell.rowSpan ?? 1);

    deleteRowWhenExpanded(editor, [editor.children[0] as any, [0]] as any);

    expect(removeNodesSpy.mock.calls).toEqual([
      [{ at: [0, 0] }],
      [{ at: [0, 1] }],
    ]);
  });
});
