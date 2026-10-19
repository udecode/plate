import type { Descendant } from '../core';
import { extractLegacyCommentRanges } from './extractLegacyCommentRanges';

describe('extractLegacyCommentRanges', () => {
  it('preserves overlaps and disjoint ranges while sanitizing legacy marks', () => {
    const document: Descendant[] = [
      {
        children: [
          {
            comment: true,
            comment_alpha: true,
            comment_beta: true,
            commentTransient: true,
            text: 'one',
          },
          { comment: true, comment_alpha: true, text: 'two' },
          { bold: true, text: 'gap' },
          { comment: true, comment_alpha: true, text: 'three' },
          { comment_orphan: true, text: 'orphan' },
          { comment: true, comment_draft: true, text: 'draft' },
          { comment: true, text: 'anonymous' },
          { comment: true, comment_empty: true, text: '' },
        ],
        type: 'paragraph',
      },
    ];

    const result = extractLegacyCommentRanges(document, {
      threadIds: ['alpha', 'beta'],
    });

    expect(result.comments).toEqual([
      {
        id: 'alpha',
        ranges: [
          {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 3, path: [0, 1] },
          },
          {
            anchor: { offset: 0, path: [0, 3] },
            focus: { offset: 5, path: [0, 3] },
          },
        ],
      },
      {
        id: 'beta',
        ranges: [
          {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 3, path: [0, 0] },
          },
        ],
      },
      {
        id: 'orphan',
        ranges: [
          {
            anchor: { offset: 0, path: [0, 4] },
            focus: { offset: 6, path: [0, 4] },
          },
        ],
      },
    ]);
    expect(result.document).toEqual([
      {
        children: [
          { text: 'one' },
          { text: 'two' },
          { bold: true, text: 'gap' },
          { text: 'three' },
          { text: 'orphan' },
          { text: 'draft' },
          { text: 'anonymous' },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
    expect(result.diagnostics).toEqual([
      { code: 'orphan-id', id: 'orphan', path: [0, 4] },
      { code: 'draft-only', path: [0, 5] },
      { code: 'anonymous-comment', path: [0, 6] },
      {
        code: 'invalid-range',
        id: 'empty',
        path: [0, 7],
        reason: 'empty-text',
      },
      { code: 'discontinuous-group', id: 'alpha', rangeCount: 2 },
      { code: 'missing-thread', id: 'orphan' },
      { code: 'missing-thread', id: 'empty' },
    ]);
  });

  it('is idempotent and reports malformed legacy values instead of guessing', () => {
    const result = extractLegacyCommentRanges([
      {
        children: [
          {
            comment: 'yes',
            comment_broken: 'yes',
            comment_false: false,
            text: 'text',
          },
        ],
        type: 'paragraph',
      },
    ]);

    expect(result.comments).toEqual([]);
    expect(result.diagnostics).toEqual([
      {
        code: 'invalid-range',
        id: 'broken',
        path: [0, 0],
        reason: 'non-boolean-mark',
      },
    ]);
    expect(extractLegacyCommentRanges(result.document)).toEqual({
      comments: [],
      diagnostics: [],
      document: result.document,
    });
  });
});
