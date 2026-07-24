import { KEYS } from '@platejs/utils';
import type { TTableCellElement } from '@platejs/utils';
import { createPlateEditor } from '@platejs/core/react';

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

  it('parses table cell background styles and attribute props', () => {
    const editor = createPlateEditor({
      plugins: [BaseTablePlugin],
    });

    const tdParse =
      editor.getPlugin(BaseTableCellPlugin).parsers!.html!.deserializer!.parse!;
    const thParse = editor.getPlugin(BaseTableCellHeaderPlugin).parsers!.html!
      .deserializer!.parse!;
    const tdProps = editor.getPlugin(BaseTableCellPlugin).render?.nodeProps;
    const thProps = editor.getPlugin(BaseTableCellHeaderPlugin).render
      ?.nodeProps;
    const td = document.createElement('td');
    const th = document.createElement('th');
    td.style.backgroundColor = 'rgb(1, 2, 3)';
    th.style.background = 'red';

    const parseCell = <TParse extends (options: never) => unknown>(
      parse: TParse,
      element: HTMLTableCellElement,
      type: string
    ) => Reflect.apply(parse, undefined, [{ element, type }]);

    expect(parseCell(tdParse, td, editor.getType(KEYS.td))).toEqual({
      background: 'rgb(1, 2, 3)',
      type: editor.getType(KEYS.td),
    });
    expect(parseCell(thParse, th, editor.getType(KEYS.th))).toEqual({
      background: 'red',
      type: editor.getType(KEYS.th),
    });
    if (typeof tdProps !== 'function' || typeof thProps !== 'function') {
      throw new TypeError('Table cell props must be functions');
    }

    const getProps = (props: Function, element: TTableCellElement): unknown =>
      props({ element });

    const tdElement: TTableCellElement = {
      attributes: { colspan: '2', rowspan: '3' },
      children: [{ text: '' }],
      type: editor.getType(KEYS.td),
    };
    const thElement: TTableCellElement = {
      attributes: { colspan: '4', rowspan: '5' },
      children: [{ text: '' }],
      type: editor.getType(KEYS.th),
    };

    expect(getProps(tdProps, tdElement)).toEqual({
      colSpan: '2',
      rowSpan: '3',
    });
    expect(getProps(thProps, thElement)).toEqual({
      colSpan: '4',
      rowSpan: '5',
    });
  });

  it('uses cached selection overrides when they are present', () => {
    const editor = createPlateEditor({
      plugins: [BaseTablePlugin],
    });

    editor.plugin(BaseTablePlugin).setOption('_selectionOverrides', {
      cellIds: ['c1'],
      tableIds: ['t1'],
    });

    expect(
      editor.plugin(BaseTablePlugin).getOption('isCellSelected', 'c1')
    ).toBe(true);
    expect(editor.plugin(BaseTablePlugin).getOption('isSelectingCell')).toBe(
      true
    );
    expect(editor.plugin(BaseTablePlugin).getOption('selectedCellIds')).toEqual(
      ['c1']
    );
    expect(
      editor.plugin(BaseTablePlugin).getOption('selectedTableIds')
    ).toEqual(['t1']);
  });
});
