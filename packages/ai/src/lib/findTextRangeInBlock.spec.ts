import type { Descendant, NodeEntry } from '@platejs/plite';

import { findTextRangeInBlock } from './findTextRangeInBlock';

const block = (children: Descendant[]): NodeEntry => [
  { children, type: 'p' },
  [0],
];

describe('findTextRangeInBlock', () => {
  it('finds text inside a nested inline', () => {
    expect(
      findTextRangeInBlock({
        block: block([
          { text: 'a' },
          { children: [{ text: 'test' }], type: 'a' },
        ]),
        findText: 'test',
      })
    ).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
    });
  });

  it('finds text spanning multiple leaves', () => {
    expect(
      findTextRangeInBlock({
        block: block([
          { text: 'prefix ' },
          { bold: true, text: 't' },
          { italic: true, text: 'e' },
          { text: 's' },
          { text: 't' },
        ]),
        findText: 'test',
      })
    ).toEqual({
      anchor: { offset: 0, path: [0, 1] },
      focus: { offset: 1, path: [0, 4] },
    });
  });

  it('uses a fuzzy match for a small typo', () => {
    expect(
      findTextRangeInBlock({
        block: block([{ text: 'The quik brown fox' }]),
        findText: 'quick',
      })
    ).toEqual({
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 8, path: [0, 0] },
    });
  });

  it('falls back to the longest prefix', () => {
    expect(
      findTextRangeInBlock({
        block: block([{ text: 'This is a tes' }]),
        findText: 'test',
      })
    ).toEqual({
      anchor: { offset: 10, path: [0, 0] },
      focus: { offset: 13, path: [0, 0] },
    });
  });

  it('returns null without a useful match', () => {
    expect(
      findTextRangeInBlock({
        block: block([{ text: 'abc' }]),
        findText: 'xyz',
      })
    ).toBeNull();
  });
});
