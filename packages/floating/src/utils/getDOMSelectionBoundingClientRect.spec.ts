import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { makeClientRect } from './makeClientRect';
import { getDOMSelectionBoundingClientRect } from './getDOMSelectionBoundingClientRect';

describe('getDOMSelectionBoundingClientRect', () => {
  it('returns the default rect when there is no DOM selection', () => {
    const getSelectionSpy = spyOn(window, 'getSelection').mockReturnValue(
      null as any
    );

    expect(getDOMSelectionBoundingClientRect()).toEqual(
      getDefaultBoundingClientRect()
    );

    getSelectionSpy.mockRestore();
  });

  it('returns the default rect when there are no ranges', () => {
    const getSelectionSpy = spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 0,
    } as any);

    expect(getDOMSelectionBoundingClientRect()).toEqual(
      getDefaultBoundingClientRect()
    );

    getSelectionSpy.mockRestore();
  });

  it('returns the first DOM selection range rect', () => {
    const rect = makeClientRect({
      bottom: 18,
      left: 4,
      right: 14,
      top: 2,
    });

    const getSelectionSpy = spyOn(window, 'getSelection').mockReturnValue({
      getRangeAt: () => ({
        getBoundingClientRect: () => rect,
      }),
      rangeCount: 1,
    } as any);

    expect(getDOMSelectionBoundingClientRect()).toEqual(rect);

    getSelectionSpy.mockRestore();
  });
});
