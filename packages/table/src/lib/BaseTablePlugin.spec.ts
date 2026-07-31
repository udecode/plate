import { KEYS } from '@platejs/utils';
import type { TTableCellElement } from '@platejs/utils';
import { createPlateEditor } from '@platejs/core/react';
import { SelectionApi } from '@platejs/plite';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from './BaseTablePlugin';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '../react/TablePlugin';

describe('BaseTablePlugin', () => {
  it('declares exact required Base and React table dependencies', () => {
    expect(BaseTablePlugin.dependencies).toEqual([
      BaseTableRowPlugin,
      BaseTableCellPlugin,
      BaseTableCellHeaderPlugin,
    ]);
    expect(TablePlugin.dependencies).toEqual([
      TableRowPlugin,
      TableCellPlugin,
      TableCellHeaderPlugin,
    ]);
  });

  it.each([
    ['row', BaseTableRowPlugin.configure({ enabled: false })],
    ['cell', BaseTableCellPlugin.configure({ enabled: false })],
    ['header cell', BaseTableCellHeaderPlugin.configure({ enabled: false })],
  ])('rejects a disabled required %s dependency', (_, dependency) => {
    expect(() =>
      createPlateEditor({
        plugins: [BaseTablePlugin, dependency],
      })
    ).toThrow(/table.*disabled|disabled.*table/i);
  });

  it('translates HTML span attributes to canonical model fields', () => {
    const editor = createPlateEditor({
      plugins: [BaseTablePlugin],
    });
    const tdProps = editor.plugin(BaseTableCellPlugin).plugin.render?.nodeProps;
    const thProps = editor.plugin(BaseTableCellHeaderPlugin).plugin.render
      ?.nodeProps;
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
        type: KEYS.table,
        children: [
          {
            size: 36,
            type: KEYS.tr,
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
                rowSpan: 3,
                size: 120,
                type: KEYS.th,
              },
            ],
          },
        ],
      },
    ]);
    if (typeof tdProps !== 'function' || typeof thProps !== 'function') {
      throw new TypeError('Table cell props must be functions');
    }

    const getProps = (props: Function, element: TTableCellElement): unknown =>
      props({ element });

    const tdElement: TTableCellElement = {
      children: [{ text: '' }],
      colSpan: 2,
      rowSpan: 3,
      type: editor.plugin(KEYS.td).type,
    };
    const thElement: TTableCellElement = {
      children: [{ text: '' }],
      colSpan: 4,
      rowSpan: 5,
      type: editor.plugin(KEYS.th).type,
    };

    expect(getProps(tdProps, tdElement)).toEqual({
      colSpan: 2,
      rowSpan: 3,
    });
    expect(getProps(thProps, thElement)).toEqual({
      colSpan: 4,
      rowSpan: 5,
    });
  });

  it('encodes table structure and presentation with standard HTML', () => {
    const point = { offset: 0, path: [0, 0, 0, 0, 0] };
    const editor = createPlateEditor({
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
                  children: [{ children: [{ text: 'Header' }], type: KEYS.p }],
                  colSpan: 2,
                  size: 120,
                  type: KEYS.th,
                },
              ],
              size: 36,
              type: KEYS.tr,
            },
          ],
          colSizes: [120, 180],
          marginLeft: 12,
          type: KEYS.table,
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
