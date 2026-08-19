import type { Element } from '@platejs/plite';

import { createTestTableEditor } from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';

describe('table HTML width constraints', () => {
  it('converges across constraint chains longer than 64 columns', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const columnCount = 66;
    const constraintRows = Array.from(
      { length: columnCount - 1 },
      (_, index) =>
        `<tr>${'<td><p></p></td>'.repeat(index)}<td colspan="2" style="width:100px"><p>Span</p></td></tr>`
    ).join('');
    const exactRow = `<tr>${'<td><p></p></td>'.repeat(columnCount - 1)}<td style="width:50px"><p>Exact</p></td></tr>`;
    const table = editor.api.html.deserialize({
      element: `<table><tbody>${constraintRows}${exactRow}</tbody></table>`,
    })?.[0] as Element;
    const widths = Reflect.get(table, 'columnWidths') as number[];

    expect(widths).toHaveLength(columnCount);
    widths.forEach((width) => {
      expect(width).toBeCloseTo(50, 5);
    });
  });
});
