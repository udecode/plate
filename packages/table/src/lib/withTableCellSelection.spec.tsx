/** @jsx jsxt */

import { type Element, type Text, TextApi } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

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
  input: TestEditor,
  options?: Partial<TableConfig['options']>
) =>
  createPlateEditor({
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
      editor.update.nodes.set({ align: 'center' }, { match: { type: 'p' } });

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
      expect(editor.plugin(BaseTablePlugin).getOption('isSelectingCell')).toBe(
        true
      );
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
      expect(editor.plugin(BaseTablePlugin).getOption('isSelectingCell')).toBe(
        false
      );
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
        anchor: editor.read.points.start([0, 0, 0])!,
        focus: editor.read.points.end([0, 1, 1])!,
      });

      expect(
        editor.plugin(BaseTablePlugin).getOption('selectedCellIds')
      ).toStrictEqual(['c11', 'c12', 'c21', 'c22']);
    });
  });
});
