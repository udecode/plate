/** @jsxRuntime classic */
/** @jsx jsxt */

import assert from 'node:assert/strict';

import {
  getEditorLiveSelection,
  jsxt,
  type TestEditor,
} from '#platejs-test-internal';

import { ContentSlice, definePlugin, schema } from '../../../core';
import {
  createTestBaseTableEditor,
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';

jsxt;

const createTableSelectionEditor = (
  input: TestEditor,
  allowCellSpanEditing: boolean
) =>
  createTestTableEditor({
    plugins: getTestTablePlugins({ allowCellSpanEditing }),
    selection: input.selection,
    initialValue: input.children,
  });

describe('BaseTablePlugin deletion', () => {
  describe('cell boundaries', () => {
    it('blocks Backspace at the start of the current cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                  cell
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward({ unit: 'character' });

      expect(editor.read.children()).toEqual(input.children);
    });

    it('blocks Delete at the end of the current cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  cell
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward({ unit: 'character' });

      expect(editor.read.children()).toEqual(input.children);
    });

    it('keeps the table intact when Backspace runs after it', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <cursor />
            after
          </hp>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteBackward({ unit: 'character' });

      expect(editor.read.children()).toEqual(input.children);
    });

    it('keeps the table intact when Delete runs before it', () => {
      const input = (
        <editor>
          <hp>
            before
            <cursor />
          </hp>
          <htable>
            <htr>
              <htd>
                <hp>cell</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.text.deleteForward({ unit: 'character' });

      expect(editor.read.children()).toEqual(input.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/21
  // https://github.com/udecode/editor-protocol/issues/25
  describe('Delete when selecting cells', () => {
    describe.each([
      { allowCellSpanEditing: false },
      { allowCellSpanEditing: true },
    ])(
      'with allowCellSpanEditing: $allowCellSpanEditing',
      ({ allowCellSpanEditing }) => {
        let editor: ReturnType<typeof createTableSelectionEditor>;
        let output: TestEditor;

        beforeEach(() => {
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

          output = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>
                      <htext />
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
                      <htext />
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

          editor = createTableSelectionEditor(input, allowCellSpanEditing);

          editor.update.fragment.delete();
        });

        it('remove the cells content', () => {
          expect(editor.read.children()).toMatchObject(output.children);
        });

        it('preserves the structural cell selection', () => {
          expect(getEditorLiveSelection(editor)).toMatchObject({
            anchorPath: [0, 0, 0],
            focusPath: [0, 1, 0],
            kind: 'node',
          });
          expect(editor.read.selection.ranges()).toHaveLength(2);
        });
      }
    );
  });

  describe('ranges that cross a table edge', () => {
    it('removes a document-leading table when select-all deletes everything [EDIT-TABLE-RANGE-EDGE-001]', () => {
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
                <hp>c</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            qr
            <focus />
          </hp>
        </editor>
      ) as TestEditor;
      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

      assert.ok(input.selection);
      editor.update.selection.set(input.selection);
      editor.update.fragment.delete();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('leaves two empty paragraphs when Enter replaces a select-all over a document-leading table [EDIT-TABLE-RANGE-EDGE-001]', () => {
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
                <hp>c</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            qr
            <focus />
          </hp>
        </editor>
      ) as TestEditor;
      const output = (
        <editor>
          <hp>
            <htext />
          </hp>
          <hp>
            <htext />
          </hp>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

      assert.ok(input.selection);
      editor.update.selection.set(input.selection);
      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('keeps every row and cell when an explicit range runs from a paragraph into the first cell [EDIT-TABLE-RANGE-EDGE-001]', () => {
      const input = (
        <editor>
          <hp>
            <anchor />p
          </hp>
          <htable>
            <htr>
              <htd>
                <hp>
                  a<focus />
                </hp>
              </htd>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>c</hp>
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
          <hp>
            <htext />
          </hp>
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
                <hp>c</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

      assert.ok(input.selection);
      editor.update.fragment.delete({ at: input.selection });

      expect(editor.read.children()).toEqual(output.children);
    });

    it('types over a transaction range from a cell into trailing text without joining the text into the cell [EDIT-TABLE-RANGE-EDGE-001]', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>
                  <anchor />b
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>c</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            q<focus />r
          </hp>
        </editor>
      ) as TestEditor;
      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>x</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
          <hp>r</hp>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });
      const range = input.selection;

      assert.ok(range);
      editor.update((tx) => {
        tx.selection.set(range);
        tx.text.insert('x');
      });

      expect(editor.read.children()).toEqual(output.children);
    });

    it('pastes over an explicit range from a paragraph into the first cell without removing the cell [EDIT-TABLE-RANGE-EDGE-001]', () => {
      const input = (
        <editor>
          <hp>
            <anchor />p
          </hp>
          <htable>
            <htr>
              <htd>
                <hp>
                  a<focus />
                </hp>
              </htd>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>c</hp>
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
          <hp>w</hp>
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
                <hp>c</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

      assert.ok(input.selection);
      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [{ text: 'w' }],
          openEnd: 0,
          openStart: 0,
        }),
        { at: input.selection }
      );

      expect(editor.read.children()).toEqual(output.children);
    });

    describe('into a table whose last row is covered by row spans', () => {
      const input = (
        <editor>
          <hp>
            <anchor />
            before
          </hp>
          <htable>
            <htr>
              <htd>
                <hp>
                  w<focus />
                </hp>
              </htd>
              <htd>
                <hp>v</hp>
              </htd>
            </htr>
            <htr>
              <htd rowSpan={2}>
                <hp>ab</hp>
              </htd>
              <htd rowSpan={2}>
                <hp>x</hp>
              </htd>
            </htr>
            <htr />
          </htable>
        </editor>
      ) as TestEditor;
      const output = (
        <editor>
          <hp>
            <htext />
          </hp>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>v</hp>
              </htd>
            </htr>
            <htr>
              <htd rowSpan={2}>
                <hp>ab</hp>
              </htd>
              <htd rowSpan={2}>
                <hp>x</hp>
              </htd>
            </htr>
            <htr />
          </htable>
        </editor>
      ) as TestEditor;
      const [, table] = output.children;
      const createEditor = () =>
        createTestTableEditor({
          plugins: getTestTablePlugins(),
          initialValue: input.children,
        });

      it('keeps every row and cell when an explicit range is deleted [EDIT-TABLE-RANGE-EDGE-001]', () => {
        const editor = createEditor();

        assert.ok(input.selection);
        editor.update.fragment.delete({ at: input.selection });

        expect(editor.read.children()).toEqual(output.children);
      });

      it('keeps every row and cell when a paste replaces an explicit range [EDIT-TABLE-RANGE-EDGE-001]', () => {
        const editor = createEditor();

        assert.ok(input.selection);
        editor.update.slice.replace(
          ContentSlice.fromJSON({
            content: [{ text: 'w' }],
            openEnd: 0,
            openStart: 0,
          }),
          { at: input.selection }
        );

        expect(editor.read.children()).toEqual([<hp>w</hp>, table]);
      });

      it('widens a selection set over the range to the end of the table', () => {
        const editor = createEditor();

        assert.ok(input.selection);
        editor.update.selection.set(input.selection);

        expect(editor.read.selection()).toEqual({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 1, 1, 0, 0] },
        });
      });
    });
  });

  it('keeps normal fragment deletion outside tables', () => {
    const input = (
      <editor>
        <hp>
          be
          <anchor />
          fore
          <focus />
          after
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins(),
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.fragment.delete();

    expect(editor.read.text.string([])).toBe('beafter');
  });

  it('uses an explicit named-root target instead of the ambient table selection', () => {
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
    const targetRoot = 'table-explicit-target';
    const rootOwner = {
      childRoots: { body: targetRoot },
      children: [{ text: '' }],
      type: 'tableTestRootOwner',
    };
    const RootOwnerPlugin = definePlugin('tableTestRootOwner', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          contentRoots: {
            body: schema.content.type('paragraph', { min: 1 }),
          },
        },
      },
    });
    const editor = createTestBaseTableEditor({
      plugins: [...getTestTablePlugins(), RootOwnerPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update((tx) => {
      tx.nodes.insert(rootOwner, { at: [1] });
      tx.roots.create(targetRoot, [
        { children: [{ text: 'named' }], type: 'paragraph' },
      ]);
    });
    editor.update.fragment.delete({
      at: {
        anchor: { offset: 1, path: [0, 0], root: targetRoot },
        focus: { offset: 4, path: [0, 0], root: targetRoot },
      },
    });

    expect(editor.read.children()).toEqual([...input.children, rootOwner]);
    expect(editor.read.root(targetRoot)).toEqual([
      { children: [{ text: 'nd' }], type: 'paragraph' },
    ]);
  });
});
