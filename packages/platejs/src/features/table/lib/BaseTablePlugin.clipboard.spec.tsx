/** @jsxRuntime classic */
/** @jsx jsxt */

import type { TestEditor } from '#platejs-test-internal';
import { jsxt } from '#platejs-test-internal';

import { ContentSlice, editorReads } from '../../../core';
import { defineRuntimePlugin } from '../../../facade';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';

describe('table clipboard', () => {
  jsxt;

  describe('when copying cells 11-21', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'copies a table 2x1 with 11-21 cells (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
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
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        const fragment = editor.read.slice.export().content;

        expect(fragment).toMatchObject([
          {
            type: 'table',
            children: [
              {
                type: 'tableRow',
                children: [
                  {
                    type: 'tableCell',
                    children: [
                      { type: 'paragraph', children: [{ text: '11' }] },
                    ],
                  },
                ],
              },
              {
                type: 'tableRow',
                children: [
                  {
                    type: 'tableCell',
                    children: [
                      { type: 'paragraph', children: [{ text: '21' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ]);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/63
  describe('when copying a single cell with 2 blocks', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'copies only the 2 blocks (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
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
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
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

  it('projects a transaction from its own node selection', () => {
    const input = (
      <editor>
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
      </editor>
    ) as TestEditor;
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins(),
      initialValue: input.children,
    });

    const result: { slice?: ContentSlice } = {};

    editor.read((state) =>
      state.transaction((tx) => {
        tx.selection.setNodes([
          [0, 0, 0],
          [0, 0, 1],
        ]);

        result.slice = tx.slice.get();
      })
    );

    expect(result.slice?.content).toMatchObject(input.children);
  });

  jsxt;

  jsxt;

  describe('typing over a multi-cell selection', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'clears the selected cells and inserts into the focus cell (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
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
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.text.insert('e');
        expect(editor.read.children()).toMatchObject(output.children);
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

    describe('canonical table slice export', () => {
      it('exports the complete selected table through the canonical DOM clipboard', () => {
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

        editor.api.dom.clipboard.writeSlice(clipboard, {
          slice: editor.read.slice.export(),
        });
        expect(values.get('text/html')).toContain(
          'data-editor-fragment-format="x-editor-fragment"'
        );
        expect(values.get('text/html')).toContain('<table');
        expect(values.get('text/html')).toContain('11');
        expect(values.get('text/html')).toContain('12');
        expect(values.get('text/html')).toContain('21');
        expect(values.get('text/html')).toContain('22');

        const encoded = values.get('application/x-editor-fragment');

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
        const copiedCells = envelope.slice.content[0].children.flatMap(
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
          defineRuntimePlugin('table-clipboard-export-projection', {
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

        editor.api.dom.clipboard.writeSlice(clipboard, {
          slice: editor.read.slice.export(),
        });

        const encoded = values.get('application/x-editor-fragment');
        const envelope = JSON.parse(decodeURIComponent(atob(encoded!))) as {
          slice: {
            content: Array<{ clipboardProjection?: boolean }>;
          };
        };

        expect(envelope.slice.content[0]?.clipboardProjection).toBe(true);
      });
    });
  }
});
