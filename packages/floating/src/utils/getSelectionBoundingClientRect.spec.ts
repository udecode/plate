import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { makeClientRect } from './makeClientRect';
import { getSelectionBoundingClientRect } from './getSelectionBoundingClientRect';

describe('getSelectionBoundingClientRect', () => {
  it('returns the default rect for a collapsed selection', () => {
    const editor: any = {
      api: {
        isExpanded: () => false,
      },
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    };

    expect(getSelectionBoundingClientRect(editor)).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the expanded selection rect', () => {
    const rect = makeClientRect({
      bottom: 24,
      left: 6,
      right: 28,
      top: 4,
    });
    const editor: any = {
      api: {
        isExpanded: () => true,
        toDOMRange: () => ({
          getBoundingClientRect: () => rect,
        }),
      },
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    };

    expect(getSelectionBoundingClientRect(editor)).toEqual(rect);
  });
});
