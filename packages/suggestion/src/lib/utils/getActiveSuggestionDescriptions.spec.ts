import { createSlateEditor } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getActiveSuggestionDescriptions } from './getActiveSuggestionDescriptions';

describe('getActiveSuggestionDescriptions', () => {
  it('builds replacement and insertion descriptions from real editor data', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: {
            currentUserId: 'user-a',
          },
        }),
      ],
      selection: {
        anchor: { offset: 1, path: [0, 1] },
        focus: { offset: 1, path: [0, 1] },
      },
      value: [
        {
          type: 'p',
          children: [
            {
              text: 'old',
              suggestion: true,
              suggestion_1: {
                id: '1',
                createdAt: 1,
                type: 'remove',
                userId: 'user-a',
              },
            },
            {
              text: 'new',
              suggestion: true,
              suggestion_1: {
                id: '1',
                createdAt: 1,
                type: 'insert',
                userId: 'user-a',
              },
              suggestion_2: {
                id: '2',
                createdAt: 2,
                type: 'insert',
                userId: 'user-b',
              },
            },
          ],
        },
      ],
    });

    expect(getActiveSuggestionDescriptions(editor)).toEqual([
      {
        deletedText: 'old',
        insertedText: 'new',
        suggestionId: '1',
        type: 'replacement',
        userId: 'user-a',
      },
      {
        insertedText: 'new',
        suggestionId: '2',
        type: 'insertion',
        userId: 'user-b',
      },
    ]);
  });

  it('returns an empty array when there is no active suggestion node', () => {
    const editor = createSlateEditor({
      plugins: [BaseSuggestionPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ type: 'p', children: [{ text: 'plain' }] }],
    });

    expect(getActiveSuggestionDescriptions(editor)).toEqual([]);
  });

  it('builds deletion descriptions when a suggestion only removes text', () => {
    const editor = createSlateEditor({
      plugins: [BaseSuggestionPlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          type: 'p',
          children: [
            {
              text: 'gone',
              suggestion: true,
              suggestion_3: {
                id: '3',
                createdAt: 3,
                type: 'remove',
                userId: 'user-c',
              },
            },
          ],
        },
      ],
    });

    expect(getActiveSuggestionDescriptions(editor)).toEqual([
      {
        deletedText: 'gone',
        suggestionId: '3',
        type: 'deletion',
        userId: 'user-c',
      },
    ]);
  });
});
