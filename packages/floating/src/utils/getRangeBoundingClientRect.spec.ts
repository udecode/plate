import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { makeClientRect } from './makeClientRect';
import { getRangeBoundingClientRect } from './getRangeBoundingClientRect';

describe('getRangeBoundingClientRect', () => {
  it('returns the default rect when the range is null', () => {
    const editor: any = { api: { toDOMRange: () => {} } };

    expect(getRangeBoundingClientRect(editor, null)).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the default rect when toDOMRange fails', () => {
    const editor: any = { api: { toDOMRange: () => {} } };
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    expect(getRangeBoundingClientRect(editor, range as any)).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the DOM range rect when available', () => {
    const rect = makeClientRect({
      bottom: 30,
      left: 12,
      right: 32,
      top: 8,
    });
    const editor: any = {
      api: {
        toDOMRange: () => ({
          getBoundingClientRect: () => rect,
        }),
      },
    };
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    expect(getRangeBoundingClientRect(editor, range as any)).toEqual(rect);
  });
});
