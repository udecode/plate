import { makeClientRect } from './makeClientRect';

describe('makeClientRect', () => {
  it('derives width, height, x, y, and toJSON from the edges', () => {
    const rect = makeClientRect({
      bottom: 26,
      left: 5,
      right: 19,
      top: 10,
    });

    expect(rect).toMatchObject({
      bottom: 26,
      height: 16,
      left: 5,
      right: 19,
      top: 10,
      width: 14,
      x: 5,
      y: 10,
    });
    expect(rect.toJSON()).toEqual({
      bottom: 26,
      height: 16,
      left: 5,
      right: 19,
      top: 10,
      width: 14,
      x: 5,
      y: 10,
    });
  });
});
