import { jsx } from '@udecode/plate-test-utils';
/** @jsx jsx */
import { type PlateEditor, createPlateEditor } from '@udecode/plate/react';

import { setSelectedCellsBorder } from './getOnSelectTableBorderFactory';

jsx;

jest.mock('../../../lib/transforms/setBorderSize', () => ({
  setBorderSize: jest.fn(),
}));

jest.mock('../../../lib/utils', () => ({
  getCellIndices: jest.fn((editor, element) => {
    switch (element.id) {
      case 'c11': {
        return { col: 0, row: 0 };
      }
      case 'c12': {
        return { col: 1, row: 0 };
      }
      case 'c21': {
        return { col: 0, row: 1 };
      }
      case 'c22': {
        return { col: 1, row: 1 };
      }
      default: {
        return { col: 0, row: 0 };
      }
    }
  }),
  getCellTypes: jest.fn().mockReturnValue(['td']),
}));

jest.mock('../../../lib/queries/getTopTableCell', () => ({
  getTopTableCell: jest.fn(),
}));

jest.mock('../../../lib/queries/getLeftTableCell', () => ({
  getLeftTableCell: jest.fn(),
}));

describe('setSelectedCellsBorder', () => {
  let editor: PlateEditor;
  const setBorderSize = jest.requireMock(
    '../../../lib/transforms/setBorderSize'
  ).setBorderSize;

  beforeEach(() => {
    jest.clearAllMocks();
    editor = createPlateEditor({});
    editor.api.findPath = jest.fn().mockReturnValue([0]);
  });

  // describe('when border is "none"', () => {
  // it('should toggle all borders to 1 when all are 0', () => {
  //   const cell: any = {
  //     id: 'c11',
  //     borders: {
  //       bottom: { size: 0 },
  //       left: { size: 0 },
  //       right: { size: 0 },
  //       top: { size: 0 },
  //     },
  //   };

  //   setSelectedCellsBorder(editor, {
  //     border: 'none',
  //     cells: [cell],
  //   });

  //   expect(setBorderSize).toHaveBeenCalledWith(editor, 1, {
  //     at: [0],
  //     border: 'all',
  //   });
  // });

  //   it('should toggle all borders to 0 when any border is set', () => {
  //     const cell: any = {
  //       id: 'c11',
  //       borders: {
  //         bottom: { size: 0 },
  //         left: { size: 1 },
  //         right: { size: 0 },
  //         top: { size: 0 },
  //       },
  //     };

  //     setSelectedCellsBorder(editor, {
  //       border: 'none',
  //       cells: [cell],
  //     });

  //     expect(setBorderSize).toHaveBeenCalledWith(editor, 0, {
  //       at: [0],
  //       border: 'all',
  //     });
  //   });
  // });

  describe('when border is "outer"', () => {
    it('should set outer borders to 1 when not all set', () => {
      const cell1: any = {
        id: 'c11',
        borders: { left: { size: 0 }, top: { size: 0 } },
      };
      const cell2: any = {
        id: 'c12',
        borders: { right: { size: 0 }, top: { size: 0 } },
      };

      setSelectedCellsBorder(editor, {
        border: 'outer',
        cells: [cell1, cell2],
      });

      // Should set top borders for both cells
      expect(setBorderSize).toHaveBeenCalledWith(editor, 1, {
        at: [0],
        border: 'top',
      });
      expect(setBorderSize).toHaveBeenCalledWith(editor, 1, {
        at: [0],
        border: 'left',
      });
    });

    it('should set outer borders to 0 when all set', () => {
      const cell1: any = {
        id: 'c11',
        borders: { left: { size: 1 }, top: { size: 1 } },
      };
      const cell2: any = {
        id: 'c12',
        borders: { right: { size: 1 }, top: { size: 1 } },
      };

      setSelectedCellsBorder(editor, {
        border: 'outer',
        cells: [cell1, cell2],
      });

      expect(setBorderSize).toHaveBeenCalledWith(editor, 0, {
        at: [0],
        border: 'top',
      });
    });
  });

  describe('when border is a direction', () => {
    it('should set border to 1 when not all set', () => {
      const cell1: any = {
        id: 'c11',
        borders: { top: { size: 0 } },
      };
      const cell2: any = {
        id: 'c12',
        borders: { top: { size: 0 } },
      };

      setSelectedCellsBorder(editor, {
        border: 'top',
        cells: [cell1, cell2],
      });

      expect(setBorderSize).toHaveBeenCalledWith(editor, 1, {
        at: [0],
        border: 'top',
      });
    });

    it('should set border to 0 when all set', () => {
      const cell1: any = {
        id: 'c11',
        borders: { top: { size: 1 } },
      };
      const cell2: any = {
        id: 'c12',
        borders: { top: { size: 1 } },
      };

      setSelectedCellsBorder(editor, {
        border: 'top',
        cells: [cell1, cell2],
      });

      expect(setBorderSize).toHaveBeenCalledWith(editor, 0, {
        at: [0],
        border: 'top',
      });
    });

    it('should handle adjacent cells for top/left borders', () => {
      const cell: any = {
        id: 'c22',
        borders: { top: { size: 0 } },
      };
      const cellAbove: any = {
        borders: { bottom: { size: 0 } },
      };
      jest
        .requireMock('../../../lib/queries/getTopTableCell')
        .getTopTableCell.mockReturnValue([cellAbove, [0]]);

      setSelectedCellsBorder(editor, {
        border: 'top',
        cells: [cell],
      });

      expect(setBorderSize).toHaveBeenCalledWith(editor, 1, {
        at: [0],
        border: 'bottom',
      });
    });
  });
});
