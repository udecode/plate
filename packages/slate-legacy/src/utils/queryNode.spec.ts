import { queryNode } from './queryNode';

describe('queryNode', () => {
  const paragraphEntry = [
    { children: [{ text: 'one' }], type: 'p' },
    [0],
  ] as const;

  it('matches allowed and excluded types', () => {
    expect(queryNode(paragraphEntry as any, { allow: 'p' })).toBe(true);
    expect(queryNode(paragraphEntry as any, { allow: 'blockquote' })).toBe(
      false
    );
    expect(queryNode(paragraphEntry as any, { exclude: 'p' })).toBe(false);
  });

  it('checks filter, level, and maxLevel', () => {
    expect(queryNode(paragraphEntry as any, { filter: () => true })).toBe(true);
    expect(queryNode(paragraphEntry as any, { filter: () => false })).toBe(
      false
    );
    expect(queryNode(paragraphEntry as any, { level: 1 })).toBe(true);
    expect(queryNode(paragraphEntry as any, { level: 2 })).toBe(false);
    expect(queryNode(paragraphEntry as any, { maxLevel: 1 })).toBe(true);
    expect(
      queryNode([{ children: [], type: 'p' }, [0, 0]] as any, { maxLevel: 1 })
    ).toBe(false);
  });

  it('returns false for missing entries', () => {
    expect(queryNode(undefined)).toBe(false);
  });
});
