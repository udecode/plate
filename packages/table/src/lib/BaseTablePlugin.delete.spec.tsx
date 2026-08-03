/** @jsx jsxt */

import { defineBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import {
  createTestBaseTableEditor,
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';

jsxt;

const createCellSelectionEditor = (input: TestEditor, disableMerge: boolean) =>
  createTestTableEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge }),
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
      { disableMerge: true },
      { disableMerge: false },
    ])('with disableMerge: $disableMerge', ({ disableMerge }) => {
      let editor: ReturnType<typeof createCellSelectionEditor>;
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

        editor = createCellSelectionEditor(input, disableMerge);

        editor.update.fragment.delete();
      });

      it('remove the cells content', () => {
        expect(editor.read.children()).toMatchObject(output.children!);
      });

      it('preserves the structural cell selection', () => {
        expect(editor.read.selection()).toMatchObject({
          ...output.selection!,
          kind: 'table-cell',
        });
        expect(editor.read.selection.ranges()).toHaveLength(2);
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
    const RootOwnerPlugin = defineBasePlugin('tableTestRootOwner', {
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

    expect(editor.read.children()).toEqual([...input.children!, rootOwner]);
    expect(editor.read.root(targetRoot)).toEqual([
      { children: [{ text: 'nd' }], type: 'paragraph' },
    ]);
  });
});
