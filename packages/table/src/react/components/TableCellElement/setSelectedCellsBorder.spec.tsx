/** @jsx jsx */

import { jsx } from '@platejs/test-utils';
import { type PlateEditor, createPlateEditor } from 'platejs/react';

import * as setBorderSizeModule from '../../../lib/transforms/setBorderSize';
import * as utilsModule from '../../../lib/utils';
import * as getTopTableCellModule from '../../../lib/queries/getTopTableCell';
import * as getLeftTableCellModule from '../../../lib/queries/getLeftTableCell';
import { setSelectedCellsBorder } from './getOnSelectTableBorderFactory';

jsx;

describe('setSelectedCellsBorder', () => {
  let editor: PlateEditor;
  let setBorderSizeSpy: ReturnType<typeof spyOn>;
  let getCellIndicesSpy: ReturnType<typeof spyOn>;
  let getCellTypesSpy: ReturnType<typeof spyOn>;
  let getTopTableCellSpy: ReturnType<typeof spyOn>;
  let getLeftTableCellSpy: ReturnType<typeof spyOn>;
  let setBorderSizeMock: ReturnType<typeof mock>;
  let getCellIndicesMock: ReturnType<typeof mock>;
  let getCellTypesMock: ReturnType<typeof mock>;
  let getTopTableCellMock: ReturnType<typeof mock>;
  let getLeftTableCellMock: ReturnType<typeof mock>;

  beforeEach(() => {
    // Create mocks
    setBorderSizeMock = mock();
    getCellIndicesMock = mock((_editor, element: any) => {
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
    });
    getCellTypesMock = mock(() => ['td']);
    getTopTableCellMock = mock();
    getLeftTableCellMock = mock();

    // Create spies
    setBorderSizeSpy = spyOn(
      setBorderSizeModule,
      'setBorderSize'
    ).mockImplementation(setBorderSizeMock);
    getCellIndicesSpy = spyOn(utilsModule, 'getCellIndices').mockImplementation(
      getCellIndicesMock
    );
    getCellTypesSpy = spyOn(utilsModule, 'getCellTypes').mockImplementation(
      getCellTypesMock
    );
    getTopTableCellSpy = spyOn(
      getTopTableCellModule,
      'getTopTableCell'
    ).mockImplementation(getTopTableCellMock);
    getLeftTableCellSpy = spyOn(
      getLeftTableCellModule,
      'getLeftTableCell'
    ).mockImplementation(getLeftTableCellMock);

    editor = createPlateEditor({ nodeId: true });
    const findPathMock = mock(() => [0]);
    (editor.api as any).findPath = findPathMock;
  });

  afterEach(() => {
    setBorderSizeSpy?.mockRestore();
    getCellIndicesSpy?.mockRestore();
    getCellTypesSpy?.mockRestore();
    getTopTableCellSpy?.mockRestore();
    getLeftTableCellSpy?.mockRestore();
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
      expect(setBorderSizeMock).toHaveBeenCalledWith(editor, 1, {
        at: [0],
        border: 'top',
      });
      expect(setBorderSizeMock).toHaveBeenCalledWith(editor, 1, {
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

      expect(setBorderSizeMock).toHaveBeenCalledWith(editor, 0, {
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

      expect(setBorderSizeMock).toHaveBeenCalledWith(editor, 1, {
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

      expect(setBorderSizeMock).toHaveBeenCalledWith(editor, 0, {
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
      getTopTableCellMock.mockReturnValue([cellAbove, [0]]);

      setSelectedCellsBorder(editor, {
        border: 'top',
        cells: [cell],
      });

      expect(setBorderSizeMock).toHaveBeenCalledWith(editor, 1, {
        at: [0],
        border: 'bottom',
      });
    });
  });
});
