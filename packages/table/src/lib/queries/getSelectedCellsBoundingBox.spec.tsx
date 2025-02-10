/** @jsx jsx */

import type { TElement } from '@udecode/plate';

import { jsx } from '@udecode/plate-test-utils';
import { type PlateEditor, createPlateEditor } from '@udecode/plate/react';

import { getSelectedCellsBoundingBox } from './getSelectedCellsBoundingBox';

jsx;

jest.mock('../utils', () => ({
  getCellIndices: jest.fn((editor, element) => {
    switch (element.id) {
      case 'c11': {
        return { col: 0, row: 0 };
      }
      case 'c12': {
        return { col: 1, row: 0 };
      }
      case 'c13': {
        return { col: 2, row: 0 };
      }
      case 'c21': {
        return { col: 0, row: 1 };
      }
      case 'c22': {
        return { col: 1, row: 1 };
      }
      case 'c23': {
        return { col: 2, row: 1 };
      }
      case 'c31': {
        return { col: 0, row: 2 };
      }
      case 'c32': {
        return { col: 1, row: 2 };
      }
      case 'c33': {
        return { col: 2, row: 2 };
      }
      default: {
        return { col: 0, row: 0 };
      }
    }
  }),
}));

jest.mock('./getColSpan', () => ({
  getColSpan: jest.fn().mockReturnValue(1),
}));

jest.mock('./getRowSpan', () => ({
  getRowSpan: jest.fn().mockReturnValue(1),
}));

/** Create a minimal editor with 3x3 table contents */
const mockEditor = (
  <editor>
    <htable>
      <htr>
        <htd id="c11">
          <hp>Cell 11</hp>
        </htd>
        <htd id="c12">
          <hp>Cell 12</hp>
        </htd>
        <htd id="c13">
          <hp>Cell 13</hp>
        </htd>
      </htr>
      <htr>
        <htd id="c21">
          <hp>Cell 21</hp>
        </htd>
        <htd id="c22">
          <hp>Cell 22</hp>
        </htd>
        <htd id="c23">
          <hp>Cell 23</hp>
        </htd>
      </htr>
      <htr>
        <htd id="c31">
          <hp>Cell 31</hp>
        </htd>
        <htd id="c32">
          <hp>Cell 32</hp>
        </htd>
        <htd id="c33">
          <hp>Cell 33</hp>
        </htd>
      </htr>
    </htable>
  </editor>
) as any as PlateEditor;

describe('getSelectedCellsBoundingBox', () => {
  let editor: PlateEditor;

  beforeEach(() => {
    jest.clearAllMocks();
    editor = createPlateEditor({
      value: mockEditor.children,
    });
  });

  it('should return correct bounding box for single cell', () => {
    const c22 = (editor as any).children[0].children[1].children[1] as TElement;

    const boundingBox = getSelectedCellsBoundingBox(editor, [c22]);

    expect(boundingBox).toEqual({
      maxCol: 1,
      maxRow: 1,
      minCol: 1,
      minRow: 1,
    });
  });

  it('should return correct bounding box for adjacent cells in middle row', () => {
    const c21 = (editor as any).children[0].children[1].children[0] as TElement;
    const c22 = (editor as any).children[0].children[1].children[1] as TElement;
    const c23 = (editor as any).children[0].children[1].children[2] as TElement;

    const boundingBox = getSelectedCellsBoundingBox(editor, [c21, c22, c23]);

    expect(boundingBox).toEqual({
      maxCol: 2,
      maxRow: 1,
      minCol: 0,
      minRow: 1,
    });
  });

  it('should return correct bounding box for cells in middle column', () => {
    const c12 = (editor as any).children[0].children[0].children[1] as TElement;
    const c22 = (editor as any).children[0].children[1].children[1] as TElement;
    const c32 = (editor as any).children[0].children[2].children[1] as TElement;

    const boundingBox = getSelectedCellsBoundingBox(editor, [c12, c22, c32]);

    expect(boundingBox).toEqual({
      maxCol: 1,
      maxRow: 2,
      minCol: 1,
      minRow: 0,
    });
  });

  it('should return correct bounding box for L-shaped selection', () => {
    const c11 = (editor as any).children[0].children[0].children[0] as TElement;
    const c21 = (editor as any).children[0].children[1].children[0] as TElement;
    const c22 = (editor as any).children[0].children[1].children[1] as TElement;

    const boundingBox = getSelectedCellsBoundingBox(editor, [c11, c21, c22]);

    expect(boundingBox).toEqual({
      maxCol: 1,
      maxRow: 1,
      minCol: 0,
      minRow: 0,
    });
  });

  it('should return correct bounding box for diagonal cells (corners)', () => {
    const c11 = (editor as any).children[0].children[0].children[0] as TElement;
    const c33 = (editor as any).children[0].children[2].children[2] as TElement;

    const boundingBox = getSelectedCellsBoundingBox(editor, [c11, c33]);

    expect(boundingBox).toEqual({
      maxCol: 2,
      maxRow: 2,
      minCol: 0,
      minRow: 0,
    });
  });

  it('should handle cells with colspan and rowspan in middle', () => {
    const c22 = (editor as any).children[0].children[1].children[1] as TElement;

    // Mock a cell with colspan=2 and rowspan=2
    jest.requireMock('./getColSpan').getColSpan.mockReturnValueOnce(2);
    jest.requireMock('./getRowSpan').getRowSpan.mockReturnValueOnce(2);

    const boundingBox = getSelectedCellsBoundingBox(editor, [c22]);

    expect(boundingBox).toEqual({
      maxCol: 2, // colspan 2 from position 1 spans to 2
      maxRow: 2, // rowspan 2 from position 1 spans to 2
      minCol: 1,
      minRow: 1,
    });
  });
});
