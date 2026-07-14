import type { NodeEntry } from '@platejs/plite';
import type { TTableCellElement } from '@platejs/utils';

import { getSelectionWidth } from './getSelectionWidth';

const cell = (
  props: Partial<TTableCellElement>,
  path: number[]
): NodeEntry<TTableCellElement> => [
  { children: [{ text: '' }], type: 'td', ...props },
  path,
];

describe('getSelectionWidth', () => {
  it('sums colSpan values across cells on the same row', () => {
    expect(
      getSelectionWidth([
        cell({ attributes: { colspan: '2' } }, [0, 0, 0]),
        cell({ colSpan: 3 }, [0, 0, 1]),
      ])
    ).toBe(5);
  });

  it('keeps counting when a wider row starts after a row change', () => {
    expect(
      getSelectionWidth([
        cell({ colSpan: 1 }, [0, 0, 0]),
        cell({ colSpan: 2 }, [0, 1, 0]),
        cell({ colSpan: 1 }, [0, 1, 1]),
      ])
    ).toBe(3);
  });
});
