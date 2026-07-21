/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';

jsxt;

describe('withDeleteTable', () => {
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
      const editor = createPlateEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        value: input.children,
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
      const editor = createPlateEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        value: input.children,
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
      const editor = createPlateEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        value: input.children,
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
      const editor = createPlateEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        value: input.children,
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
      let editor: ReturnType<typeof createPlateEditor>;
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

        editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        editor.update.fragment.delete();
      });

      it('remove the cells content', () => {
        expect(editor.read.children()).toMatchObject(output.children!);
      });

      it('set the selection to the last cell', () => {
        expect(editor.read.selection()).toEqual(output.selection!);
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
    const editor = createPlateEditor({
      plugins: getTestTablePlugins(),
      selection: input.selection,
      value: input.children,
    });

    editor.update.fragment.delete();

    expect(editor.read.text.string([])).toBe('beafter');
  });
});
