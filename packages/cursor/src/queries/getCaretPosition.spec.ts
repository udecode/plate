import { getCaretPosition } from './getCaretPosition';

describe('getCaretPosition', () => {
  const rects = [
    { height: 10, left: 5, top: 1, width: 4 },
    { height: 12, left: 20, top: 3, width: 6 },
  ];

  it('returns null when there is no anchor rect', () => {
    expect(
      getCaretPosition([], {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      })
    ).toBeNull();
  });

  it('uses the trailing edge for forward expanded selections', () => {
    expect(
      getCaretPosition(rects as any, {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 1] },
      })
    ).toEqual({
      height: 12,
      left: 26,
      top: 3,
    });
  });

  it('uses the leading edge for backward or collapsed selections', () => {
    expect(
      getCaretPosition(rects as any, {
        anchor: { offset: 2, path: [0, 1] },
        focus: { offset: 0, path: [0, 0] },
      })
    ).toEqual({
      height: 10,
      left: 5,
      top: 1,
    });

    expect(
      getCaretPosition(rects as any, {
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 0, path: [0, 1] },
      })
    ).toEqual({
      height: 12,
      left: 20,
      top: 3,
    });
  });
});
