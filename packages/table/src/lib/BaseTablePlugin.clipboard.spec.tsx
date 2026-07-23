/** @jsx jsxt */

import { BaseTablePlugin } from './BaseTablePlugin';
import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { createPlateEditor } from '@platejs/core/react';
import { defineEditorExtension } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';

describe('table clipboard', () => {
  jsxt;

  describe('when copying cells 11-21', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('copies a table 2x1 with 11-21 cells (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  11
                  <anchor />
                </hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  21
                  <focus />
                </hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

      const fragment = editor.read.fragment();

      expect(fragment).toMatchObject([
        editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0],
      ]);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/63
  describe('when copying a single cell with 2 blocks', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('copies only the 2 blocks (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const blocks = (
        <fragment>
          <hp>
            <anchor />
            11
          </hp>
          <hp>
            12
            <focus />
          </hp>
        </fragment>
      );

      const input = (
        <editor>
          <htable>
            <htr>
              <htd>{blocks}</htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

      const fragment = editor.read.fragment();

      expect(fragment).toMatchObject(blocks);
    });
  });
  jsxt;

  jsxt;

  describe('typing over a multi-cell selection', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('clears the selected cells and inserts into the focus cell (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />a
                </hp>
              </htd>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  c<focus />
                </hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>e</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.insert('e');
      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  {
    jsxt;

    const createTableEditor = (
      input: TestEditor,
      writeSelection?: (data: Pick<DataTransfer, 'setData'>) => void
    ) => {
      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

      if (writeSelection) {
        editor.extend(
          defineEditorExtension({
            api: { clipboard: { writeSelection } },
            name: 'table-write-selection-test',
          })
        );
      }

      return editor;
    };

    const createClipboard = () => {
      const dataMap = new Map<string, string>();

      return {
        clipboard: {
          clearData: mock(() => dataMap.clear()),
          getData: mock((type: string) => dataMap.get(type) ?? ''),
          setData: mock((type: string, value: string) =>
            dataMap.set(type, value)
          ),
        } as unknown as DataTransfer,
        values: dataMap,
      };
    };

    describe('BaseTablePlugin writeSelection', () => {
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

        expect(
          editor.plugin(BaseTablePlugin).api.writeSelection(clipboard)
        ).toBe(false);
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

        expect(
          editor.plugin(BaseTablePlugin).api.writeSelection(clipboard)
        ).toBe(false);
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

        expect(
          editor.plugin(BaseTablePlugin).api.writeSelection(clipboard)
        ).toBe(true);
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
  }
});
