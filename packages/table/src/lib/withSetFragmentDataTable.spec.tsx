/** @jsx jsxt */

import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

jsxt;

const createTableEditor = (
  input: TestEditor,
  writeSelection?: (data: Pick<DataTransfer, 'getData' | 'setData'>) => void
) =>
  createPlateEditor({
    nodeId: true,
    plugins: [
      ...getTestTablePlugins(),
      ...(writeSelection
        ? [
            createPlatePlugin({ key: 'clipboard-test' }).extendEditorApi(
              () => ({
                clipboard: { writeSelection },
              })
            ),
          ]
        : []),
    ],
    selection: input.selection,
    initialValue: input.children,
  });

const createClipboard = () => {
  const values = new Map<string, string>();

  return {
    clipboard: {
      getData: (type: string) => values.get(type) ?? '',
      setData: (type: string, value: string) => {
        values.set(type, value);
      },
    },
    values,
  };
};

describe('withSetFragmentDataTable', () => {
  it('ignores selections outside tables', () => {
    const input = (
      <editor>
        <hp>
          text
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createTableEditor(input);
    const { clipboard, values } = createClipboard();

    expect(withSetFragmentDataTable(editor, clipboard)).toBe(false);
    expect(values.size).toBe(0);
  });

  it('ignores a selection inside one cell', () => {
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
    ) as TestEditor;
    const editor = createTableEditor(input);
    const { clipboard, values } = createClipboard();

    expect(withSetFragmentDataTable(editor, clipboard)).toBe(false);
    expect(values.size).toBe(0);
  });

  it('adds csv, tsv, and plain text to the standard clipboard formats', () => {
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
    ) as TestEditor;
    const { clipboard, values } = createClipboard();
    const writeSelection = mock((data: Pick<DataTransfer, 'setData'>) => {
      data.setData(
        'text/html',
        '<table data-plite-fragment="standard fragment" data-plite-fragment-format="x-plite-fragment">standard html</table>'
      );
      data.setData('application/x-plite-fragment', 'standard fragment');
    });
    const editor = createTableEditor(input, writeSelection);

    expect(withSetFragmentDataTable(editor, clipboard)).toBe(true);
    expect(writeSelection).toHaveBeenCalledTimes(1);
    expect(values.get('text/csv')).toBe('11,12\n21,22\n');
    expect(values.get('text/tsv')).toBe('11\t12\n21\t22\n');
    expect(values.get('text/plain')).toBe('11\t12\n21\t22\n');
    expect(values.get('text/html')).toBe(
      '<table data-plite-fragment="standard fragment" data-plite-fragment-format="x-plite-fragment">standard html</table>'
    );
    expect(values.get('application/x-plite-fragment')).toBe(
      'standard fragment'
    );
    expect(values.has('application/x-slate-fragment')).toBe(false);
  });
});
