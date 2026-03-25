import { makeClientRect } from './makeClientRect';
import { createVirtualRef } from './createVirtualRef';

describe('createVirtualRef', () => {
  it('returns the computed bounding rect for the given editor location', () => {
    const selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const rect = makeClientRect({
      bottom: 16,
      left: 3,
      right: 11,
      top: 2,
    });
    const editor: any = {
      selection,
      api: {
        toDOMRange: () => ({
          getBoundingClientRect: () => rect,
        }),
      },
    };

    expect(
      createVirtualRef(editor).current!.getBoundingClientRect()
    ).toMatchObject(rect);
  });

  it('uses the fallback rect when no DOM rect can be computed', () => {
    const fallbackRect = makeClientRect({
      bottom: 12,
      left: 1,
      right: 9,
      top: 0,
    });
    const editor: any = {
      selection: null,
      api: {
        toDOMRange: () => {},
      },
    };

    expect(
      createVirtualRef(editor, undefined, {
        fallbackRect,
      }).current!.getBoundingClientRect()
    ).toMatchObject(fallbackRect);
  });

  it('throws when neither a computed rect nor a fallback rect exists', () => {
    const editor: any = {
      selection: null,
      api: {
        toDOMRange: () => {},
      },
    };

    expect(() =>
      createVirtualRef(editor).current!.getBoundingClientRect()
    ).toThrow(
      'Could not get the bounding client rect of the location. Please provide a fallbackRect.'
    );
  });
});
