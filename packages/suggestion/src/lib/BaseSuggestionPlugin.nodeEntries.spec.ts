import { createBaseEditor } from '@platejs/core';
import { TextApi } from '@platejs/plite';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

describe('BaseSuggestionPlugin.api.nodeEntries', () => {
  it('finds all text nodes for the given suggestion id and respects extra match filters', () => {
    const editor = createBaseEditor({
      plugins: [BaseSuggestionPlugin],
      initialValue: [
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
              text: 'ignore',
              suggestion: true,
              suggestion_2: {
                id: '2',
                createdAt: 2,
                type: 'insert',
                userId: 'user-b',
              },
            },
          ],
        },
        {
          type: 'p',
          children: [
            {
              text: 'new',
              suggestion: true,
              suggestion_1: {
                id: '1',
                createdAt: 1,
                type: 'insert',
                userId: 'user-a',
              },
            },
          ],
        },
      ],
    });

    expect(
      Array.from(editor.plugin(BaseSuggestionPlugin).api.nodeEntries('1')).map(
        ([, path]) => path
      )
    ).toEqual([
      [0, 0],
      [1, 0],
    ]);

    expect(
      Array.from(
        editor.plugin(BaseSuggestionPlugin).api.nodeEntries('1', {
          match: (node) => TextApi.isText(node) && node.text === 'new',
        })
      ).map(([, path]) => path)
    ).toEqual([[1, 0]]);
  });
});
