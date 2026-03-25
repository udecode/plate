import { KEYS } from 'platejs';

import { isHeading } from './isHeading';

describe('isHeading', () => {
  it.each(KEYS.heading)('returns true for %s nodes', (type) => {
    expect(
      isHeading({
        children: [{ text: 'x' }],
        type,
      } as any)
    ).toBe(true);
  });

  it('returns false for non-heading or typeless nodes', () => {
    expect(
      isHeading({
        children: [{ text: 'x' }],
        type: KEYS.p,
      } as any)
    ).toBe(false);
    expect(isHeading({ children: [{ text: 'x' }] } as any)).toBeFalsy();
  });
});
