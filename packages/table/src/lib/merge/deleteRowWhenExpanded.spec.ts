import assert from 'node:assert/strict';
import { createPlateEditor } from '@platejs/core/react';
import type { TTableElement } from '@platejs/utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';

describe('deleteRowWhenExpanded', () => {
  it('removes every row covered by a selected rowspan cell', () => {
    const editor = createPlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins({ disableMerge: true }),
      selection: {
        anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 1, 0, 0] },
        kind: 'text',
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: '11' }], type: 'p' }],
                  rowSpan: 2,
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: '12' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: '22' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: '31' }], type: 'p' }],
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: '32' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    editor.update.remove.tableRow();

    const table = editor.read.nodes.get<TTableElement>([0]);
    assert(table);

    expect(table[0].children).toHaveLength(1);
    expect(editor.read.text.string([0])).toBe('3132');
  });
});
