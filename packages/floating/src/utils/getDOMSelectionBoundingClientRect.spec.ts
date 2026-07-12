import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { makeClientRect } from './makeClientRect';
import { getDOMSelectionBoundingClientRect } from './getDOMSelectionBoundingClientRect';

describe('getDOMSelectionBoundingClientRect', () => {
  it('returns the default rect when there is no DOM selection', () => {
    const getSelectionSpy = spyOn(window, 'getSelection').mockReturnValue(null);

    expect(getDOMSelectionBoundingClientRect()).toEqual(
      getDefaultBoundingClientRect()
    );

    getSelectionSpy.mockRestore();
  });

  it('returns the default rect when there are no ranges', () => {
    const selection = window.getSelection();

    if (!selection) throw new Error('DOM selection unavailable');

    selection.removeAllRanges();

    expect(getDOMSelectionBoundingClientRect()).toEqual(
      getDefaultBoundingClientRect()
    );
  });

  it('returns the first DOM selection range rect', () => {
    const rect = makeClientRect({
      bottom: 18,
      left: 4,
      right: 14,
      top: 2,
    });

    const selection = window.getSelection();

    if (!selection) throw new Error('DOM selection unavailable');

    const range = document.createRange();
    range.getBoundingClientRect = () => rect;
    selection.removeAllRanges();
    selection.addRange(range);

    expect(getDOMSelectionBoundingClientRect()).toEqual(rect);
    selection.removeAllRanges();
  });
});
