/** @jsx jsxt */

import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';
import { BaseTablePlugin } from './BaseTablePlugin';
import assert from 'node:assert/strict';

describe('table removal', () => {
  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('update.remove', () => {
      it('removes the current table and keeps surrounding blocks', () => {
        const input = (
          <editor>
            <hp>before</hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>after</hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.remove();

        expect(editor.read.children()).toMatchObject([
          { children: [{ text: 'before' }], type: 'paragraph' },
          { children: [{ text: 'after' }], type: 'paragraph' },
        ]);
      });

      it('does nothing when the selection is outside a table', () => {
        const input = (
          <editor>
            <hp>
              text
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.remove();

        expect(editor.read.children()).toMatchObject(input.children);
      });
    });
  }
  jsxt;

  describe('when 2x2', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes a column (disableMerge: $disableMerge)', ({ disableMerge }) => {
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
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>
                  22
                  <cursor />
                </hp>
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
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
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

      editor.update.table.removeColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 12', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes cell 12 (disableMerge: $disableMerge)', ({ disableMerge }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>
                  12
                  <cursor />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
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
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
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

      editor.update.table.removeColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 11', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes cell 11 (disableMerge: $disableMerge)', ({ disableMerge }) => {
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
            <htr>
              <htd colSpan={2}>
                <hp>21</hp>
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
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
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

      editor.update.table.removeColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 21', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('keeps the table unchanged when no second-column match exists (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
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
            <htr>
              <htd>
                <hp>
                  21
                  <cursor />
                </hp>
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
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  21
                  <cursor />
                </hp>
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

      editor.update.table.removeColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  it('shrinks table colSizes when deleting a column', () => {
    const input = (
      <editor>
        <htable colSizes={[40, 60]}>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>
                12
                <cursor />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTestTableEditor({
      plugins: getTestTablePlugins({ disableMerge: true }),
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.table.removeColumn();

    expect(editor.read.children()).toMatchObject([
      {
        colSizes: [40],
        type: 'table',
      },
    ]);
  });

  it('deletes a selected column spanning every row', () => {
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

    const editor = createTestTableEditor({
      plugins: getTestTablePlugins({ disableMerge: true }),
      selection: input.selection,
      initialValue: input.children,
    });
    editor.update.table.removeColumn();

    expect(editor.read.text.string([0])).toBe('1222');
    expect(
      editor.read.nodes.toArray({ at: [], type: 'tableCell' })
    ).toHaveLength(2);
  });

  {
    jsxt;

    const createTableEditor = (
      input: TestEditor,
      { disableMerge = true }: { disableMerge?: boolean } = {}
    ) =>
      createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('update.removeRow', () => {
      it('deletes a fully selected row', () => {
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
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.removeRow();

        expect(editor.read.text.string([0])).toBe('2122');
        expect(
          editor.read.nodes.toArray({ at: [], type: 'tableRow' })
        ).toHaveLength(1);
      });

      it('removes the current row when the table has more than one row', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    21
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.removeRow();

        const entry = editor.read.nodes.get([0], { type: BaseTablePlugin });
        assert(entry);
        expect(entry[0].children).toHaveLength(1);
        expect(editor.read.text.string([0, 0, 0])).toBe('11');
      });

      it('keeps the last remaining row intact', () => {
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
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        editor.update.table.removeRow();

        expect(editor.read.children()).toMatchObject(input.children);
      });
    });
  }
});
