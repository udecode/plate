import type { TElement } from '@udecode/slate';

import { getTableColumnCount } from './getTableColumnCount';

describe('getTableColumnCount', () => {
  it('should return 0 if tableNode has no children', () => {
    const tableNode = {
      children: [],
    } as unknown as TElement;

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(0);
  });

  it('should return the sum of colSpan values of the first row elements', () => {
    const tableNode = {
      children: [
        {
          children: [{ colSpan: 2 }, { colSpan: 3 }, { colSpan: 1 }],
        },
      ],
    } as unknown as TElement;

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(6);
  });

  it('should return the sum of colSpan values with colspan attribute of the first row elements', () => {
    const tableNode = {
      children: [
        {
          children: [
            { attributes: { colspan: 2 } },
            { attributes: { colspan: 3 } },
            {},
          ],
        },
      ],
    } as TElement;

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(6);
  });

  it('should handle elements without colSpan or colspan attribute', () => {
    const tableNode = {
      children: [
        {
          children: [{}, {}, {}],
        },
      ],
    } as TElement;

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(3);
  });
});
