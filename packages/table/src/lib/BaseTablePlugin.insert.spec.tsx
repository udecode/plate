/** @jsx jsxt */

import {
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '@platejs/test-utils';

import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';

describe('table insertion', () => {
  jsxt;

  describe('when inserting a table row', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'inserts a tr with empty cells (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
                <htd>
                  <hp>22</hp>
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
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
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

        editor.update.table.insertRow({ select: true });

        expect(editor.read.children()).toMatchObject(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      }
    );
  });

  describe('when inserting a table row at specific path', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'inserts a tr with empty cells (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
                <htd>
                  <hp>22</hp>
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
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
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
                  <hp>22</hp>
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

        editor.update.table.insertRow({ at: [0, 0], select: true });

        expect(editor.read.children()).toMatchObject(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      }
    );
  });

  describe('when inserting a table row before', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'inserts a tr with empty cells before the current row (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
                <htd>
                  <hp>22</hp>
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
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
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
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.table.insertRow({ before: true, select: true });

        expect(editor.read.children()).toMatchObject(output.children);
      }
    );
  });
});
