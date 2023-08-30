import { TTableElement } from '../types';
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
  }) as unknown as TTableElement;

describe('getTableOverriddenColSizes', () => {
  describe('when colSizes is not defined', () => {
    it('should return all default widths', () => {
      const overrides: Map<number, number> = new Map();
      expect(getTableOverriddenColSizes(3, undefined, overrides)).toEqual([
        200, 200, 200,
      ]);
    });

    it('should apply overrides and default instead of zero', () => {
      const overrides: Map<number, number> = new Map([
        [0, 100],
        [2, 200],
      ]);
      expect(getTableOverriddenColSizes(3, undefined, overrides)).toEqual([
        100, 200, 200,
      ]);
    });
  });

  describe('when colSizes is defined', () => {
    it('should return colSizes', () => {
      expect(getTableOverriddenColSizes(3, [100, 200, 300])).toEqual([
        100, 200, 300,
      ]);
    });

    it('should apply overrides', () => {
      const overrides: Map<number, number> = new Map([
        [0, 1000],
        [2, 2000],
      ]);
      expect(getTableOverriddenColSizes(3, [100, 200, 300], overrides)).toEqual(
        [1000, 200, 2000]
      );
    });
  });
});
