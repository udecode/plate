/** @jsx jsxt */

import { type SlateEditor, KEYS, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

const createClipboard = () => {
  const dataMap = new Map<string, string>();

  return {
    data: {
      clearData: mock(() => dataMap.clear()),
      getData: mock((type: string) => dataMap.get(type) ?? ''),
      setData: mock((type: string, value: string) => dataMap.set(type, value)),
    } as unknown as DataTransfer,
    dataMap,
  };
};

const createOverride = (
  editor: SlateEditor,
  setFragmentData: (data: DataTransfer, originEvent?: string) => void
) => {
  const plugin = editor.getPlugin({ key: KEYS.table }) as any;

  return withSetFragmentDataTable({
    api: plugin.api,
    editor,
    plugin,
    tf: { setFragmentData } as any,
  } as any);
};

describe('withSetFragmentDataTable', () => {
  const originalBtoa = global.window.btoa;
  const originalEncodeURIComponent = global.encodeURIComponent;

  beforeEach(() => {
    global.window.btoa = mock((value) => `b64:${value}`) as any;
    global.encodeURIComponent = mock((value) => `uri:${value}`) as any;
  });

  afterEach(() => {
    global.window.btoa = originalBtoa;
    global.encodeURIComponent = originalEncodeURIComponent;
    mock.restore();
  });

  it('falls back to the base setFragmentData when no table is selected', () => {
    const input = (
      <editor>
        <hp>
          text
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const { data, dataMap } = createClipboard();
    const baseSetFragmentData = mock();
    const override = createOverride(editor, baseSetFragmentData as any);
    const setFragmentData = override.transforms!.setFragmentData!;

    setFragmentData(data, 'copy');

    expect(baseSetFragmentData).toHaveBeenCalledWith(data, 'copy');
    expect(dataMap.get('text/csv')).toBeUndefined();
    expect(dataMap.get('text/tsv')).toBeUndefined();
  });

  it('falls back to the base setFragmentData for single-cell copy operations', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                hello
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const { data, dataMap } = createClipboard();
    const baseSetFragmentData = mock();
    const override = createOverride(editor, baseSetFragmentData as any);
    const setFragmentData = override.transforms!.setFragmentData!;

    setFragmentData(data, 'copy');

    expect(baseSetFragmentData).toHaveBeenCalledWith(data);
    expect(dataMap.get('text/csv')).toBeUndefined();
    expect(dataMap.get('text/tsv')).toBeUndefined();
  });

  it('serializes a multi-cell selection into csv, tsv, html, and a slate fragment', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                11
              </hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
            <htd>
              <hp>
                22
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const { data, dataMap } = createClipboard();
    const baseSetFragmentData = mock((clipboard: DataTransfer) => {
      const cellEntry = editor.api.above({
        match: {
          type: [editor.getType(KEYS.td), editor.getType(KEYS.th)],
        },
      })!;
      const text = editor.api.string(cellEntry[1]);

      clipboard.setData('text/html', `<p>${text}</p>`);
      clipboard.setData('text/plain', text);
    });
    const override = createOverride(editor, baseSetFragmentData as any);
    const setFragmentData = override.transforms!.setFragmentData!;

    setFragmentData(data, 'copy');

    expect(baseSetFragmentData).toHaveBeenCalledTimes(4);
    expect(dataMap.get('text/csv')).toBe('11,12\n21,22\n');
    expect(dataMap.get('text/tsv')).toBe('11\t12\n21\t22\n');
    expect(dataMap.get('text/plain')).toBe('11\t12\n21\t22\n');
    expect(dataMap.get('text/html')).toContain('<table>');
    expect(dataMap.get('text/html')).toContain(
      '<td colspan="1" rowspan="1"><p>11</p></td>'
    );
    expect(dataMap.get('text/html')).toContain(
      '<td colspan="1" rowspan="1"><p>22</p></td>'
    );
    expect(dataMap.get('application/x-slate-fragment')).toContain('b64:uri:[');
    expect(dataMap.get('application/x-slate-fragment')).toContain(
      '"type":"table"'
    );
  });
});
