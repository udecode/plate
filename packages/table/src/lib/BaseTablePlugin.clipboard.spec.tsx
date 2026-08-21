/** @jsx jsxt */

import { ContentSlice, defineExtension, editorReads } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';

import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';

describe('table clipboard', () => {
  jsxt;

  describe('when copying cells 11-21', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'copies a table 2x1 with 11-21 cells (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const fragment = editor.read.slice.export().content;

        expect(fragment).toMatchObject([
          editor.plugin(BaseTablePlugin).read.getGridAbove()[0][0],
        ]);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/63
  describe('when copying a single cell with 2 blocks', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'copies only the 2 blocks (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const fragment = editor.read.slice.export().content;

        expect(fragment).toMatchObject(blocks);
      }
    );
  });

  it('preserves a table inside an ordinary document range', () => {
    const input = (
      <editor>
        <hp>
          <anchor />
          before
        </hp>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
        </htable>
        <hp>
          after
          <focus />
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins(),
      selection: input.selection,
      initialValue: input.children,
    });

    expect(editor.read.slice.export().content).toContainEqual(
      expect.objectContaining({ type: 'table' })
    );
  });

  jsxt;

  jsxt;

  describe('typing over a multi-cell selection', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'clears the selected cells and inserts into the focus cell (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.text.insert('e');
        expect(editor.read.children()).toMatchObject(output.children!);
      }
    );
  });

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

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

      it('writes the complete selected table to every clipboard format', () => {
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
        const editor = createTableEditor(input);

        expect(
          editor.plugin(BaseTablePlugin).api.writeSelection(clipboard)
        ).toBe(true);
        expect(values.get('text/csv')).toBe('11,12\n21,22\n');
        expect(values.get('text/tsv')).toBe('11\t12\n21\t22\n');
        expect(values.get('text/plain')).toBe('11\t12\n21\t22\n');
        expect(values.get('text/html')).toContain(
          'data-plite-fragment-format="x-plite-fragment"'
        );
        expect(values.get('text/html')).toContain('<table');
        expect(values.get('text/html')).toContain('11');
        expect(values.get('text/html')).toContain('12');
        expect(values.get('text/html')).toContain('21');
        expect(values.get('text/html')).toContain('22');

        const encoded = values.get('application/x-plite-fragment');

        expect(encoded).toBeTruthy();

        const envelope = JSON.parse(decodeURIComponent(atob(encoded!))) as {
          slice: {
            content: Array<{
              children: Array<{
                children: Array<{
                  children: unknown[];
                }>;
              }>;
            }>;
            openEnd: number;
            openStart: number;
          };
          version: number;
        };
        const readText = (value: unknown): string => {
          if (!value || typeof value !== 'object') return '';

          const record = value as {
            children?: unknown[];
            text?: unknown;
          };

          if (typeof record.text === 'string') return record.text;

          return (record.children ?? []).map(readText).join('');
        };
        const copiedCells = envelope.slice.content[0]!.children.flatMap(
          (row) => row.children
        );

        expect(envelope.version).toBe(1);
        expect(envelope.slice.openStart).toBe(0);
        expect(envelope.slice.openEnd).toBe(0);
        expect(copiedCells.map(readText)).toEqual(['11', '12', '21', '22']);
        expect(values.has('application/x-slate-fragment')).toBe(false);
      });

      it('applies export projections to the exact table fragment', () => {
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
                  <hp>
                    12
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const { clipboard, values } = createClipboard();
        const editor = createTableEditor(input);

        editor.install(
          defineExtension('table-clipboard-export-projection', {
            readMiddleware: ({ around }) => [
              around(editorReads.slice.export, ({ next }) => {
                const slice = next();

                return ContentSlice.fromJSON({
                  ...slice,
                  content: slice.content.map((node) => ({
                    ...node,
                    clipboardProjection: true,
                  })),
                });
              }),
            ],
          })
        );

        expect(
          editor.plugin(BaseTablePlugin).api.writeSelection(clipboard)
        ).toBe(true);

        const encoded = values.get('application/x-plite-fragment');
        const envelope = JSON.parse(decodeURIComponent(atob(encoded!))) as {
          slice: {
            content: Array<{ clipboardProjection?: boolean }>;
          };
        };

        expect(envelope.slice.content[0]?.clipboardProjection).toBe(true);
      });

      it('quotes CSV fields while leaving TSV and plain text literal', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    {'left,right'}
                  </hp>
                </htd>
                <htd>
                  <hp>{'say "hi"'}</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>{'line 1\nline 2'}</hp>
                </htd>
                <htd>
                  <hp>
                    {'carriage\rreturn'}
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const { clipboard, values } = createClipboard();
        const editor = createTableEditor(input);

        expect(
          editor.plugin(BaseTablePlugin).api.writeSelection(clipboard)
        ).toBe(true);
        expect(values.get('text/csv')).toBe(
          '"left,right","say ""hi"""\n"line 1\nline 2","carriage\rreturn"\n'
        );
        expect(values.get('text/tsv')).toBe(
          'left,right\tsay "hi"\nline 1\nline 2\tcarriage\rreturn\n'
        );
        expect(values.get('text/plain')).toBe(
          'left,right\tsay "hi"\nline 1\nline 2\tcarriage\rreturn\n'
        );
      });
    });
  }
});
