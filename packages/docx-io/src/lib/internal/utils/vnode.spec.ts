import { vNodeHasChildren } from './vnode';

describe('vNodeHasChildren', () => {
  it('returns false for nullish, empty, or non-array child collections', () => {
    expect(vNodeHasChildren(undefined)).toBe(false);
    expect(vNodeHasChildren(null)).toBe(false);
    expect(vNodeHasChildren({ children: [] })).toBe(false);
    expect(vNodeHasChildren({ children: 'nope' as any })).toBe(false);
  });

  it('returns true when the vnode has child nodes', () => {
    expect(vNodeHasChildren({ children: [{ type: 'p' }] as any })).toBe(true);
  });
});
