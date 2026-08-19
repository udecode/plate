import { describe, expect, it } from 'bun:test';

import { hasSelectableClass } from './block-selection';

describe('hasSelectableClass', () => {
  it('returns true when plite-selectable is on props.className', () => {
    expect(
      hasSelectableClass({
        attributes: {},
        className: 'plite-h2 plite-selectable',
      })
    ).toBe(true);
  });

  it('returns true when plite-selectable is on attributes.className', () => {
    expect(
      hasSelectableClass({
        attributes: { className: 'plite-selectable' },
      })
    ).toBe(true);
  });

  it('returns false when neither class source is selectable', () => {
    expect(
      hasSelectableClass({
        attributes: { className: 'plite-h2' },
        className: 'font-semibold',
      })
    ).toBe(false);
  });
});
