import type { TableCellElement } from './BaseTablePlugin';
import { type Element, ElementApi, SelectionApi } from '@platejs/plite';

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
import { parseTableCellHtml } from './internal/codec';

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
        columnWidths: [120, 180],
        marginLeft: 12,
        type: 'table',
        children: [
          {
            height: 36,
            type: 'tableRow',
            children: [
              {
                backgroundColor: 'red',
                borders: {
                  top: {
                    color: 'blue',
                    width: 2,
                    style: 'dashed',
                  },
                },
                colSpan: 2,
                header: true,
                rowSpan: 3,
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
      type: editor.plugin(BaseTableCellPlugin).schema.type,
    };
    const thElement: TableCellElement = {
      children: [{ text: '' }],
      colSpan: 4,
      header: true,
      rowSpan: 5,
      type: editor.plugin(BaseTableCellPlugin).schema.type,
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

  it('recomputes imported spans when the same table DOM is mutated', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const table = new DOMParser()
      .parseFromString(
        '<table><tbody><tr><td><p>A</p></td><td><p>B</p></td></tr></tbody></table>',
        'text/html'
      )
      .body.querySelector<HTMLTableElement>('table');

    if (!table) throw new TypeError('Expected a table');

    expect(editor.api.html.deserialize({ element: table })).toMatchObject([
      { children: [{ children: [{}, {}] }] },
    ]);

    table.querySelector('td')?.setAttribute('colspan', '2');

    expect(editor.api.html.deserialize({ element: table })).toMatchObject([
      { children: [{ children: [{ colSpan: 2 }, {}] }] },
    ]);
  });

  it('does not retain span caches across direct cell decodes', () => {
    const table = new DOMParser()
      .parseFromString(
        '<table><tbody><tr><td colspan="2" rowspan="0"><p>A</p></td></tr><tr></tr></tbody></table>',
        'text/html'
      )
      .body.querySelector<HTMLTableElement>('table');
    const cell = table?.querySelector<HTMLTableCellElement>('td');

    if (!table || !cell) throw new TypeError('Expected a table cell');

    expect(parseTableCellHtml(cell)).toMatchObject({
      colSpan: 2,
      rowSpan: 2,
    });

    cell.setAttribute('colspan', '3');
    table.querySelector('tbody')?.append(document.createElement('tr'));

    expect(parseTableCellHtml(cell)).toMatchObject({
      colSpan: 3,
      rowSpan: 3,
    });
  });

  it('does not synthesize visible borders from incomplete or non-pixel CSS', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const table = editor.api.html.deserialize({
      element: `
        <table><tbody><tr>
          <td style="border-left-width: 2px"><p>A</p></td>
          <td style="border-left-color: red"><p>B</p></td>
          <td style="border-left: 0.2em solid red"><p>C</p></td>
          <td style="border-left: thin solid red"><p>D</p></td>
        </tr></tbody></table>
      `,
    })?.[0] as Element;

    for (const cell of (table.children[0] as Element).children) {
      expect(cell).not.toHaveProperty('borders');
    }
  });

  it('normalizes imported cell widths into table column widths', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <tbody>
              <tr>
                <td style="width: 60px"><p>A</p></td>
                <td colspan="2" style="width: 200px"><p>B</p></td>
              </tr>
            </tbody>
          </table>
        `,
      })
    ).toMatchObject([
      {
        columnWidths: [60, 100, 100],
        children: [
          {
            children: [{}, { colSpan: 2 }],
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('falls back to cell widths when a colgroup has no usable widths', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <colgroup><col /><col /></colgroup>
            <tbody>
              <tr>
                <td><p>Unsized A</p></td>
                <td><p>Unsized B</p></td>
              </tr>
              <tr>
                <td style="width: 80px"><p>A</p></td>
                <td style="width: 120px"><p>B</p></td>
              </tr>
            </tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [80, 120], type: 'table' }]);
  });

  it('retains partial imported column widths', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element:
          '<table><tbody><tr><td style="width:80px"><p>A</p></td><td><p>B</p></td></tr></tbody></table>',
      })
    ).toMatchObject([{ columnWidths: [80, null], type: 'table' }]);
  });

  it('treats nonpositive imported dimensions as unknown', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const decoded = editor.api.html.deserialize({
      element: `
        <table>
          <colgroup><col style="width:80px" /><col width="0" /></colgroup>
          <tbody><tr height="0"><td><p>A</p></td><td style="width:0px"><p>B</p></td></tr></tbody>
        </table>
      `,
    });
    const table = decoded?.[0];

    expect(table).toMatchObject({ columnWidths: [80, null], type: 'table' });
    expect((table as Element).children[0]).not.toHaveProperty('height');
  });

  it('does not convert percentage widths into pixel column widths', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const table = editor.api.html.deserialize({
      element:
        '<table><tbody><tr><td style="width:50%"><p>A</p></td></tr></tbody></table>',
    })?.[0];

    expect(table).not.toHaveProperty('columnWidths');
  });

  it('clamps hostile imported colspans', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const table = editor.api.html.deserialize({
      element:
        '<table><tbody><tr><td colspan="4294967296"><p>A</p></td></tr></tbody></table>',
    })?.[0] as Element;

    expect((table.children[0] as Element).children[0]).toMatchObject({
      colSpan: 1000,
      type: 'tableCell',
    });

    const truncated = editor.api.html.deserialize({
      element:
        '<table><colgroup><col width="80" /></colgroup><tbody><tr><td colspan="4294967296"><p>A</p></td><td colspan="4294967296"><p>B</p></td></tr></tbody></table>',
    })?.[0];

    const truncatedWidths = Reflect.get(truncated as object, 'columnWidths') as
      | Array<number | null>
      | undefined;

    expect(truncatedWidths).toHaveLength(1000);
    expect(truncatedWidths?.[0]).toBe(80);
    expect(truncatedWidths?.slice(1).every((width) => width === null)).toBe(
      true
    );
    const truncatedRow = (truncated as Element).children[0] as Element;
    const logicalColumns = truncatedRow.children.reduce((total, cell) => {
      const colSpan = ElementApi.isElement(cell)
        ? Reflect.get(cell, 'colSpan')
        : undefined;

      return total + (typeof colSpan === 'number' ? colSpan : 1);
    }, 0);

    expect(logicalColumns).toBe(1000);

    const rowSpanBounded = editor.api.html.deserialize({
      element:
        '<table><tbody><tr><td colspan="1000" rowspan="0"><p>A</p></td></tr><tr><td colspan="1000"><p>B</p></td></tr></tbody></table>',
    })?.[0] as Element;
    const firstRow = rowSpanBounded.children[0] as Element;
    const secondRow = rowSpanBounded.children[1] as Element;

    expect(firstRow.children[0]).toMatchObject({ colSpan: 999, rowSpan: 2 });
    expect(secondRow.children[0]).not.toHaveProperty('colSpan');

    const finiteRowSpan = editor.api.html.deserialize({
      element:
        '<table><tbody><tr><td colspan="1000" rowspan="2"><p>A</p></td></tr><tr></tr><tr><td><p>C</p></td></tr></tbody></table>',
    })?.[0] as Element;

    expect(
      (finiteRowSpan.children[0] as Element).children[0] as Element
    ).toMatchObject({
      colSpan: 1000,
      rowSpan: 2,
    });
  });

  it('parses spans with WHATWG non-negative integer semantics', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const table = editor.api.html.deserialize({
      element: `
        <table><tbody>
          <tr>
            <td colspan="1e3"><p>A</p></td>
            <td colspan="2x"><p>B</p></td>
            <td rowspan="999999"><p>C</p></td>
            <td rowspan="0e1"><p>D</p></td>
          </tr>
          <tr><td><p>E</p></td></tr>
        </tbody></table>
      `,
    })?.[0] as Element;
    const firstRow = table.children[0] as Element;

    expect(firstRow.children[0]).not.toHaveProperty('colSpan');
    expect(firstRow.children[1]).toMatchObject({ colSpan: 2 });
    expect(firstRow.children[2]).toMatchObject({ rowSpan: 65_534 });
    expect(firstRow.children[3]).toMatchObject({ rowSpan: 2 });
  });

  it('keeps row spans independent from the column safety cap', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const rowCount = 1001;
    const rows = Array.from({ length: rowCount }, (_, index) =>
      index === 0
        ? `<tr><td rowspan="${rowCount}"><p>A</p></td></tr>`
        : '<tr></tr>'
    ).join('');
    const table = editor.api.html.deserialize({
      element: `<table><tbody>${rows}</tbody></table>`,
    })?.[0] as Element;
    const firstCell = (table.children[0] as Element).children[0] as Element;

    expect(firstCell).toMatchObject({ rowSpan: rowCount, type: 'tableCell' });
  });

  it('merges partial colgroup and cell widths by column', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <colgroup><col style="width:80px" /><col /></colgroup>
            <tbody><tr><td><p>A</p></td><td style="width:120px"><p>B</p></td></tr></tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [80, 120], type: 'table' }]);
  });

  it('expands standard colgroup spans', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <colgroup><col span="2" width="80" /><col width="120" /></colgroup>
            <tbody><tr><td><p>A</p></td><td><p>B</p></td><td><p>C</p></td></tr></tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [80, 80, 120], type: 'table' }]);
  });

  it('subtracts known widths before distributing a colspan total', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <colgroup><col style="width:80px" /><col /></colgroup>
            <tbody><tr><td colspan="2" style="width:200px"><p>A</p></td></tr></tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [80, 120], type: 'table' }]);
  });

  it('prefers exact cell widths over earlier colspan inference', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table><tbody>
            <tr><td colspan="2" style="width:200px"><p>Span</p></td></tr>
            <tr><td style="width:80px"><p>A</p></td><td style="width:120px"><p>B</p></td></tr>
          </tbody></table>
        `,
      })
    ).toMatchObject([{ columnWidths: [80, 120], type: 'table' }]);
  });

  it('reconciles colspan totals after a later partial exact width', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table><tbody>
            <tr><td colspan="2" style="width:200px"><p>Span</p></td></tr>
            <tr><td style="width:80px"><p>A</p></td><td><p>B</p></td></tr>
          </tbody></table>
        `,
      })
    ).toMatchObject([{ columnWidths: [80, 120], type: 'table' }]);
  });

  it('keeps colgroup widths authoritative while solving colspans', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <colgroup><col width="80" /><col /></colgroup>
            <tbody>
              <tr><td style="width:100px"><p>A</p></td><td><p>B</p></td></tr>
              <tr><td colspan="2" style="width:200px"><p>Span</p></td></tr>
            </tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [80, 120], type: 'table' }]);
  });

  it('solves overlapping colspan constraints independently of row order', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const rows = {
      exact:
        '<tr><td><p>A</p></td><td><p>B</p></td><td style="width:120px"><p>C</p></td></tr>',
      first:
        '<tr><td colspan="2" style="width:200px"><p>AB</p></td><td><p>C</p></td></tr>',
      second:
        '<tr><td><p>A</p></td><td colspan="2" style="width:240px"><p>BC</p></td></tr>',
    };
    const deserialize = (orderedRows: string) =>
      editor.api.html.deserialize({
        element: `<table><tbody>${orderedRows}</tbody></table>`,
      })?.[0] as Element;
    const expectWidths = (table: Element) => {
      const widths = Reflect.get(table, 'columnWidths') as number[];

      expect(widths).toHaveLength(3);
      expect(widths[0]).toBeCloseTo(80, 5);
      expect(widths[1]).toBeCloseTo(120, 5);
      expect(widths[2]).toBe(120);
    };

    expectWidths(deserialize(rows.first + rows.second + rows.exact));
    expectWidths(deserialize(rows.second + rows.first + rows.exact));
  });

  it('drops every inferred width for impossible positive constraints', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const table = editor.api.html.deserialize({
      element: `
        <table><tbody>
          <tr><td colspan="2" style="width:10px"><p>XY</p></td><td><p>Z</p></td></tr>
          <tr><td colspan="3" style="width:60px"><p>XYZ</p></td></tr>
          <tr><td><p>X</p></td><td colspan="2" style="width:100px"><p>YZ</p></td></tr>
        </tbody></table>
      `,
    })?.[0];

    expect(table).not.toHaveProperty('columnWidths');
  });

  it('keeps valid underdetermined colspan solutions', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });
    const table = editor.api.html.deserialize({
      element: `
        <table><tbody>
          <tr><td colspan="3" style="width:300px"><p>XYZ</p></td></tr>
          <tr><td><p>X</p></td><td colspan="2" style="width:201px"><p>YZ</p></td></tr>
        </tbody></table>
      `,
    })?.[0] as Element;
    const widths = Reflect.get(table, 'columnWidths') as number[];

    expect(widths).toHaveLength(3);
    expect(widths.reduce((total, width) => total + width, 0)).toBeCloseTo(
      300,
      2
    );
    expect(widths[1] + widths[2]).toBeCloseTo(201, 2);
  });

  it('keeps a colspan width unknown when known columns exceed its total', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <colgroup><col style="width:100px" /><col /></colgroup>
            <tbody><tr><td colspan="2" style="width:80px"><p>A</p></td></tr></tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [100, null], type: 'table' }]);
  });

  it('places fallback widths in logical columns across row spans', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <tbody>
              <tr>
                <td rowspan="2" style="width: 80px"><p>A</p></td>
                <td><p>B</p></td>
              </tr>
              <tr>
                <td style="width: 120px"><p>C</p></td>
              </tr>
            </tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [80, 120], type: 'table' }]);
  });

  it('resolves rowspan zero through the remaining row group', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <tbody>
              <tr>
                <td rowspan="0" style="width: 80px"><p>A</p></td>
                <td><p>B</p></td>
              </tr>
              <tr><td style="width: 120px"><p>C</p></td></tr>
            </tbody>
          </table>
        `,
      })
    ).toMatchObject([
      {
        columnWidths: [80, 120],
        children: [{ children: [{ rowSpan: 2 }, {}] }, {}],
        type: 'table',
      },
    ]);

    expect(
      editor.api.html.deserialize({
        element: `
          <table><tbody>
            <tr><td rowspan=" 00 "><p>A</p></td><td><p>B</p></td></tr>
            <tr><td><p>C</p></td></tr>
          </tbody></table>
        `,
      })
    ).toMatchObject([
      { children: [{ children: [{ rowSpan: 2 }, {}] }, {}], type: 'table' },
    ]);
  });

  it('resets row-span occupancy between HTML row groups', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <thead><tr><td rowspan="2"><p>Header</p></td></tr></thead>
            <tbody><tr><td style="width: 120px"><p>Body</p></td></tr></tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [120], type: 'table' }]);
  });

  it('finds a fully open logical span for imported colspans', () => {
    const editor = createTestTableEditor({
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: `
          <table>
            <tbody>
              <tr>
                <td style="width: 50px"><p>A</p></td>
                <td rowspan="2" style="width: 80px"><p>B</p></td>
                <td><p>C</p></td>
                <td><p>D</p></td>
              </tr>
              <tr>
                <td colspan="2" style="width: 200px"><p>E</p></td>
              </tr>
            </tbody>
          </table>
        `,
      })
    ).toMatchObject([{ columnWidths: [50, 80, 100, 100], type: 'table' }]);
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
                  backgroundColor: 'red',
                  borders: {
                    top: { color: 'blue', style: 'dashed', width: 2 },
                  },
                  children: [
                    { children: [{ text: 'Header' }], type: 'paragraph' },
                  ],
                  colSpan: 2,
                  header: true,
                  type: 'tableCell',
                },
              ],
              height: 36,
              type: 'tableRow',
            },
          ],
          columnWidths: [120, 180],
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
    expect(header?.style.width).toBe('');
    expect(header?.textContent).toBe('Header');
  });
});
