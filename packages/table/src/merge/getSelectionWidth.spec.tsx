/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { getTableGridAbove } from '../queries/getTableGridAbove';
import { getSelectionWidth } from './getSelectionWidth';

jsx;

describe.only('getSelectionWith', () => {
  it('getSelectionWith is Work', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              1<anchor />
            </htd>
            <htd>
              2<focus />
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as PlateEditor;

    const output = 2;

    const editor = createPlateEditor({
      editor: input,
    });

    const cells = getTableGridAbove(editor, { format: 'cell' });

    expect(getSelectionWidth(cells)).toEqual(output);
  });

  describe('getSelectionWith is work on merged', () => {
    it('width should be 3', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd colSpan={2}>
                12
                <anchor />
              </htd>
              <htd>3</htd>
            </htr>
            <htr>
              <htd>1</htd>
              <htd>2</htd>
              <htd>
                3<focus />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const output = 3;

      const editor = createPlateEditor({
        editor: input,
      });

      const cells = getTableGridAbove(editor, { format: 'cell' });

      expect(getSelectionWidth(cells)).toEqual(output);
    });

    it('width should be 4', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd colSpan={2}>
                12
                <anchor />
              </htd>
              <htd>3</htd>
              <htd>4</htd>
            </htr>
            <htr>
              <htd colSpan={4}>1234</htd>
            </htr>
            <htr>
              <htd>1</htd>
              <htd>2</htd>
              <htd>3</htd>
              <htd>
                4<focus />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const output = 4;

      const editor = createPlateEditor({
        editor: input,
      });

      const cells = getTableGridAbove(editor, { format: 'cell' });

      expect(getSelectionWidth(cells)).toEqual(output);
    });

    it('worked on column merging', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd colSpan={2}>
                12
                <anchor />
              </htd>
              <htd rowSpan={2} colSpan={2}>
                34
              </htd>
            </htr>
            <htr>
              <htd>1</htd>
              <htd>2</htd>
            </htr>
            <htr>
              <htd colSpan={3}>123</htd>
              <htd>
                4
                <focus />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as PlateEditor;

      const output = 4;

      const editor = createPlateEditor({
        editor: input,
      });

      const cells = getTableGridAbove(editor, { format: 'cell' });

      expect(getSelectionWidth(cells)).toEqual(output);
    });
  });
});
