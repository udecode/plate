/** @jsx jsxt */

import assert from 'node:assert/strict';

import { defineBasePlugin } from '@platejs/core';
import {
  createEditorView,
  property,
  schema,
  target,
  TextApi,
} from '@platejs/plite';
import {
  SelectionApi,
  type Element,
  type NodeSelection,
  type Selection,
} from '@platejs/plite';
import { getEditorLiveSelection } from '@platejs/plite/internal';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';

import { createTestTableEditor } from './__tests__/getTestTablePlugins';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from './BaseTablePlugin';
import type { TableDefinition } from './BaseTablePlugin';
import {
  createTableNodeSelection,
  readTableSelection,
  readTableSelectionViewMetrics,
} from './internal/selection';

const assertNodeSelection: (
  selection: Selection
) => asserts selection is NodeSelection = (selection) => {
  assert.ok(SelectionApi.isNode(selection));
};

describe('table selection slow contracts', () => {
  const getFixtureId = (node: Element) =>
    typeof node.id === 'string' ? node.id : undefined;

  {
    jsxt;

    const getTestTablePlugins = (
      options?: Partial<TableDefinition['initialState']>
    ) => [
      defineBasePlugin('tableSelectionTestSchema', {
        schema: {
          properties: {
            align: schema.elementProperty(property.string(), {
              target: target.group('element'),
            }),
            bold: schema.textProperty(property.boolean()),
            indent: schema.elementProperty(property.number(), {
              target: target.group('element'),
            }),
            italic: schema.textProperty(property.boolean()),
          },
        },
      }),
      BaseTablePlugin.configure({
        initialState: {
          disableMerge: true,
          ...options,
        },
      }),
    ];

    const createTableEditor = (
      input: TestEditor,
      options?: Partial<TableDefinition['initialState']>
    ) => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(options),
        selection: input.selection,
        initialValue: input.children,
      });
      const selection = editor.read.selection();
      const view =
        selection && editor.plugin(BaseTablePlugin).read.selection(selection);
      const tableSelection = view && createTableNodeSelection(view);

      if (tableSelection) editor.update.selection.set(tableSelection);

      return editor;
    };

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

          const texts = editor.read.nodes.toArray({
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
          editor.update.nodes.set({ align: 'center' }, { type: 'paragraph' });

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

          editor.update.nodes.set(
            { backgroundColor: 'red' },
            { at: [0, 1, 0] }
          );

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
                    <htd backgroundColor="red">
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
            type: 'paragraph',
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

      describe('selection view', () => {
        it('derives multi-cell geometry from the editor selection', () => {
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
          const view = editor.plugin(BaseTablePlugin).read.selection();

          assert.ok(view);
          expect(view.cellKeys).toStrictEqual(
            [
              [0, 0, 0],
              [0, 0, 1],
              [0, 1, 0],
              [0, 1, 1],
            ].map((path) => editor.key(path)!)
          );
          expect(
            view.anchors.map(({ cell }) => getFixtureId(cell))
          ).toStrictEqual([
            'c11',
            'c12',
            'c21',
            'c22',
          ]);
          expect(view.table.type).toBe('table');
          expect(view.anchors).toHaveLength(4);
          expect(view.hasCellKey(editor.key([0, 0, 1])!)).toBe(true);
          expect(
            getFixtureId(
              view.grid.byKey.get(editor.key([0, 1, 0])!)!.cell
            )
          ).toBe('c21');
        });

        it('returns one-cell geometry when the selection stays inside one cell', () => {
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
          const view = editor.plugin(BaseTablePlugin).read.selection();

          assert.ok(view);
          expect(view.cellKeys).toEqual([editor.key([0, 0, 0])!]);
          expect(view.anchors).toHaveLength(1);
          expect(view.table.type).toBe('table');
          expect(view.hasCellKey(editor.key([0, 0, 0])!)).toBe(true);
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

          editor.update.nodes.set(
            { backgroundColor: 'red' },
            { at: [0, 0, 0] }
          );
          const view = editor.plugin(BaseTablePlugin).read.selection();

          assert.ok(view);
          expect(view.grid.byKey.get(editor.key([0, 0, 0])!)?.cell).toMatchObject({
            backgroundColor: 'red',
            id: 'c11',
          });
          expect(
            view.anchors.map(({ cell }) => getFixtureId(cell))
          ).toStrictEqual([
            'c11',
            'c12',
          ]);
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
            editor.plugin(BaseTablePlugin).read.selection()?.cellKeys
          ).toStrictEqual(
            [
              [0, 0, 0],
              [0, 0, 1],
            ].map((path) => editor.key(path)!)
          );

          editor.update.selection.set(editor.read.points.start([0, 0, 0])!);

          expect(editor.plugin(BaseTablePlugin).read.selection()?.cellKeys).toEqual([
            editor.key([0, 0, 0])!,
          ]);
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
            editor.plugin(BaseTablePlugin).read.selection()?.cellKeys
          ).toStrictEqual(
            [
              [0, 0, 0],
              [0, 0, 1],
              [0, 1, 0],
              [0, 1, 1],
            ].map((path) => editor.key(path)!)
          );
        });
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: [
          BaseTablePlugin.configure({
            initialState: { disableMerge: true },
          }),
        ],
        selection: input.selection,
        initialValue: input.children,
      });

    describe('selection view fields', () => {
      it('returns selected cells, keys, and table for a multi-cell selection', () => {
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
        const view = editor.plugin(BaseTablePlugin).read.selection();

        assert.ok(view);
        expect(view.cellEntries).toHaveLength(2);
        expect(view.anchors.map(({ cell }) => getFixtureId(cell))).toEqual([
          'c11',
          'c21',
        ]);
        expect(view.cellKeys).toEqual(
          [
            [0, 0, 0],
            [0, 1, 0],
          ].map((path) => editor.key(path)!)
        );
        expect(view.tableKey).toBe(editor.key([0])!);
        expect(view.table.type).toBe('table');
        expect(
          getFixtureId(
            view.grid.byKey.get(editor.key([0, 1, 0])!)!.cell
          )
        ).toBe('c21');
        expect(view.hasCellKey(editor.key([0, 0, 0])!)).toBe(true);
      });

      it('returns one-cell geometry and updates after selection changes', () => {
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

        expect(editor.plugin(BaseTablePlugin).read.selection()?.anchors).toHaveLength(
          1
        );

        editor.update.selection.set({
          kind: 'text',
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 1, 0, 0] },
        });

        expect(editor.plugin(BaseTablePlugin).read.selection()?.anchors).toHaveLength(
          2
        );
      });

      it('returns one exact cell for a single-cell selection', () => {
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
        const view = editor.plugin(BaseTablePlugin).read.selection();

        assert.ok(view);
        expect(view.cellEntries).toHaveLength(1);
        expect(view.cellKeys).toEqual([editor.key([0, 0, 0])!]);
        expect(view.tableKey).toBe(editor.key([0])!);
      });
    });
  }

  describe('NodeSelection mapping', () => {
    const createTable = (prefix: string) => ({
      children: Array.from({ length: 2 }, (_, row) => ({
        children: Array.from({ length: 2 }, (innerValue, col) => {
          const id = `${prefix}-${row}${col}`;

          return {
            children: [{ children: [{ text: id }], type: 'paragraph' }],
            id,
            type: 'tableCell',
          };
        }),
        type: 'tableRow',
      })),
      id: `${prefix}-table`,
      type: 'table',
    });
    const RootHolderPlugin = defineBasePlugin('tableSelectionRootHolder', {
      schema: {
        element: {
          type: 'rootHolder',
          contentRoots: {
            body: {
              content: schema.content.type('table', {
                default: { type: 'table' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          blockContent: true,
          void: 'block',
        },
      },
    });
    const getSelectionTypes = (
      editor: ReturnType<typeof createTestTableEditor>
    ) => ({
      cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
      tableType: editor.plugin(BaseTablePlugin).schema.type,
    });

    it('isolates cached selection views by root snapshot index', () => {
      const root = 'table-selection-cache-root';
      const editor = createTestTableEditor({
        plugins: [BaseTablePlugin, RootHolderPlugin],
        initialValue: {
          children: [
            {
              childRoots: { body: root },
              children: [{ text: '' }],
              type: 'rootHolder',
            },
            createTable('main'),
          ],
          roots: { [root]: [createTable('root')] },
        },
      });
      const rootEditor = createEditorView(editor, {
        root,
      }) as unknown as typeof editor;
      const selectionTypes = getSelectionTypes(editor);
      const readMain = () =>
        editor.read((state) => readTableSelection(state, selectionTypes));
      const readRoot = () =>
        rootEditor.read((state) => readTableSelection(state, selectionTypes));
      const mainAnchor = editor.read.points.start([1, 0, 0]);
      const mainFocus = editor.read.points.end([1, 1, 1]);

      assert.ok(mainAnchor);
      assert.ok(mainFocus);

      expect(editor.read.runtime.snapshot().index).not.toBe(
        rootEditor.read.runtime.snapshot().index
      );

      editor.update.selection.set({ anchor: mainAnchor, focus: mainFocus });

      const mainView = readMain();

      assert.ok(mainView);
      expect(mainView.root).toBeUndefined();
      expect(readRoot()).toBeNull();
      expect(readMain()).toBe(mainView);

      const rootAnchor = rootEditor.read.points.start([0, 0, 0]);
      const rootFocus = rootEditor.read.points.end([0, 1, 1]);

      assert.ok(rootAnchor);
      assert.ok(rootFocus);

      rootEditor.update.selection.set({ anchor: rootAnchor, focus: rootFocus });

      const rootView = readRoot();

      assert.ok(rootView);
      expect(rootView.root).toBe(root);
      const mainReadOfRoot = readMain();

      assert.ok(mainReadOfRoot);
      expect(mainReadOfRoot.root).toBe(root);
      expect(mainReadOfRoot).not.toBe(mainView);
      expect(mainReadOfRoot).not.toBe(rootView);
      expect(readRoot()).toBe(rootView);
      expect(rootView).not.toBe(mainView);
    });

    it('drops deleted cell ranges without duplicating surviving cells', () => {
      const ids = ['a', 'b', 'c', 'd', 'e'];

      for (const removedIndex of ids.keys()) {
        const editor = createTestTableEditor({
          plugins: [BaseTablePlugin],
          initialValue: [
            {
              children: [
                {
                  children: ids.map((id) => ({
                    children: [{ children: [{ text: id }], type: 'paragraph' }],
                    id,
                    type: 'tableCell',
                  })),
                  type: 'tableRow',
                },
              ],
              type: 'table',
            },
          ],
        });
        const anchor = editor.read.points.start([0, 0, 0]);
        const focus = editor.read.points.end([0, 0, ids.length - 1]);

        assert.ok(anchor);
        assert.ok(focus);

        const view = editor
          .plugin(BaseTablePlugin)
          .read.selection({ anchor, focus });
        const tableSelection = view && createTableNodeSelection(view);

        assert.ok(tableSelection);
        editor.update.selection.set(tableSelection);
        editor.update((tx) => {
          tx.nodes.remove({ at: [0, 0, removedIndex] });
        });

        const selection = getEditorLiveSelection(editor);
        const expectedIds = ids.filter((_, index) => index !== removedIndex);

        assertNodeSelection(selection);
        expect(selection.paths).toHaveLength(expectedIds.length);
        expect(new Set(selection.paths.map(String)).size).toBe(
          expectedIds.length
        );
        expect(editor.plugin(BaseTablePlugin).read.selection()?.cellKeys).toEqual(
          expectedIds.map((_, index) => editor.key([0, 0, index])!)
        );
        expect([...selection.paths]).toEqual(
          expectedIds.map((_, index) => [0, 0, index])
        );
      }
    });

    it('rebases every persisted cell range across generated named-root versions', () => {
      const root = 'table-selection-root';
      const editor = createTestTableEditor({
        plugins: [BaseTablePlugin, RootHolderPlugin],
        initialValue: {
          children: [
            {
              childRoots: { body: root },
              children: [{ text: '' }],
              type: 'rootHolder',
            },
            createTable('main'),
          ],
          roots: {
            [root]: [createTable('root'), createTable('root-after')],
          },
        },
      });
      const rootEditor = createEditorView(editor, {
        root,
      }) as unknown as typeof editor;
      const anchor = rootEditor.read.points.start([0, 0, 0]);
      const focus = rootEditor.read.points.end([0, 1, 1]);

      assert.ok(anchor);
      assert.ok(focus);

      const rootRange = Object.freeze({ anchor, focus });
      const rootSelectionView = rootEditor.read((state) =>
        readTableSelection(state, {
          at: rootRange,
          ...getSelectionTypes(editor),
        })
      );
      const baseSelectionView = editor.read((state) =>
        readTableSelection(state, {
          at: rootRange,
          ...getSelectionTypes(editor),
        })
      );

      assert.ok(rootSelectionView, 'root-scoped table selection view');
      assert.ok(baseSelectionView, 'explicit-root base table selection view');
      expect(rootSelectionView.selection).toBe(rootRange);
      expect(baseSelectionView.selection).toBe(rootRange);

      const upperLeft = rootEditor.read.nodes.get([0, 0, 0], {
        type: BaseTableCellPlugin,
      });
      const upperRight = rootEditor.read.nodes.get([0, 0, 1], {
        type: BaseTableCellPlugin,
      });
      const upperRow = rootEditor.read.nodes.get([0, 0], {
        type: BaseTableRowPlugin,
      });
      const upperLeftPoint = rootEditor.read.points.start([0, 0, 0]);
      const upperRightPoint = rootEditor.read.points.start([0, 0, 1]);
      const lowerRightPoint = rootEditor.read.points.start([0, 1, 1]);

      assert.ok(upperLeft);
      assert.ok(upperRight);
      assert.ok(upperRow);
      assert.ok(upperLeftPoint);
      assert.ok(upperRightPoint);
      assert.ok(lowerRightPoint);
      expect(
        editor
          .plugin(BaseTablePlugin)
          .read.getAdjacentCell({ at: lowerRightPoint, deltaCol: -1 })
      ).toEqual([expect.objectContaining({ id: 'root-10' }), [0, 1, 0]]);
      expect(
        editor
          .plugin(BaseTablePlugin)
          .read.getAdjacentCell({ at: lowerRightPoint, deltaRow: -1 })
      ).toEqual([expect.objectContaining({ id: 'root-01' }), [0, 0, 1]]);
      expect(
        editor.plugin(BaseTablePlugin).read.getCellInNextRow(upperLeftPoint)
      ).toEqual([expect.objectContaining({ id: 'root-10' }), [0, 1, 0]]);
      expect(
        editor
          .plugin(BaseTablePlugin)
          .read.getCellInPreviousRow(lowerRightPoint)
      ).toEqual([expect.objectContaining({ id: 'root-01' }), [0, 0, 1]]);
      expect(
        editor
          .plugin(BaseTablePlugin)
          .read.getNextCell(upperLeft, upperLeftPoint, upperRow)
      ).toEqual([expect.objectContaining({ id: 'root-01' }), [0, 0, 1]]);
      expect(
        editor
          .plugin(BaseTablePlugin)
          .read.getPreviousCell(upperRight, upperRightPoint, upperRow)
      ).toEqual([expect.objectContaining({ id: 'root-00' }), [0, 0, 0]]);

      const selectionView = editor
        .plugin(BaseTablePlugin)
        .read.selection(rootRange);
      const tableSelection =
        selectionView && createTableNodeSelection(selectionView);

      assert.ok(tableSelection);
      rootEditor.update.selection.set(tableSelection);

      const assertMappedSelection = (tableIndex: number) => {
        const selection = getEditorLiveSelection(rootEditor);

        assertNodeSelection(selection);
        expect(selection.root).toBe(root);
        expect(selection.paths).toHaveLength(4);
        expect(selection.paths.map((path) => path[0])).toEqual([
          tableIndex,
          tableIndex,
          tableIndex,
          tableIndex,
        ]);

        const view = rootEditor.read((state) =>
          readTableSelection(state, {
            ...getSelectionTypes(editor),
          })
        );
        const beforeHotRead = readTableSelectionViewMetrics();
        const hotView = rootEditor.read((state) =>
          readTableSelection(state, {
            ...getSelectionTypes(editor),
          })
        );
        const afterHotRead = readTableSelectionViewMetrics();

        expect(view?.root).toBe(root);
        expect(hotView).toBe(view);
        expect(afterHotRead.cacheHitCount - beforeHotRead.cacheHitCount).toBe(
          1
        );
        expect(view?.anchors.map(({ cell }) => getFixtureId(cell))).toEqual([
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

        const { version } = rootEditor.read.runtime.snapshot();

        expect(version).toBeGreaterThan(previousVersion);
        previousVersion = version;
        assertMappedSelection(prefixCount);
      }

      for (let prefixCount = 19; prefixCount >= 0; prefixCount--) {
        rootEditor.update((tx) => {
          tx.nodes.remove({ at: [0] });
        });

        const { version } = rootEditor.read.runtime.snapshot();

        expect(version).toBeGreaterThan(previousVersion);
        previousVersion = version;
        assertMappedSelection(prefixCount);
      }

      editor.update((tx) => {
        tx.nodes.insert(
          { children: [{ text: 'main-only' }], type: 'paragraph' },
          { at: [0] }
        );
      });
      assertMappedSelection(0);

      const lastCell = rootEditor.read.points.end([0, 1, 1]);

      assert.ok(lastCell);
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
