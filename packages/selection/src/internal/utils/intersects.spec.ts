import { intersectsScroll } from './intersects';

describe('intersectsScroll', () => {
  it('returns true when the rects intersect inside the container viewport', () => {
    const container = document.createElement('div');

    container.scrollLeft = 20;
    container.scrollTop = 10;
    container.getBoundingClientRect = () => new DOMRect(10, 20, 200, 200);

    expect(
      intersectsScroll(
        new DOMRect(0, 0, 60, 60),
        new DOMRect(30, 40, 20, 20),
        'touch',
        container
      )
    ).toBe(true);
  });

  it('returns false when the element rect is outside the selection area', () => {
    const container = document.createElement('div');

    container.scrollLeft = 0;
    container.scrollTop = 0;
    container.getBoundingClientRect = () => new DOMRect(10, 20, 200, 200);

    expect(
      intersectsScroll(
        new DOMRect(0, 0, 40, 40),
        new DOMRect(200, 200, 20, 20),
        'touch',
        container
      )
    ).toBe(false);
  });
});
