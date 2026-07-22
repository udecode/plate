import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

const BoldPlugin = createBasePlugin({
  key: 'bold',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

describe('findInlineSuggestionNode', () => {
  it('returns the first inline suggestion text node', () => {
    const editor = createBaseEditor({
      plugins: [BaseSuggestionPlugin, BoldPlugin],
      initialValue: [
        {
          type: 'p',
          children: [
            { text: 'plain' },
            {
              text: 'suggested',
              suggestion: true,
              suggestion_alpha: {
                createdAt: 1,
                id: 'alpha',
                type: 'insert',
                userId: 'alice',
              },
            },
          ],
        },
      ],
    });

    expect(
      editor
        .plugin(BaseSuggestionPlugin)
        .api.node({ isText: true, at: [] })?.[1]
    ).toEqual([0, 1]);
  });

  it('respects additional match filters', () => {
    const editor = createBaseEditor({
      plugins: [BaseSuggestionPlugin, BoldPlugin],
      initialValue: [
        {
          type: 'p',
          children: [
            {
              bold: true,
              suggestion: true,
              suggestion_alpha: {
                createdAt: 1,
                id: 'alpha',
                type: 'insert',
                userId: 'alice',
              },
              text: 'bold',
            },
            {
              suggestion: true,
              suggestion_beta: {
                createdAt: 2,
                id: 'beta',
                type: 'insert',
                userId: 'alice',
              },
              text: 'plain',
            },
          ],
        },
      ],
    });

    expect(
      editor.plugin(BaseSuggestionPlugin).api.node({
        isText: true,
        at: [],
        match: (node) => !!(node as any).bold,
      })?.[1]
    ).toEqual([0, 0]);

    expect(
      editor.plugin(BaseSuggestionPlugin).api.node({
        isText: true,
        at: [],
        match: (node) => !!(node as any).italic,
      })
    ).toBeUndefined();
  });
});
