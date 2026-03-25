import { KEYS, createSlateEditor } from 'platejs';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
} from './BaseTablePlugin';

describe('BaseTablePlugin', () => {
  it('parses table cell background styles and attribute props', () => {
    const editor = createSlateEditor({
      plugins: [BaseTablePlugin],
    } as any);

    const tdParse =
      editor.getPlugin(BaseTableCellPlugin).parsers!.html!.deserializer!.parse!;
    const thParse = editor.getPlugin(BaseTableCellHeaderPlugin).parsers!.html!
      .deserializer!.parse!;
    const tdProps = editor.getPlugin(BaseTableCellPlugin).node.props as any;
    const thProps = editor.getPlugin(BaseTableCellHeaderPlugin).node
      .props as any;

    expect(
      tdParse({
        element: { style: { backgroundColor: 'rgb(1, 2, 3)' } },
        type: editor.getType(KEYS.td),
      } as any)
    ).toEqual({
      background: 'rgb(1, 2, 3)',
      type: editor.getType(KEYS.td),
    });
    expect(
      thParse({
        element: { style: { background: 'red' } },
        type: editor.getType(KEYS.th),
      } as any)
    ).toEqual({
      background: 'red',
      type: editor.getType(KEYS.th),
    });
    expect(
      tdProps({
        element: { attributes: { colspan: '2', rowspan: '3' } },
      } as any)
    ).toEqual({ colSpan: '2', rowSpan: '3' });
    expect(
      thProps({
        element: { attributes: { colspan: '4', rowspan: '5' } },
      } as any)
    ).toEqual({ colSpan: '4', rowSpan: '5' });
  });

  it('uses cached selection overrides when they are present', () => {
    const editor = createSlateEditor({
      plugins: [BaseTablePlugin],
    } as any);

    editor.setOption(BaseTablePlugin, '_selectedCellIds', ['c1']);
    editor.setOption(BaseTablePlugin, '_selectedTableIds', ['t1']);

    expect(editor.getOption(BaseTablePlugin, 'isCellSelected', 'c1')).toBe(
      true
    );
    expect(editor.getOption(BaseTablePlugin, 'isSelectingCell')).toBe(true);
    expect(editor.getOption(BaseTablePlugin, 'selectedCellIds')).toEqual([
      'c1',
    ]);
    expect(editor.getOption(BaseTablePlugin, 'selectedTableIds')).toEqual([
      't1',
    ]);
  });
});
