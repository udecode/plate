import { getCursorOverlayState } from './getCursorOverlayState';

describe('getCursorOverlayState', () => {
  it('returns an empty list when there are no cursors', () => {
    expect(
      getCursorOverlayState({ cursors: null as any, selectionRects: {} })
    ).toEqual([]);
  });

  it('attaches rects and computed caret positions per cursor key', () => {
    const selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 1] },
    };

    expect(
      getCursorOverlayState({
        cursors: {
          a: { data: { name: 'A' }, selection },
          b: { data: { name: 'B' }, selection: null },
        },
        selectionRects: {
          a: [{ height: 10, left: 1, top: 2, width: 3 }],
        },
      })
    ).toEqual([
      {
        caretPosition: { height: 10, left: 4, top: 2 },
        data: { name: 'A' },
        selection,
        selectionRects: [{ height: 10, left: 1, top: 2, width: 3 }],
      },
      {
        caretPosition: null,
        data: { name: 'B' },
        selection: null,
        selectionRects: [],
      },
    ]);
  });
});
