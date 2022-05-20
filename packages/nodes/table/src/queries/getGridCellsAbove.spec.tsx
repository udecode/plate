/** @jsx jsx */

import { createPlateEditor, PlateEditor, TElement } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { getGridCellsAbove } from './getGridCellsAbove';

jsx;

describe('getGridCellsAbove', () => {
  describe('when selection is in cell 1', () => {
    it('should be [cell 1]', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                1<cursor />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <fragment>
          <htd>1</htd>
        </fragment>
      ) as any) as TElement[];

      const editor = createPlateEditor({
        editor: input,
      });

      const cells = getGridCellsAbove(editor);

      expect(cells).toEqual(output);
    });
  });

  describe('when selection is from cell 11 to cell 22', () => {
    it('should be [11, 12, 21, 22]', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <anchor />
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

      const output = ((
        <fragment>
          <htd>11</htd>
          <htd>12</htd>
          <htd>21</htd>
          <htd>22</htd>
        </fragment>
      ) as any) as TElement[];

      const editor = createPlateEditor({
        editor: input,
      });

      const cells = getGridCellsAbove(editor);

      expect(cells).toEqual(output);
    });
  });

  describe('when selection is from cell 22 to cell 11', () => {
    it('should be [11, 12, 21, 22]', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <focus />
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                22
                <anchor />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <fragment>
          <htd>11</htd>
          <htd>12</htd>
          <htd>21</htd>
          <htd>22</htd>
        </fragment>
      ) as any) as TElement[];

      const editor = createPlateEditor({
        editor: input,
      });

      const cells = getGridCellsAbove(editor);

      expect(cells).toEqual(output);
    });
  });

  describe('when selection is from cell 12 to cell 21', () => {
    it('should be [11, 12, 21, 22]', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                12
                <anchor />
              </htd>
            </htr>
            <htr>
              <htd>
                21
                <focus />
              </htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <fragment>
          <htd>11</htd>
          <htd>12</htd>
          <htd>21</htd>
          <htd>22</htd>
        </fragment>
      ) as any) as TElement[];

      const editor = createPlateEditor({
        editor: input,
      });

      const cells = getGridCellsAbove(editor);

      expect(cells).toEqual(output);
    });
  });

  describe('when selection is from cell 12 to cell 21', () => {
    it('should be [11, 12, 21, 22]', () => {
      const input = ((
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                12
                <focus />
              </htd>
            </htr>
            <htr>
              <htd>
                21
                <anchor />
              </htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <fragment>
          <htd>11</htd>
          <htd>12</htd>
          <htd>21</htd>
          <htd>22</htd>
        </fragment>
      ) as any) as TElement[];

      const editor = createPlateEditor({
        editor: input,
      });

      const cells = getGridCellsAbove(editor);

      expect(cells).toEqual(output);
    });
  });
});
