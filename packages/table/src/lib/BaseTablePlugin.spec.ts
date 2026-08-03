import type { TableCellElement } from './BaseTablePlugin';
import { SelectionApi } from '@platejs/plite';

import { createTestTableEditor } from './__tests__/getTestTablePlugins';

import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from './BaseTablePlugin';
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '../react/TablePlugin';

describe('BaseTablePlugin', () => {
  it('declares exact required Base and React table dependencies', () => {
    expect(BaseTablePlugin.dependencies).toEqual([BaseTableRowPlugin]);
    expect(TablePlugin.dependencies).toEqual([TableRowPlugin]);
    expect(TableRowPlugin.dependencies).toEqual([TableCellPlugin]);
  });

  it.each([
    ['row', BaseTableRowPlugin.configure({ enabled: false })],
    ['cell', BaseTableCellPlugin.configure({ enabled: false })],
  ])('rejects a disabled required %s dependency', (_, dependency) => {
    expect(() =>
      createTestTableEditor({
        plugins: [BaseTablePlugin, dependency],
      })
    ).toThrow(/table.*disabled|disabled.*table/i);
  });

  it('translates HTML span attributes to canonical model fields', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const cellProps = editor.plugin(BaseTableCellPlugin).render?.nodeProps;
    const decoded = editor.api.html.deserialize({
      element: `
        <table style="margin-left: 12px">
          <colgroup>
            <col style="width: 120px" />
            <col style="width: 180px" />
          </colgroup>
          <tbody>
            <tr style="height: 36px">
              <th
                colspan="2"
                rowspan="3"
                style="background: red; border-top: 2px dashed blue; width: 120px"
              ><p>Header</p></th>
            </tr>
          </tbody>
        </table>
      `,
    });

    expect(decoded).toMatchObject([
      {
        colSizes: [120, 180],
        marginLeft: 12,
        type: 'table',
        children: [
          {
            size: 36,
            type: 'tableRow',
            children: [
              {
                background: 'red',
                borders: {
                  top: {
                    color: 'blue',
                    size: 2,
                    style: 'dashed',
                  },
                },
                colSpan: 2,
                header: true,
                rowSpan: 3,
                size: 120,
                type: 'tableCell',
              },
            ],
          },
        ],
      },
    ]);
    if (typeof cellProps !== 'function') {
      throw new TypeError('Table cell props must be functions');
    }

    const getProps = (props: Function, element: TableCellElement): unknown =>
      props({ element });

    const tdElement: TableCellElement = {
      children: [{ text: '' }],
      colSpan: 2,
      rowSpan: 3,
      type: editor.plugin(BaseTableCellPlugin).schema.element.type,
    };
    const thElement: TableCellElement = {
      children: [{ text: '' }],
      colSpan: 4,
      header: true,
      rowSpan: 5,
      type: editor.plugin(BaseTableCellPlugin).schema.element.type,
    };

    expect(getProps(cellProps, tdElement)).toEqual({
      colSpan: 2,
      rowSpan: 3,
    });
    expect(getProps(cellProps, thElement)).toEqual({
      colSpan: 4,
      rowSpan: 5,
    });
  });

  it('encodes table structure and presentation with standard HTML', () => {
    const point = { offset: 0, path: [0, 0, 0, 0, 0] };
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          children: [
            {
              children: [
                {
                  background: 'red',
                  borders: {
                    top: { color: 'blue', size: 2, style: 'dashed' },
                  },
                  children: [
                    { children: [{ text: 'Header' }], type: 'paragraph' },
                  ],
                  colSpan: 2,
                  header: true,
                  size: 120,
                  type: 'tableCell',
                },
              ],
              size: 36,
              type: 'tableRow',
            },
          ],
          colSizes: [120, 180],
          marginLeft: 12,
          type: 'table',
        },
      ],
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const table = new DOMParser()
      .parseFromString(data.getData('text/html'), 'text/html')
      .body.querySelector<HTMLTableElement>('table');
    const columns = table?.querySelectorAll<HTMLTableColElement>(
      ':scope > colgroup > col'
    );
    const row = table?.querySelector<HTMLTableRowElement>('tbody > tr');
    const header =
      table?.querySelector<HTMLTableCellElement>('tbody > tr > th');

    expect(table?.style.marginLeft).toBe('12px');
    expect(
      Array.from(columns ?? []).map((column) => column.style.width)
    ).toEqual(['120px', '180px']);
    expect(row?.style.height).toBe('36px');
    expect(header?.getAttribute('colspan')).toBe('2');
    expect(header?.style.background).toBe('red');
    expect(header?.style.borderTop).toContain('2px');
    expect(header?.style.width).toBe('120px');
    expect(header?.textContent).toBe('Header');
  });
});
