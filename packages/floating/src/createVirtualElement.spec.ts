import {
  createVirtualElement,
  getDefaultBoundingClientRect,
} from './createVirtualElement';

describe('createVirtualElement', () => {
  it('returns the default offscreen fallback rect', () => {
    expect(getDefaultBoundingClientRect()).toEqual({
      bottom: 9999,
      height: 0,
      left: -9999,
      right: 9999,
      top: -9999,
      width: 0,
      x: 0,
      y: 0,
    });
  });

  it('creates a virtual element that uses the default rect', () => {
    expect(createVirtualElement().getBoundingClientRect()).toEqual(
      getDefaultBoundingClientRect()
    );
  });
});
