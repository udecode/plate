/** @jsx jsx */

import { createPlateEditor, PlateEditor, TElement } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createTablePlugin } from './createTablePlugin';
import { withInsertFragmentTable } from './withInsertFragmentTable';

jsx;

describe('withInsertFragmentTable', () => {
  // https://github.com/udecode/editor-protocol/issues/13
  describe('when inserting table 2x1 into cell 11', () => {
    it('first table column should be replaced by the inserted table column', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <cursor />
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const fragment = ((
        <fragment>
          <htable>
            <htr>
              <htd>a</htd>
            </htr>
            <htr>
              <htd>b</htd>
            </htr>
          </htable>
        </fragment>
      ) as any) as TElement[];

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>a</htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>b</htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/14
  describe('when inserting table 1x2 into cell 11', () => {
    it('first table row should be replaced by the inserted table row', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <cursor />
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const fragment = ((
        <fragment>
          <htable>
            <htr>
              <htd>a</htd>
              <htd>b</htd>
            </htr>
          </htable>
        </fragment>
      ) as any) as TElement[];

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>a</htd>
              <htd>b</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/24
  describe('Insert a table when selecting table cells', () => {
    it('replace these cells', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                <anchor />
                11
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                22
                <focus />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const fragment = ((
        <fragment>
          <htable>
            <htr>
              <htd>a</htd>
              <htd>b</htd>
            </htr>
          </htable>
        </fragment>
      ) as any) as TElement[];

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>a</htd>
              <htd>b</htd>
            </htr>
            <htr>
              <htd>
                <htext />
              </htd>
              <htd>
                <htext />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      editor.deleteFragment();
      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/20
  describe('when inserting table 2x1 into cell 12', () => {
    it('second table column should be replaced by the inserted table column', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                12
                <cursor />
              </htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const fragment = ((
        <fragment>
          <htable>
            <htr>
              <htd>a</htd>
            </htr>
            <htr>
              <htd>b</htd>
            </htr>
          </htable>
        </fragment>
      ) as any) as TElement[];

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                <anchor />a
              </htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                <focus />b
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);

      const selection = output.selection!;
      selection.anchor.path.pop();
      selection.focus.path.pop();
      expect(editor.selection).toEqual(output.selection);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/32
  describe('when insert table 2x2 into cell 22', () => {
    it('should expand the table', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                22
                <cursor />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const fragment = ((
        <fragment>
          <htable>
            <htr>
              <htd>aa</htd>
              <htd>ab</htd>
            </htr>
            <htr>
              <htd>ba</htd>
              <htd>bb</htd>
            </htr>
          </htable>
        </fragment>
      ) as any) as TElement[];

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>12</htd>
              <htd>
                <htext />
              </htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                <anchor />
                aa
              </htd>
              <htd>ab</htd>
            </htr>
            <htr>
              <htd>
                <htext />
              </htd>
              <htd>ba</htd>
              <htd>
                <focus />
                bb
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [
          createTablePlugin({
            options: { newCellChildren: [{ text: '' }] },
          }),
        ],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);

      const selection = output.selection!;
      selection.anchor.path.pop();
      selection.focus.path.pop();
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('when insert table 2x2 into cell 22 with disableExpandOnInsert', () => {
    it('should not expand the table', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                22
                <cursor />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const fragment = ((
        <fragment>
          <htable>
            <htr>
              <htd>aa</htd>
              <htd>ab</htd>
            </htr>
            <htr>
              <htd>ba</htd>
              <htd>bb</htd>
            </htr>
          </htable>
        </fragment>
      ) as any) as TElement[];

      const output = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                <cursor />
                aa
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [
          createTablePlugin({
            options: {
              newCellChildren: [{ text: '' }],
              disableExpandOnInsert: true,
            },
          }),
        ],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);

      const selection = output.selection!;
      selection.anchor.path.pop();
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
