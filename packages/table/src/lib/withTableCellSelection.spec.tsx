/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { BaseTablePlugin, type TableConfig } from './BaseTablePlugin';

jsxt;

const getTestTablePlugins = (options?: Partial<TableConfig['options']>) => [
  BaseTablePlugin.configure({
    options: {
      disableMerge: true,
      ...options,
    },
  }),
];

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('withTableCellSelection', () => {
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
      ) as any as SlateEditor;

      expect(createTableEditor(input).api.marks()).toEqual({ bold: true });
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
        ) as any as SlateEditor,
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
        ) as any as SlateEditor,
        name: 'drops marks that are not shared by every selected text node',
      },
    ])('$name', ({ expected, input }) => {
      expect(createTableEditor(input).api.marks()).toEqual(expected);
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);
      editor.tf.addMark('bold', true);

      expect(editor.children).toEqual(
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);
      editor.tf.removeMark('bold');

      expect(editor.children).toEqual(
        (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext>bold</htext>
                    <htext italic> bold italic</htext>
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
                    <htext>plain bold</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>test4</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ).children
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);
      editor.tf.setNodes(
        { align: 'center' },
        { match: (node) => node.type === 'p' }
      );

      expect(editor.children).toEqual(
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);
      editor.tf.unsetNodes(['align', 'indent'], {
        match: (node) => node.type === 'p',
      });

      expect(editor.children).toEqual(
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
});
