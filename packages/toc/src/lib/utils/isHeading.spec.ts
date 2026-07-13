import { KEYS } from '@platejs/utils';

import { isHeading } from './isHeading';

describe('isHeading', () => {
  it.each(KEYS.heading)('returns true for %s nodes', (type) => {
    expect(isHeading({ children: [{ text: 'x' }], type })).toBe(true);
  });

  it('returns false for non-heading nodes', () => {
    expect(isHeading({ children: [{ text: 'x' }], type: KEYS.p })).toBe(false);
  });
});
