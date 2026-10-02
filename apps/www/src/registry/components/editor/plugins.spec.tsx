import { describe, expect, it } from 'bun:test';

import { createEditor } from 'platejs/react';
import { TablePlugin } from 'platejs/table/react';

describe('EditorKit table policy', () => {
  it('supplies a usable default width for imported tables', async () => {
    const { EditorKit } = await import('./plugins');
    const editor = createEditor({
      plugins: EditorKit,
      initialValue: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'A' }], type: 'paragraph' }],
                  type: 'tableCell',
                },
                {
                  children: [{ children: [{ text: 'B' }], type: 'paragraph' }],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ],
    });
    const table = editor.read.children()[0];

    expect(editor.plugin(TablePlugin).api.columnWidths(table)).toEqual([
      300, 300,
    ]);
  });
});
