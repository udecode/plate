/** @jsx jsxt */

import { type SlateEditor, type TElement, createSlateEditor } from 'platejs';

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

const createTableEditor = (
  input: SlateEditor,
  options?: Partial<TableConfig['options']>
) =>
  createSlateEditor({
    plugins: getTestTablePlugins(options),
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      editor.tf.setNodes({ background: 'red' }, { at: [0, 1, 0] });

      expect(editor.children).toEqual(
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      expect(
        editor.getOption(BaseTablePlugin, 'selectedCellIds')
      ).toStrictEqual(['c11', 'c12', 'c21', 'c22']);
      expect(
        editor
          .getOption(BaseTablePlugin, 'selectedCells')
          ?.map((cell: TElement) => cell.id)
      ).toStrictEqual(['c11', 'c12', 'c21', 'c22']);
      expect(
        editor
          .getOption(BaseTablePlugin, 'selectedTables')
          ?.map((table: TElement) => table.type)
      ).toStrictEqual(['table']);
      expect(editor.getOption(BaseTablePlugin, 'isSelectingCell')).toBe(true);
      expect(editor.getOption(BaseTablePlugin, 'isCellSelected', 'c12')).toBe(
        true
      );
      expect(editor.getOption(BaseTablePlugin, 'selectedCell', 'c21')?.id).toBe(
        'c21'
      );
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      expect(editor.getOption(BaseTablePlugin, 'selectedCellIds')).toBeNull();
      expect(editor.getOption(BaseTablePlugin, 'selectedCells')).toBeNull();
      expect(editor.getOption(BaseTablePlugin, 'selectedTables')).toBeNull();
      expect(editor.getOption(BaseTablePlugin, 'isSelectingCell')).toBe(false);
      expect(editor.getOption(BaseTablePlugin, 'isCellSelected', 'c11')).toBe(
        false
      );
      expect(
        editor.getOption(BaseTablePlugin, 'selectedCell', 'c11')
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      editor.tf.setNodes({ background: 'red' }, { at: [0, 0, 0] });

      expect(
        editor.getOption(BaseTablePlugin, 'selectedCell', 'c11')
      ).toMatchObject({
        background: 'red',
        id: 'c11',
      });
      expect(
        editor
          .getOption(BaseTablePlugin, 'selectedCells')
          ?.map((cell: TElement) => cell.id)
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      editor.tf.select({
        anchor: editor.api.start([0, 0, 0])!,
        focus: editor.api.end([0, 0, 1])!,
      });

      expect(
        editor.getOption(BaseTablePlugin, 'selectedCellIds')
      ).toStrictEqual(['c11', 'c12']);

      editor.tf.select(editor.api.start([0, 0, 0])!);

      expect(editor.getOption(BaseTablePlugin, 'selectedCellIds')).toBeNull();
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
      ) as any as SlateEditor;

      const editor = createTableEditor(input, { disableMerge: false });

      editor.tf.select({
        anchor: editor.api.start([0, 0, 0])!,
        focus: editor.api.end([0, 1, 1])!,
      });

      expect(
        editor.getOption(BaseTablePlugin, 'selectedCellIds')
      ).toStrictEqual(['c11', 'c12', 'c21', 'c22']);
    });
  });
});
