/** @jsx jsxt */

import assert from 'node:assert/strict';

import { BaseTablePlugin } from './BaseTablePlugin';
import type { TableConfig } from './BaseTablePlugin';
import { createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import {
  createEditorView,
  property,
  schema,
  target,
  TextApi,
} from '@platejs/plite';
import type { EditorRuntime, Element, Text } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';
import type { TTableCellElement } from '@platejs/utils';

import {
  readTableSelection,
  readTableSelectionViewMetrics,
} from './internal/selection';

describe('table selection slow contracts', () => {
  {
    jsxt;

    const getTestTablePlugins = (options?: Partial<TableConfig['options']>) => [
      createBasePlugin({
        key: 'tableSelectionTestSchema',
        schema: {
          properties: [
            schema.textProperty('bold', property.boolean()),
            schema.textProperty('italic', property.boolean()),
            schema.elementProperty('align', property.string(), {
              target: target.group('element'),
            }),
            schema.elementProperty('indent', property.number(), {
              target: target.group('element'),
            }),
          ],
        },
      }),
      BaseTablePlugin.configure({
        options: {
          disableMerge: true,
          ...options,
        },
      }),
    ];

    const createTableEditor = (
      input: TestEditor,
      options?: Partial<TableConfig['options']>
    ) =>
      createPlateEditor({
        plugins: getTestTablePlugins(options),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('BaseTablePlugin cell selection', () => {
      describe('marks()', () => {
        it('falls back to the default marks logic for collapsed selections', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>
                      <htext bold>te</htext>
                      <cursor />
                      <htext bold>st</htext>
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          expect(createTableEditor(input).read.marks()).toEqual({ bold: true });
        });

        it.each([
          {
            expected: { bold: true },
            input: (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp>
                        <htext bold italic>
                          <anchor />
                          test1
                        </htext>
                      </hp>
                    </htd>
                    <htd>
                      <hp>
                        <htext bold>test2</htext>
                      </hp>
                    </htd>
                  </htr>
                  <htr>
                    <htd>
                      <hp>
                        <htext bold>test3</htext>
                      </hp>
                    </htd>
                    <htd>
                      <hp>
                        <htext bold>
                          test4
                          <focus />
                        </htext>
                      </hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ) as TestEditor,
            name: 'returns marks shared by every selected text node',
          },
          {
            expected: {},
            input: (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp>
                        <htext bold italic>
                          <anchor />
                          test1
                        </htext>
                      </hp>
                    </htd>
                    <htd>
                      <hp>
                        <htext>test2</htext>
                      </hp>
                    </htd>
                  </htr>
                  <htr>
                    <htd>
                      <hp>
                        <htext bold>test3</htext>
                      </hp>
                    </htd>
                    <htd>
                      <hp>
                        <htext italic>
                          test4
                          <focus />
                        </htext>
                      </hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ) as TestEditor,
            name: 'drops marks that are not shared by every selected text node',
          },
        ])('$name', ({ expected, input }) => {
          expect(createTableEditor(input).read.marks()).toEqual(expected);
        });
      });

      describe('mark transforms', () => {
        it('adds a mark to every selected text node across cells', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>
                      <htext>
                        <anchor />
                        plain
                      </htext>
                      <htext italic> italic</htext>
                    </hp>
                  </htd>
                  <htd>
                    <hp>
                      <htext>test2</htext>
                    </hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>
                      <htext>test3</htext>
                    </hp>
                  </htd>
                  <htd>
                    <hp>
                      <htext>
                        test4
                        <focus />
                      </htext>
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);
          editor.update.marks.add('bold', true);

          expect(editor.read.children()).toEqual(
            (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp>
                        <htext bold>plain</htext>
                        <htext bold italic>
                          {' '}
                          italic
                        </htext>
                      </hp>
                    </htd>
                    <htd>
                      <hp>
                        <htext bold>test2</htext>
                      </hp>
                    </htd>
                  </htr>
                  <htr>
                    <htd>
                      <hp>
                        <htext bold>test3</htext>
                      </hp>
                    </htd>
                    <htd>
                      <hp>
                        <htext bold>test4</htext>
                      </hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ).children
          );
        });

        it('removes only the requested mark across selected cells', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>
                      <htext bold>
                        <anchor />
                        bold
                      </htext>
                      <htext bold italic>
                        {' '}
                        bold italic
                      </htext>
                    </hp>
                  </htd>
                  <htd>
                    <hp>
                      <htext bold>test2</htext>
                    </hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>
                      <htext>plain</htext>
                      <htext bold> bold</htext>
                    </hp>
                  </htd>
                  <htd>
                    <hp>
                      <htext bold>
                        test4
                        <focus />
                      </htext>
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);
          editor.update.marks.remove('bold');

          const texts = editor.read.nodes.toArray<Text>({
            match: (node) => TextApi.isText(node),
          });

          expect(texts.every(([text]) => text.bold === undefined)).toBe(true);
          expect(texts.find(([text]) => text.italic)?.[0].text).toBe(
            ' bold italic'
          );
          expect(editor.read.text.string([0])).toBe(
            'bold bold italictest2plain boldtest4'
          );
        });
      });

      describe('setNodes', () => {
        it('sets properties on every selected cell block', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>
                      <anchor />
                      row1col1
                    </hp>
                  </htd>
                  <htd>
                    <hp>row1col2</hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>
                      row2col1
                      <focus />
                    </hp>
                  </htd>
                  <htd>
                    <hp>row2col2</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);
          editor.update.nodes.set(
            { align: 'center' },
            { match: { type: 'p' } }
          );

          expect(editor.read.children()).toEqual(
            (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp align="center">row1col1</hp>
                    </htd>
                    <htd>
                      <hp>row1col2</hp>
                    </htd>
                  </htr>
                  <htr>
                    <htd>
                      <hp align="center">row2col1</hp>
                    </htd>
                    <htd>
                      <hp>row2col2</hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ).children
          );
        });

        it('does not hijack path-targeted writes to unselected cells inside the linear Slate range', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>row1col1</hp>
                  </htd>
                  <htd>
                    <hp>
                      <anchor />
                      row1col2
                    </hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>row2col1</hp>
                  </htd>
                  <htd>
                    <hp>
                      row2col2
                      <focus />
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);

          editor.update.nodes.set({ background: 'red' }, { at: [0, 1, 0] });

          expect(editor.read.children()).toEqual(
            (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp>row1col1</hp>
                    </htd>
                    <htd>
                      <hp>row1col2</hp>
                    </htd>
                  </htr>
                  <htr>
                    <htd background="red">
                      <hp>row2col1</hp>
                    </htd>
                    <htd>
                      <hp>row2col2</hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ).children
          );
        });

        it('unsets multiple properties on every selected cell block', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp align="center" indent={1}>
                      <anchor />
                      cell1
                    </hp>
                  </htd>
                  <htd>
                    <hp align="right" indent={2}>
                      cell2
                      <focus />
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);
          editor.update.nodes.unset(['align', 'indent'], {
            match: { type: 'p' },
          });

          expect(editor.read.children()).toEqual(
            (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp>cell1</hp>
                    </htd>
                    <htd>
                      <hp>cell2</hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ).children
          );
        });
      });

      describe('selection selectors', () => {
        it('derives multi-cell selection queries from the editor selection', () => {
          const input = (
            <editor>
              <htable id="table-1">
                <htr>
                  <htd id="c11">
                    <hp>
                      <anchor />
                      cell11
                    </hp>
                  </htd>
                  <htd id="c12">
                    <hp>cell12</hp>
                  </htd>
                </htr>
                <htr>
                  <htd id="c21">
                    <hp>cell21</hp>
                  </htd>
                  <htd id="c22">
                    <hp>
                      cell22
                      <focus />
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);

          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCellIds')
          ).toStrictEqual(['c11', 'c12', 'c21', 'c22']);
          expect(
            editor
              .plugin(BaseTablePlugin)
              .getOption('selectedCells')
              ?.map((cell: Element) => cell.id)
          ).toStrictEqual(['c11', 'c12', 'c21', 'c22']);
          expect(
            editor
              .plugin(BaseTablePlugin)
              .getOption('selectedTables')
              ?.map((table: Element) => table.type)
          ).toStrictEqual(['table']);
          expect(
            editor.plugin(BaseTablePlugin).getOption('isSelectingCell')
          ).toBe(true);
          expect(
            editor.plugin(BaseTablePlugin).getOption('isCellSelected', 'c12')
          ).toBe(true);
          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCell', 'c21')?.id
          ).toBe('c21');
        });

        it('returns empty multi-cell queries when the selection stays inside one cell', () => {
          const input = (
            <editor>
              <htable id="table-1">
                <htr>
                  <htd id="c11">
                    <hp>
                      <htext>
                        ce
                        <anchor />
                      </htext>
                      <htext>
                        ll
                        <focus />
                        11
                      </htext>
                    </hp>
                  </htd>
                  <htd id="c12">
                    <hp>cell12</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);

          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCellIds')
          ).toBeNull();
          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCells')
          ).toBeNull();
          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedTables')
          ).toBeNull();
          expect(
            editor.plugin(BaseTablePlugin).getOption('isSelectingCell')
          ).toBe(false);
          expect(
            editor.plugin(BaseTablePlugin).getOption('isCellSelected', 'c11')
          ).toBe(false);
          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCell', 'c11')
          ).toBeNull();
        });

        it('reads the latest selected cell nodes after the table changes', () => {
          const input = (
            <editor>
              <htable id="table-1">
                <htr>
                  <htd id="c11">
                    <hp>
                      <anchor />
                      cell11
                    </hp>
                  </htd>
                  <htd id="c12">
                    <hp>
                      cell12
                      <focus />
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);

          editor.update.nodes.set({ background: 'red' }, { at: [0, 0, 0] });

          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCell', 'c11')
          ).toMatchObject({
            background: 'red',
            id: 'c11',
          });
          expect(
            editor
              .plugin(BaseTablePlugin)
              .getOption('selectedCells')
              ?.map((cell: Element) => cell.id)
          ).toStrictEqual(['c11', 'c12']);
        });

        it('updates selected cell ids when the Slate selection changes', () => {
          const input = (
            <editor>
              <htable id="table-1">
                <htr>
                  <htd id="c11">
                    <hp>
                      <cursor />
                      cell11
                    </hp>
                  </htd>
                  <htd id="c12">
                    <hp>cell12</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input);

          editor.update.selection.set({
            kind: 'text',
            anchor: editor.read.points.start([0, 0, 0])!,
            focus: editor.read.points.end([0, 0, 1])!,
          });

          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCellIds')
          ).toStrictEqual(['c11', 'c12']);

          editor.update.selection.set(editor.read.points.start([0, 0, 0])!);

          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCellIds')
          ).toBeNull();
        });

        it('updates selected cell ids for unmerged tables when merge is enabled', () => {
          const input = (
            <editor>
              <htable id="table-1">
                <htr>
                  <htd id="c11">
                    <hp>
                      <cursor />
                      cell11
                    </hp>
                  </htd>
                  <htd id="c12">
                    <hp>cell12</hp>
                  </htd>
                </htr>
                <htr>
                  <htd id="c21">
                    <hp>cell21</hp>
                  </htd>
                  <htd id="c22">
                    <hp>cell22</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as TestEditor;

          const editor = createTableEditor(input, { disableMerge: false });

          editor.update.selection.set({
            kind: 'text',
            anchor: editor.read.points.start([0, 0, 0])!,
            focus: editor.read.points.end([0, 1, 1])!,
          });

          expect(
            editor.plugin(BaseTablePlugin).getOption('selectedCellIds')
          ).toStrictEqual(['c11', 'c12', 'c21', 'c22']);
        });
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: [
          BaseTablePlugin.configure({
            options: { disableMerge: true },
          }),
        ],
        selection: input.selection,
        initialValue: input.children,
      });

    describe('getSelectedCells helpers', () => {
      it('returns selected cells, ids, and tables for a multi-cell selection', () => {
        const input = (
          <editor>
            <htable id="table-1">
              <htr>
                <htd id="c11">
                  <hp>
                    <anchor />
                    11
                  </hp>
                </htd>
                <htd id="c12">
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd id="c21">
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

        const editor = createTableEditor(input);

        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedCellEntries()
        ).toHaveLength(2);
        expect(
          editor
            .plugin(BaseTablePlugin)
            .api.getSelectedCells()
            ?.map((cell) => cell.id)
        ).toEqual(['c11', 'c21']);
        expect(editor.plugin(BaseTablePlugin).api.getSelectedCellIds()).toEqual(
          ['c11', 'c21']
        );
        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedTableIds()
        ).toEqual(['table-1']);
        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedTables()
        ).toHaveLength(1);
        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedCell('c21')?.id
        ).toBe('c21');
        expect(editor.plugin(BaseTablePlugin).api.isCellSelected('c11')).toBe(
          true
        );
        expect(editor.plugin(BaseTablePlugin).api.isSelectingCell()).toBe(true);
      });

      it('returns nullish values when only one cell is active and updates after selection changes', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedCells()
        ).toBeNull();
        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedCellIds()
        ).toBeNull();
        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedTables()
        ).toBeNull();
        expect(editor.plugin(BaseTablePlugin).api.isSelectingCell()).toBe(
          false
        );

        editor.update.selection.set({
          kind: 'text',
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 1, 0, 0] },
        });

        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedCells()
        ).toHaveLength(2);
        expect(editor.plugin(BaseTablePlugin).api.isSelectingCell()).toBe(true);
      });

      it('returns null values for a single-cell selection', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    one
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedCells()
        ).toBeNull();
        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedCellIds()
        ).toBeNull();
        expect(
          editor.plugin(BaseTablePlugin).api.getSelectedTableIds()
        ).toBeNull();
      });
    });
  }

  describe('TableCellSelection mapping', () => {
    const createTable = (prefix: string) => ({
      children: Array.from({ length: 2 }, (_, row) => ({
        children: Array.from({ length: 2 }, (_, col) => {
          const id = `${prefix}-${row}${col}`;

          return {
            children: [{ children: [{ text: id }], type: 'p' }],
            id,
            type: 'td',
          };
        }),
        type: 'tr',
      })),
      id: `${prefix}-table`,
      type: 'table',
    });
    const RootHolderPlugin = createBasePlugin({
      key: 'tableSelectionRootHolder',
      schema: {
        element: {
          contentRoots: {
            body: {
              content: schema.content.type('table', {
                default: { type: 'table' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          topLevel: true,
          void: 'block',
        },
      },
    });

    it('resolves explicit cell geometry by identity across named roots', () => {
      const root = 'table-selection-bounds-root';
      const rootTable = {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'span' }], type: 'p' }],
                id: 'span',
                rowSpan: 2,
                type: 'td',
              },
              {
                children: [{ children: [{ text: 'top' }], type: 'p' }],
                id: 'top',
                type: 'td',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [{ children: [{ text: 'target' }], type: 'p' }],
                id: 'target',
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        id: 'root-table',
        type: 'table',
      };
      const editor = createPlateEditor({
        nodeId: true,
        plugins: [BaseTablePlugin, RootHolderPlugin],
        initialValue: {
          children: [
            {
              childRoots: { body: root },
              children: [{ text: '' }],
              type: RootHolderPlugin.key,
            },
            createTable('main'),
          ],
          roots: { [root]: [rootTable] },
        },
      });
      const runtime = Object.freeze({
        api: editor.api,
        anchor: editor.anchor,
        editor,
        extend: editor.extend,
        getApi: editor.getApi,
        read: editor.read,
        subscribe: editor.subscribe,
        subscribeCommit: editor.subscribeCommit,
        update: editor.update,
      }) as unknown as EditorRuntime;
      const rootEditor = createEditorView(runtime, {
        root,
      }) as unknown as typeof editor;
      const mainAnchor = editor.read.points.start([1, 0, 0]);
      const mainFocus = editor.read.points.end([1, 0, 1]);
      const target = rootEditor.read.nodes.get<TTableCellElement>([0, 1, 0]);

      assert(mainAnchor);
      assert(mainFocus);
      assert(target);
      editor.update.selection.set({ anchor: mainAnchor, focus: mainFocus });

      expect(
        editor
          .plugin(BaseTablePlugin)
          .api.getSelectedCellsBoundingBox([target[0]])
      ).toEqual({ maxCol: 1, maxRow: 1, minCol: 1, minRow: 1 });
    });

    it('drops deleted cell ranges without duplicating surviving cells', () => {
      const ids = ['a', 'b', 'c', 'd', 'e'];

      for (const removedIndex of ids.keys()) {
        const editor = createPlateEditor({
          nodeId: true,
          plugins: [BaseTablePlugin],
          initialValue: [
            {
              children: [
                {
                  children: ids.map((id) => ({
                    children: [{ children: [{ text: id }], type: 'p' }],
                    id,
                    type: 'td',
                  })),
                  type: 'tr',
                },
              ],
              type: 'table',
            },
          ],
        });
        const anchor = editor.read.points.start([0, 0, 0]);
        const focus = editor.read.points.end([0, 0, ids.length - 1]);

        assert(anchor);
        assert(focus);

        const tableSelection = editor
          .plugin(BaseTablePlugin)
          .api.createCellSelection({ anchor, focus });

        assert(tableSelection);
        editor.update.selection.set(tableSelection);
        editor.update((tx) => {
          tx.nodes.remove({ at: [0, 0, removedIndex] });
        });

        const selection = editor.read.selection();
        const expectedIds = ids.filter((_, index) => index !== removedIndex);

        assert(selection?.kind === 'table-cell');
        expect(selection.cells).toHaveLength(expectedIds.length);
        expect(
          new Set(
            selection.cells.map((cell) =>
              JSON.stringify([cell.anchor, cell.focus])
            )
          ).size
        ).toBe(expectedIds.length);
        expect(editor.plugin(BaseTablePlugin).api.getSelectedCellIds()).toEqual(
          expectedIds
        );
        expect(selection.cells).toEqual(
          expectedIds.map((_, index) => {
            const range = editor.read.ranges.get([0, 0, index]);

            assert(range);

            return range;
          })
        );
      }
    });

    it('rejects duplicate and reversed persisted cell ranges', () => {
      const editor = createPlateEditor({
        nodeId: true,
        plugins: [BaseTablePlugin],
        initialValue: [createTable('codec')],
      });
      const anchor = editor.read.points.start([0, 0, 0]);
      const focus = editor.read.points.end([0, 1, 1]);

      assert(anchor);
      assert(focus);

      const selection = editor
        .plugin(BaseTablePlugin)
        .api.createCellSelection({ anchor, focus });

      assert(selection);
      editor.update.selection.set(selection);
      expect(() =>
        editor.update((tx) => {
          tx.selection.move({ edge: 'focus' });
        })
      ).not.toThrow();
      expect(editor.read.selection()?.kind).toBe('table-cell');
      editor.update.selection.set(selection);

      for (const invalid of [
        {
          ...selection,
          cells: [selection.cells[0], selection.cells[0]],
        },
        {
          ...selection,
          cells: [
            {
              anchor: selection.cells[0].focus,
              focus: selection.cells[0].anchor,
            },
            ...selection.cells.slice(1),
          ],
        },
      ]) {
        assert.throws(
          () => editor.update.selection.set(invalid),
          /Invalid editor selection "table-cell" value/
        );
      }
    });

    it('rebases every persisted cell range across generated named-root versions', () => {
      const root = 'table-selection-root';
      const editor = createPlateEditor({
        nodeId: true,
        plugins: [BaseTablePlugin, RootHolderPlugin],
        initialValue: {
          children: [
            {
              childRoots: { body: root },
              children: [{ text: '' }],
              type: RootHolderPlugin.key,
            },
            createTable('main'),
          ],
          roots: {
            [root]: [createTable('root'), createTable('root-after')],
          },
        },
      });
      const runtime = Object.freeze({
        api: editor.api,
        anchor: editor.anchor,
        editor,
        extend: editor.extend,
        getApi: editor.getApi,
        read: editor.read,
        subscribe: editor.subscribe,
        subscribeCommit: editor.subscribeCommit,
        update: editor.update,
      }) as unknown as EditorRuntime;
      const rootEditor = createEditorView(runtime, {
        root,
      }) as unknown as typeof editor;
      const anchor = rootEditor.read.points.start([0, 0, 0]);
      const focus = rootEditor.read.points.end([0, 1, 1]);

      assert(anchor);
      assert(focus);

      const rootRange = Object.freeze({ anchor, focus });
      const rootSelectionView = readTableSelection(rootEditor.read, {
        at: rootRange,
        cellTypes: ['td', 'th'],
        tableType: 'table',
      });
      const baseSelectionView = readTableSelection(editor.read, {
        at: rootRange,
        cellTypes: ['td', 'th'],
        tableType: 'table',
      });

      assert(rootSelectionView, 'root-scoped table selection view');
      assert(baseSelectionView, 'explicit-root base table selection view');
      expect(rootSelectionView.selection).toBe(rootRange);
      expect(baseSelectionView.selection).toBe(rootRange);

      const upperLeft = rootEditor.read.nodes.get([0, 0, 0]);
      const upperRight = rootEditor.read.nodes.get([0, 0, 1]);
      const upperRow = rootEditor.read.nodes.get([0, 0]);
      const upperLeftPoint = rootEditor.read.points.start([0, 0, 0]);
      const upperRightPoint = rootEditor.read.points.start([0, 0, 1]);
      const lowerRightPoint = rootEditor.read.points.start([0, 1, 1]);

      assert(upperLeft);
      assert(upperRight);
      assert(upperRow);
      assert(upperLeftPoint);
      assert(upperRightPoint);
      assert(lowerRightPoint);
      expect(
        editor.plugin(BaseTablePlugin).api.getLeftCell({ at: lowerRightPoint })
      ).toEqual([expect.objectContaining({ id: 'root-10' }), [0, 1, 0]]);
      expect(
        editor.plugin(BaseTablePlugin).api.getTopCell({ at: lowerRightPoint })
      ).toEqual([expect.objectContaining({ id: 'root-01' }), [0, 0, 1]]);
      expect(
        editor.plugin(BaseTablePlugin).api.getCellInNextRow(upperLeftPoint)
      ).toEqual([expect.objectContaining({ id: 'root-10' }), [0, 1, 0]]);
      expect(
        editor.plugin(BaseTablePlugin).api.getCellInPreviousRow(lowerRightPoint)
      ).toEqual([expect.objectContaining({ id: 'root-01' }), [0, 0, 1]]);
      expect(
        editor
          .plugin(BaseTablePlugin)
          .api.getNextCell(upperLeft, upperLeftPoint, upperRow)
      ).toEqual([expect.objectContaining({ id: 'root-01' }), [0, 0, 1]]);
      expect(
        editor
          .plugin(BaseTablePlugin)
          .api.getPreviousCell(upperRight, upperRightPoint, upperRow)
      ).toEqual([expect.objectContaining({ id: 'root-00' }), [0, 0, 0]]);

      const tableSelection = editor
        .plugin(BaseTablePlugin)
        .api.createCellSelection(rootRange);

      assert(tableSelection);
      rootEditor.update.selection.set(tableSelection);

      const assertMappedSelection = (tableIndex: number) => {
        const selection = rootEditor.read.selection();

        assert(selection?.kind === 'table-cell');
        expect(selection.cells).toHaveLength(4);
        expect(
          selection.cells.map(({ anchor: cellAnchor }) => cellAnchor.root)
        ).toEqual([root, root, root, root]);
        expect(
          selection.cells.map(({ anchor: cellAnchor }) => cellAnchor.path[0])
        ).toEqual([tableIndex, tableIndex, tableIndex, tableIndex]);
        expect(
          selection.cells.map(({ focus: cellFocus }) => cellFocus.offset)
        ).toEqual([
          'root-00'.length,
          'root-01'.length,
          'root-10'.length,
          'root-11'.length,
        ]);

        const view = readTableSelection(rootEditor.read, {
          cellTypes: ['td', 'th'],
          tableType: 'table',
        });
        const beforeHotRead = readTableSelectionViewMetrics();
        const hotView = readTableSelection(rootEditor.read, {
          cellTypes: ['td', 'th'],
          tableType: 'table',
        });
        const afterHotRead = readTableSelectionViewMetrics();

        expect(view?.root).toBe(root);
        expect(hotView).toBe(view);
        expect(afterHotRead.cacheHitCount - beforeHotRead.cacheHitCount).toBe(
          1
        );
        expect(view?.anchors.map(({ id }) => id)).toEqual([
          'root-00',
          'root-01',
          'root-10',
          'root-11',
        ]);
      };

      assertMappedSelection(0);

      let previousVersion = rootEditor.read.runtime.snapshot().version;

      for (let prefixCount = 1; prefixCount <= 20; prefixCount++) {
        rootEditor.update((tx) => {
          tx.nodes.insert(createTable(`prefix-${prefixCount}`), { at: [0] });
        });

        const version = rootEditor.read.runtime.snapshot().version;

        expect(version).toBeGreaterThan(previousVersion);
        previousVersion = version;
        assertMappedSelection(prefixCount);
      }

      for (let prefixCount = 19; prefixCount >= 0; prefixCount--) {
        rootEditor.update((tx) => {
          tx.nodes.remove({ at: [0] });
        });

        const version = rootEditor.read.runtime.snapshot().version;

        expect(version).toBeGreaterThan(previousVersion);
        previousVersion = version;
        assertMappedSelection(prefixCount);
      }

      editor.update((tx) => {
        tx.nodes.insert(
          { children: [{ text: 'main-only' }], type: 'p' },
          { at: [0] }
        );
      });
      assertMappedSelection(0);

      const lastCell = rootEditor.read.points.end([0, 1, 1]);

      assert(lastCell);
      rootEditor.update.selection.set(lastCell);

      expect(
        editor.plugin(BaseTablePlugin).update.moveSelection({ at: lastCell })
      ).toBe(true);
      expect(rootEditor.read.selection()).toMatchObject({
        anchor: {
          offset: 0,
          path: [1, 0, 0, 0, 0],
          root,
        },
        focus: {
          offset: 0,
          path: [1, 0, 0, 0, 0],
          root,
        },
      });
    });
  });
});
