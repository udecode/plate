import { createSlateEditor } from '@udecode/plate-core';

import { getNextRange } from './getNextRange';

describe('getNextRange', () => {
  const editor = createSlateEditor();

  const ranges = [
    { anchor: { offset: 0, path: [0, 0] }, focus: { offset: 5, path: [0, 0] } },
    {
      anchor: { offset: 10, path: [0, 0] },
      focus: { offset: 15, path: [0, 0] },
    },
    {
      anchor: { offset: 20, path: [0, 0] },
      focus: { offset: 25, path: [0, 0] },
    },
  ];

  it('returns undefined for empty ranges', () => {
    expect(getNextRange(editor, { ranges: [] })).toBeUndefined();
  });

  describe('without from range', () => {
    it('returns first range when no selection and not reverse', () => {
      editor.selection = null;
      expect(getNextRange(editor, { ranges })).toBe(ranges[0]);
    });

    it('returns last range when no selection and reverse', () => {
      editor.selection = null;
      expect(getNextRange(editor, { ranges, reverse: true })).toBe(ranges[2]);
    });

    it('finds next range after selection', () => {
      editor.selection = {
        anchor: { offset: 7, path: [0, 0] },
        focus: { offset: 8, path: [0, 0] },
      };
      expect(getNextRange(editor, { ranges })).toBe(ranges[1]);
    });

    it('finds previous range before selection when reverse', () => {
      editor.selection = {
        anchor: { offset: 17, path: [0, 0] },
        focus: { offset: 18, path: [0, 0] },
      };
      expect(getNextRange(editor, { ranges, reverse: true })).toBe(ranges[1]);
    });

    it('returns first range when no next range found', () => {
      editor.selection = {
        anchor: { offset: 30, path: [0, 0] },
        focus: { offset: 31, path: [0, 0] },
      };
      expect(getNextRange(editor, { ranges })).toBe(ranges[0]);
    });

    it('returns last range when no previous range found in reverse', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      };
      expect(getNextRange(editor, { ranges, reverse: true })).toBe(ranges[2]);
    });
  });

  describe('with from range', () => {
    it('returns next range in sequence', () => {
      expect(getNextRange(editor, { from: ranges[0], ranges })).toBe(ranges[1]);
      expect(getNextRange(editor, { from: ranges[1], ranges })).toBe(ranges[2]);
    });

    it('wraps to first range when at end', () => {
      expect(getNextRange(editor, { from: ranges[2], ranges })).toBe(ranges[0]);
    });

    it('returns previous range in sequence when reverse', () => {
      expect(
        getNextRange(editor, { from: ranges[2], ranges, reverse: true })
      ).toBe(ranges[1]);
      expect(
        getNextRange(editor, { from: ranges[1], ranges, reverse: true })
      ).toBe(ranges[0]);
    });

    it('wraps to last range when at start and reverse', () => {
      expect(
        getNextRange(editor, { from: ranges[0], ranges, reverse: true })
      ).toBe(ranges[2]);
    });

    it('returns first range when from range not found in ranges', () => {
      const unknownRange = {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 5, path: [1, 0] },
      };
      expect(getNextRange(editor, { from: unknownRange, ranges })).toBe(
        ranges[0]
      );
    });
  });

  describe('with multiple blocks', () => {
    const multiBlockRanges = [
      {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 5, path: [1, 0] },
      },
    ];

    it('finds next range in next block', () => {
      editor.selection = {
        anchor: { offset: 7, path: [0, 0] },
        focus: { offset: 8, path: [0, 0] },
      };
      expect(getNextRange(editor, { ranges: multiBlockRanges })).toBe(
        multiBlockRanges[1]
      );
    });

    it('finds previous range in previous block when reverse', () => {
      editor.selection = {
        anchor: { offset: 2, path: [1, 0] },
        focus: { offset: 3, path: [1, 0] },
      };
      expect(
        getNextRange(editor, { ranges: multiBlockRanges, reverse: true })
      ).toBe(multiBlockRanges[0]);
    });

    it('wraps to first block when at end', () => {
      editor.selection = {
        anchor: { offset: 7, path: [1, 0] },
        focus: { offset: 8, path: [1, 0] },
      };
      expect(getNextRange(editor, { ranges: multiBlockRanges })).toBe(
        multiBlockRanges[0]
      );
    });

    it('wraps to last block when at start and reverse', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      };
      expect(
        getNextRange(editor, { ranges: multiBlockRanges, reverse: true })
      ).toBe(multiBlockRanges[1]);
    });
  });
});
