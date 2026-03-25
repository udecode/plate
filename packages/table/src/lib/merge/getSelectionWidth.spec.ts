import { getSelectionWidth } from './getSelectionWidth';

describe('getSelectionWidth', () => {
  it('sums colSpan values across cells on the same row', () => {
    expect(
      getSelectionWidth([
        [{ attributes: { colspan: '2' } } as any, [0, 0, 0]],
        [{ colSpan: 3 } as any, [0, 0, 1]],
      ])
    ).toBe(5);
  });

  it('keeps counting when a wider row starts after a row change', () => {
    expect(
      getSelectionWidth([
        [{ colSpan: 1 } as any, [0, 0, 0]],
        [{ colSpan: 2 } as any, [0, 1, 0]],
        [{ colSpan: 1 } as any, [0, 1, 1]],
      ])
    ).toBe(3);
  });
});
