import { describe, expect, it } from 'bun:test';

import { hasSelectableClass } from './block-selection-kit';

describe('hasSelectableClass', () => {
  it('returns true when slate-selectable is on props.className', () => {
    expect(
      hasSelectableClass({
        attributes: {},
        className: 'slate-h2 slate-selectable',
      })
    ).toBe(true);
  });

  it('returns true when slate-selectable is on attributes.className', () => {
    expect(
      hasSelectableClass({
        attributes: { className: 'slate-selectable' },
      })
    ).toBe(true);
  });

  it('returns false when neither class source is selectable', () => {
    expect(
      hasSelectableClass({
        attributes: { className: 'slate-h2' },
        className: 'font-semibold',
      })
    ).toBe(false);
  });
});
