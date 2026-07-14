import type { TTableElement } from '@platejs/utils';

import { isTableRectangular } from './isTableRectangular';

describe('isTableRectangular', () => {
  it('treats matching effective widths as rectangular', () => {
    expect(
      isTableRectangular({
        children: [
          {
            children: [
              { children: [{ text: '11' }], colSpan: 2, type: 'td' },
              { children: [{ text: '13' }], type: 'td' },
            ],
            type: 'tr',
          },
          {
            children: [
              { children: [{ text: '21' }], type: 'td' },
              { children: [{ text: '22' }], type: 'td' },
              { children: [{ text: '23' }], type: 'td' },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      } satisfies TTableElement)
    ).toBe(true);
  });

  it('returns false when effective row widths differ after spans are applied', () => {
    expect(
      isTableRectangular({
        children: [
          {
            children: [
              { children: [{ text: '11' }], rowSpan: 2, type: 'td' },
              { children: [{ text: '12' }], type: 'td' },
              { children: [{ text: '13' }], type: 'td' },
            ],
            type: 'tr',
          },
          {
            children: [{ children: [{ text: '22' }], type: 'td' }],
            type: 'tr',
          },
        ],
        type: 'table',
      } satisfies TTableElement)
    ).toBe(false);
  });
});
