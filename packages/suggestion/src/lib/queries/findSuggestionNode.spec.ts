import { createSlateEditor } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findInlineSuggestionNode } from './findSuggestionNode';

describe('findInlineSuggestionNode', () => {
  it('returns the first inline suggestion text node', () => {
    const editor = createSlateEditor({
      plugins: [BaseSuggestionPlugin],
      value: [
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

    expect(findInlineSuggestionNode(editor, { at: [] })?.[1]).toEqual([0, 1]);
  });

  it('respects additional match filters', () => {
    const editor = createSlateEditor({
      plugins: [BaseSuggestionPlugin],
      value: [
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
      findInlineSuggestionNode(editor, {
        at: [],
        match: (node) => !!(node as any).bold,
      })?.[1]
    ).toEqual([0, 0]);

    expect(
      findInlineSuggestionNode(editor, {
        at: [],
        match: (node) => !!(node as any).italic,
      })
    ).toBeUndefined();
  });
});
