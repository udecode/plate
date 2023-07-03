import { TTableElement } from '@/packages/table/src/types';

import { getTableOverriddenColSizes } from './getTableOverriddenColSizes';

const makeTableElement = (
  columnCount: number,
  colSizes?: number[]
): TTableElement =>
  ({
    children: [
      {
        type: 'tr',
        children: Array.from({ length: columnCount }).fill({}),
      },
    ],
    colSizes,
  } as unknown as TTableElement);

describe('getTableOverriddenColSizes', () => {
  describe('when colSizes is not defined', () => {
    it('should return all zeros', () => {
      const tableElement = makeTableElement(3);
      const overrides: Map<number, number> = new Map();
      expect(getTableOverriddenColSizes(tableElement, overrides)).toEqual([
        0, 0, 0,
      ]);
    });

    it('should apply overrides', () => {
      const tableElement = makeTableElement(3);
      const overrides: Map<number, number> = new Map([
        [0, 100],
        [2, 200],
      ]);
      expect(getTableOverriddenColSizes(tableElement, overrides)).toEqual([
        100, 0, 200,
      ]);
    });
  });

  describe('when colSizes is defined', () => {
    it('should return colSizes', () => {
      const tableElement = makeTableElement(3, [100, 200, 300]);
      const overrides: Map<number, number> = new Map();
      expect(getTableOverriddenColSizes(tableElement, overrides)).toEqual([
        100, 200, 300,
      ]);
    });

    it('should apply overrides', () => {
      const tableElement = makeTableElement(3, [100, 200, 300]);
      const overrides: Map<number, number> = new Map([
        [0, 1000],
        [2, 2000],
      ]);
      expect(getTableOverriddenColSizes(tableElement, overrides)).toEqual([
        1000, 200, 2000,
      ]);
    });
  });
});
