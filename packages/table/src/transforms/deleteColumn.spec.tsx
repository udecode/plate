/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createTablePlugin } from '../createTablePlugin';
import { deleteColumn } from './deleteColumn';

jsx;

describe('deleteColumn', () => {
  describe('when 2x2', () => {
    it('should delete column', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>21</hp>
              </htd>
              <htd rowIndex={1} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      deleteColumn(editor);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 12', () => {
    it('should delete cell 12', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>
                  12
                  <cursor />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={2}>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      deleteColumn(editor);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 11', () => {
    it('should delete 11', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>
                  11
                  <cursor />
                </hp>
              </htd>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={2}>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={1} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={2}>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      console.log(
        'before delete',
        JSON.stringify(editor.children, undefined, 4)
      );
      deleteColumn(editor);
      console.log(
        'after delete',
        JSON.stringify(editor.children, undefined, 4)
      );

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 21', () => {
    it('should do nothing', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={2}>
                <hp>
                  21
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd rowIndex={0} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>11</hp>
              </htd>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={1}>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd rowIndex={1} colIndex={0} rowSpan={1} colSpan={2}>
                <hp>
                  21
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createTablePlugin()],
      });

      deleteColumn(editor);

      expect(editor.children).toEqual(output.children);
    });
  });
});
