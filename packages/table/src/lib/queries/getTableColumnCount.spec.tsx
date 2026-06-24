import type { Element } from '@platejs/plite';

import { getTableColumnCount } from './getTableColumnCount';

describe('getTableColumnCount', () => {
  it('returns 0 if tableNode has no children', () => {
    const tableNode = {
      children: [],
    } as unknown as Element;

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(0);
  });

  it('returns the sum of colSpan values of the first row elements', () => {
    const tableNode = {
      children: [
        {
          children: [{ colSpan: 2 }, { colSpan: 3 }, { colSpan: 1 }],
        },
      ],
    } as unknown as Element;

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(6);
  });

  it('returns the sum of colSpan values with colspan attribute of the first row elements', () => {
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
    } as Element;

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(6);
  });

  it('handle elements without colSpan or colspan attribute', () => {
    const tableNode = {
      children: [
        {
          children: [{}, {}, {}],
        },
      ],
    } as Element;

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(3);
  });
});
