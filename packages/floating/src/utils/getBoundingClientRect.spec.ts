import { makeClientRect } from './makeClientRect';
import { getBoundingClientRect } from './getBoundingClientRect';

describe('getBoundingClientRect', () => {
  it('uses the current selection when no location is provided', () => {
    const selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const rect = makeClientRect({
      bottom: 20,
      left: 10,
      right: 40,
      top: 5,
    });
    const editor: any = {
      selection,
      api: {
        toDOMRange: (range: any) =>
          range === selection
            ? { getBoundingClientRect: () => rect }
            : undefined,
      },
    };

    expect(getBoundingClientRect(editor)).toMatchObject(rect);
  });

  it('merges the DOM rects for multiple explicit locations', () => {
    const rangeA = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const rangeB = {
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 1, path: [1, 0] },
    };
    const rectA = makeClientRect({
      bottom: 20,
      left: 10,
      right: 40,
      top: 10,
    });
    const rectB = makeClientRect({
      bottom: 25,
      left: 5,
      right: 50,
      top: 5,
    });
    const editor: any = {
      api: {
        range: (location: any) => (location[0] === 0 ? rangeA : rangeB),
        toDOMRange: (range: any) =>
          range === rangeA
            ? { getBoundingClientRect: () => rectA }
            : { getBoundingClientRect: () => rectB },
      },
    };

    expect(getBoundingClientRect(editor, [[0], [1]] as any)).toMatchObject({
      bottom: 25,
      left: 5,
      right: 50,
      top: 5,
    });
  });

  it('returns undefined when there is no selection or DOM range', () => {
    const editor: any = {
      selection: null,
      api: {
        toDOMRange: () => {},
      },
    };

    expect(getBoundingClientRect(editor)).toBeUndefined();
  });
});
