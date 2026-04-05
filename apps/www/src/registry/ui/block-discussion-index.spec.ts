import { describe, expect, it } from 'bun:test';

import { buildBlockDiscussionIndex } from './block-discussion-index';

type BuildBlockDiscussionIndexOptions = Parameters<
  typeof buildBlockDiscussionIndex
>[0];

const noCommentId =
  (() => {}) as BuildBlockDiscussionIndexOptions['getCommentId'];
const noSuggestionData =
  (() => {}) as BuildBlockDiscussionIndexOptions['getSuggestionData'];
const noSuggestionId =
  (() => {}) as BuildBlockDiscussionIndexOptions['getSuggestionId'];

describe('buildBlockDiscussionIndex', () => {
  it('anchors discussions to the first block where the comment id appears', () => {
    const index = buildBlockDiscussionIndex({
      discussions: [
        {
          comments: [],
          createdAt: new Date('2025-02-16T00:00:00.000Z'),
          id: 'discussion-1',
          isResolved: false,
          userId: 'alice',
        },
      ],
      entries: [
        [{ comment: true, commentId: 'discussion-1', text: 'hello' }, [0, 0]],
        [{ comment: true, commentId: 'discussion-1', text: 'world' }, [1, 0]],
      ] as any,
      getCommentId: (node: any) => node.commentId,
      getSuggestionData: noSuggestionData,
      getSuggestionDataList: () => [],
      getSuggestionId: noSuggestionId,
      isBlockSuggestion: () => false,
    });

    expect(index.discussionsByBlock.get('0')?.map((item) => item.id)).toEqual([
      'discussion-1',
    ]);
    expect(index.discussionsByBlock.get('1')).toBeUndefined();
  });

  it('groups cross-block suggestion entries once under the owner block', () => {
    const suggestionData = {
      createdAt: '2025-02-16T00:00:00.000Z',
      id: 'suggestion-1',
      type: 'insert' as const,
      userId: 'alice',
    };

    const index = buildBlockDiscussionIndex({
      discussions: [
        {
          comments: [
            { contentRich: [], createdAt: new Date(), isEdited: false },
          ],
          createdAt: new Date(),
          id: 'suggestion-1',
          isResolved: false,
          userId: 'alice',
        } as any,
      ],
      entries: [
        [
          {
            suggestion: true,
            suggestionData,
            suggestionDataList: [suggestionData],
            suggestionId: 'suggestion-1',
            text: 'hello ',
          },
          [0, 0],
        ],
        [
          {
            suggestion: true,
            suggestionData,
            suggestionDataList: [suggestionData],
            suggestionId: 'suggestion-1',
            text: 'world',
          },
          [1, 0],
        ],
      ] as any,
      getCommentId: noCommentId,
      getSuggestionData: (node: any) => node.suggestionData,
      getSuggestionDataList: (node: any) => node.suggestionDataList ?? [],
      getSuggestionId: (node: any) => node.suggestionId,
      isBlockSuggestion: () => false,
    });

    expect(index.suggestionsByBlock.get('0')).toEqual([
      expect.objectContaining({
        comments: expect.any(Array),
        newText: 'hello world',
        suggestionId: 'suggestion-1',
        type: 'insert',
      }),
    ]);
    expect(index.suggestionsByBlock.get('1')).toBeUndefined();
  });
});
