/** @jsx jsx */

import type { TElement } from '@udecode/plate';

import { jsx } from '@udecode/plate-test-utils';
import { type PlateEditor, createPlateEditor } from '@udecode/plate/react';

import {
  getSelectedCellsBorders,
  isSelectedCellBorder,
  isSelectedCellBordersNone,
  isSelectedCellBordersOuter,
} from './getSelectedCellsBorders';

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
  getCellTypes: jest.fn().mockReturnValue(['td']),
}));

jest.mock('./getColSpan', () => ({
  getColSpan: jest.fn().mockReturnValue(1),
}));

jest.mock('./getRowSpan', () => ({
  getRowSpan: jest.fn().mockReturnValue(1),
}));

jest.mock('./getTopTableCell', () => ({
  getTopTableCell: jest.fn(),
}));

jest.mock('./getLeftTableCell', () => ({
  getLeftTableCell: jest.fn(),
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

describe('getSelectedCellsBorders', () => {
  let editor: PlateEditor;

  beforeEach(() => {
    jest.clearAllMocks();
    editor = createPlateEditor({
      value: mockEditor.children,
    });
  });

  describe('when no cells are selected', () => {
    it('should return default values when no current cell found', () => {
      editor.api.block = jest.fn().mockReturnValue(null);

      const result = getSelectedCellsBorders(editor);

      expect(result).toEqual({
        bottom: true,
        left: true,
        none: false,
        outer: true,
        right: true,
        top: true,
      });
    });

    it('should use current cell if available', () => {
      const cell = {
        id: 'c22',
        borders: {
          bottom: { size: 1 },
          right: { size: 1 },
        },
      } as unknown as TElement;

      const cellAbove = {
        borders: { bottom: { size: 1 } }, // This provides top border for our cell
      } as unknown as TElement;

      const cellLeft = {
        borders: { right: { size: 1 } }, // This provides left border for our cell
      } as unknown as TElement;

      editor.api.block = jest.fn().mockReturnValue([cell]);
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      // Mock adjacent cells with borders
      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue([cellAbove]);
      jest
        .requireMock('./getLeftTableCell')
        .getLeftTableCell.mockReturnValue([cellLeft]);

      const result = getSelectedCellsBorders(editor);
      const noneResult = isSelectedCellBordersNone(editor, [cell]);
      const outerResult = isSelectedCellBordersOuter(editor, [cell]);
      const topResult = isSelectedCellBorder(editor, [cell], 'top');

      expect(result).toEqual({
        bottom: true,
        left: true,
        none: false,
        outer: true,
        right: true,
        top: true,
      });
      expect(noneResult).toBe(false);
      expect(outerResult).toBe(true);
      expect(topResult).toBe(true);
    });
  });

  describe('select.none option', () => {
    it('should detect when no borders are set', () => {
      const cell = {
        id: 'c22',
        borders: {
          bottom: { size: 0 },
          left: { size: 0 },
          right: { size: 0 },
          top: { size: 0 },
        },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      // Mock adjacent cells to return null (no adjacent cells)
      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue(null);
      jest
        .requireMock('./getLeftTableCell')
        .getLeftTableCell.mockReturnValue(null);

      const result = getSelectedCellsBorders(editor, [cell]);
      const noneResult = isSelectedCellBordersNone(editor, [cell]);

      expect(result.none).toBe(true);
      expect(noneResult).toBe(true);
    });

    it('should detect when any border is set', () => {
      const cell = {
        id: 'c22',
        borders: { bottom: { size: 0 }, top: { size: 1 } },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      // Add mocks
      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue(null);
      jest
        .requireMock('./getLeftTableCell')
        .getLeftTableCell.mockReturnValue(null);

      const result = getSelectedCellsBorders(editor, [cell]);
      const noneResult = isSelectedCellBordersNone(editor, [cell]);

      expect(result.none).toBe(false);
      expect(noneResult).toBe(false);
    });

    it('should check adjacent cells borders', () => {
      const cell = {
        id: 'c22',
        borders: { bottom: { size: 0 }, top: { size: 0 } },
      } as unknown as TElement;

      const cellAbove = {
        borders: { bottom: { size: 1 } },
      } as unknown as TElement;

      editor.api.findPath = jest.fn().mockReturnValue([0]);
      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue([cellAbove]);

      const result = getSelectedCellsBorders(editor, [cell]);
      const noneResult = isSelectedCellBordersNone(editor, [cell]);

      expect(result.none).toBe(false);
      expect(noneResult).toBe(false);
    });

    it('should skip none check when select.none is false', () => {
      const cell = {
        id: 'c22',
        borders: { bottom: { size: 1 }, top: { size: 1 } },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      const result = getSelectedCellsBorders(editor, [cell], {
        select: { none: false, outer: true, side: true },
      });

      expect(result.none).toBe(false);
    });
  });

  describe('select.outer option', () => {
    it('should detect when all outer borders are set', () => {
      const cell = {
        id: 'c11',
        borders: {
          bottom: { size: 1 },
          left: { size: 1 },
          right: { size: 1 },
          top: { size: 1 },
        },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      // First row/col cell doesn't need adjacent cells
      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue(null);
      jest
        .requireMock('./getLeftTableCell')
        .getLeftTableCell.mockReturnValue(null);

      const result = getSelectedCellsBorders(editor, [cell]);
      const outerResult = isSelectedCellBordersOuter(editor, [cell]);

      expect(result.outer).toBe(true);
      expect(outerResult).toBe(true);
    });

    it('should detect when any outer border is missing', () => {
      const cell = {
        id: 'c11',
        borders: {
          bottom: { size: 1 },
          left: { size: 0 },
          right: { size: 1 },
          top: { size: 1 },
        },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      // First row/col cell doesn't need adjacent cells
      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue(null);
      jest
        .requireMock('./getLeftTableCell')
        .getLeftTableCell.mockReturnValue(null);

      const result = getSelectedCellsBorders(editor, [cell]);
      const outerResult = isSelectedCellBordersOuter(editor, [cell]);

      expect(result.outer).toBe(false);
      expect(outerResult).toBe(false);
    });

    it('should check adjacent cells for outer borders', () => {
      const cell = {
        id: 'c22',
        borders: {
          bottom: { size: 1 },
          right: { size: 1 },
        },
      } as unknown as TElement;

      const cellAbove = {
        borders: { bottom: { size: 1 } },
      } as unknown as TElement;

      const cellLeft = {
        borders: { right: { size: 1 } },
      } as unknown as TElement;

      editor.api.findPath = jest.fn().mockReturnValue([0]);
      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue([cellAbove]);
      jest
        .requireMock('./getLeftTableCell')
        .getLeftTableCell.mockReturnValue([cellLeft]);

      const result = getSelectedCellsBorders(editor, [cell]);
      const outerResult = isSelectedCellBordersOuter(editor, [cell]);

      expect(result.outer).toBe(true);
      expect(outerResult).toBe(true);
    });

    it('should skip outer check when select.outer is false', () => {
      const cell = {
        id: 'c11',
        borders: {
          bottom: { size: 0 },
          left: { size: 0 },
          right: { size: 0 },
          top: { size: 0 },
        },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      const result = getSelectedCellsBorders(editor, [cell], {
        select: { none: true, outer: false, side: true },
      });

      expect(result.outer).toBe(true); // Default when not checking
    });
  });

  describe('select.side option', () => {
    it('should detect individual border states correctly', () => {
      const cell = {
        id: 'c22',
        borders: {
          bottom: { size: 1 },
          left: { size: 0 },
          right: { size: 1 },
          top: { size: 0 },
        },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      const cellAbove = {
        borders: { bottom: { size: 0 } },
      } as unknown as TElement;
      const cellLeft = {
        borders: { right: { size: 0 } },
      } as unknown as TElement;

      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue([cellAbove]);
      jest
        .requireMock('./getLeftTableCell')
        .getLeftTableCell.mockReturnValue([cellLeft]);

      const result = getSelectedCellsBorders(editor, [cell]);
      const topResult = isSelectedCellBorder(editor, [cell], 'top');
      const bottomResult = isSelectedCellBorder(editor, [cell], 'bottom');
      const leftResult = isSelectedCellBorder(editor, [cell], 'left');
      const rightResult = isSelectedCellBorder(editor, [cell], 'right');

      expect(result).toEqual(
        expect.objectContaining({
          bottom: true,
          left: false,
          right: true,
          top: false,
        })
      );
      expect(topResult).toBe(false);
      expect(bottomResult).toBe(true);
      expect(leftResult).toBe(false);
      expect(rightResult).toBe(true);
    });

    it('should handle first row/column borders', () => {
      const cell = {
        id: 'c11', // First row, first column
        borders: {
          bottom: { size: 1 },
          left: { size: 1 },
          right: { size: 0 },
          top: { size: 1 },
        },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      const result = getSelectedCellsBorders(editor, [cell]);
      const topResult = isSelectedCellBorder(editor, [cell], 'top');
      const leftResult = isSelectedCellBorder(editor, [cell], 'left');

      expect(result).toEqual(
        expect.objectContaining({
          left: true,
          top: true,
        })
      );
      expect(topResult).toBe(true);
      expect(leftResult).toBe(true);
    });

    it('should check adjacent cells for side borders', () => {
      const cell = {
        id: 'c22',
        borders: {
          bottom: { size: 1 },
          right: { size: 1 },
        },
      } as unknown as TElement;

      const cellAbove = {
        borders: { bottom: { size: 1 } },
      } as unknown as TElement;

      const cellLeft = {
        borders: { right: { size: 0 } },
      } as unknown as TElement;

      editor.api.findPath = jest.fn().mockReturnValue([0]);
      jest
        .requireMock('./getTopTableCell')
        .getTopTableCell.mockReturnValue([cellAbove]);
      jest
        .requireMock('./getLeftTableCell')
        .getLeftTableCell.mockReturnValue([cellLeft]);

      const result = getSelectedCellsBorders(editor, [cell]);
      const topResult = isSelectedCellBorder(editor, [cell], 'top');
      const leftResult = isSelectedCellBorder(editor, [cell], 'left');

      expect(result).toEqual(
        expect.objectContaining({
          left: false,
          top: true,
        })
      );
      expect(topResult).toBe(true);
      expect(leftResult).toBe(false);
    });

    it('should return all true when select.side is false', () => {
      const cell = {
        id: 'c22',
        borders: {
          bottom: { size: 0 },
          left: { size: 0 },
          right: { size: 0 },
          top: { size: 0 },
        },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      const result = getSelectedCellsBorders(editor, [cell], {
        select: { none: true, outer: true, side: false },
      });

      expect(result).toEqual(
        expect.objectContaining({
          bottom: true,
          left: true,
          right: true,
          top: true,
        })
      );
    });
  });

  describe('combined selections', () => {
    it('should handle multiple cells in same row', () => {
      const cell1 = {
        id: 'c11',
        borders: { right: { size: 1 }, top: { size: 1 } },
      } as unknown as TElement;
      const cell2 = {
        id: 'c12',
        borders: { right: { size: 0 }, top: { size: 1 } },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      const result = getSelectedCellsBorders(editor, [cell1, cell2]);
      const outerResult = isSelectedCellBordersOuter(editor, [cell1, cell2]);

      expect(result.outer).toBe(false);
      expect(outerResult).toBe(false);
      expect(result.top).toBe(true);
    });

    it('should handle multiple cells in same column', () => {
      const cell1 = {
        id: 'c11',
        borders: { bottom: { size: 1 }, right: { size: 1 } },
      } as unknown as TElement;
      const cell2 = {
        id: 'c21',
        borders: { bottom: { size: 0 }, right: { size: 1 } },
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      const result = getSelectedCellsBorders(editor, [cell1, cell2]);
      const rightResult = isSelectedCellBorder(editor, [cell1, cell2], 'right');

      expect(result.right).toBe(true);
      expect(rightResult).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty cell array', () => {
      const result = getSelectedCellsBorders(editor, []);

      expect(result).toEqual({
        bottom: true,
        left: true,
        none: false,
        outer: true,
        right: true,
        top: true,
      });
    });

    it('should handle missing border properties', () => {
      const cell = {
        id: 'c11',
        // No borders property at all
      } as unknown as TElement;
      editor.api.findPath = jest.fn().mockReturnValue([0]);

      const result = getSelectedCellsBorders(editor, [cell]);
      const noneResult = isSelectedCellBordersNone(editor, [cell]);
      const outerResult = isSelectedCellBordersOuter(editor, [cell]);

      expect(result).toEqual(
        expect.objectContaining({
          bottom: true,
          left: true,
          right: true,
          top: true,
        })
      );
      expect(noneResult).toBe(false); // Default size is 1
      expect(outerResult).toBe(true); // Default size is 1
    });
  });
});
