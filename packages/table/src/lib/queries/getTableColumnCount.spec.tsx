import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { getTableColumnCount } from './getTableColumnCount';

describe('getTableColumnCount', () => {
  it('returns 0 if tableNode has no children', () => {
    const tableNode: TTableElement = {
      children: [],
      type: 'table',
    };

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(0);
  });

  it('returns the sum of colSpan values of the first row elements', () => {
    const tableNode: TTableElement = {
      children: [
        {
          children: [2, 3, 1].map(
            (colSpan): TTableCellElement => ({
              children: [{ text: '' }],
              colSpan,
              type: 'td',
            })
          ),
          type: 'tr',
        } satisfies TTableRowElement,
      ],
      type: 'table',
    };

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(6);
  });

  it('returns the sum of colSpan values with colspan attribute of the first row elements', () => {
    const tableNode: TTableElement = {
      children: [
        {
          children: [
            {
              attributes: { colspan: '2' },
              children: [{ text: '' }],
              type: 'td',
            },
            {
              attributes: { colspan: '3' },
              children: [{ text: '' }],
              type: 'td',
            },
            { children: [{ text: '' }], type: 'td' },
          ],
          type: 'tr',
        } satisfies TTableRowElement,
      ],
      type: 'table',
    };

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(6);
  });

  it('handle elements without colSpan or colspan attribute', () => {
    const tableNode: TTableElement = {
      children: [
        {
          children: Array.from(
            { length: 3 },
            (): TTableCellElement => ({
              children: [{ text: '' }],
              type: 'td',
            })
          ),
          type: 'tr',
        } satisfies TTableRowElement,
      ],
      type: 'table',
    };

    const result = getTableColumnCount(tableNode);
    expect(result).toBe(3);
  });
});
