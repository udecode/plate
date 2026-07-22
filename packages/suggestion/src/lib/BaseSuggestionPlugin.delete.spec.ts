import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'alice',
  },
});

const createSuggestionText = ({
  id = 's1',
  text = '',
  type = 'insert',
}: {
  id?: string;
  text?: string;
  type?: 'insert' | 'remove';
} = {}) => ({
  [KEYS.suggestion]: true,
  [`${KEYS.suggestion}_${id}`]: {
    id,
    createdAt: 1,
    type,
    userId: 'alice',
  },
  text,
});

describe('editor.update.suggestion.delete', () => {
  it('removes empty inserted block suggestions instead of converting them to remove suggestions', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [createSuggestionText()],
          type: 'p',
        },
        {
          children: [{ text: 'next' }],
          type: 'p',
        },
      ],
    });

    editor.update.suggestion.delete({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'next' }],
        type: 'p',
      },
    ]);
  });

  it('deletes inline inserted text directly instead of wrapping it in a remove suggestion', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [createSuggestionText({ text: 'x' })],
          type: 'p',
        },
      ],
    });

    editor.update.suggestion.delete({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            [KEYS.suggestion]: true,
            [`${KEYS.suggestion}_s1`]: {
              id: 's1',
              createdAt: 1,
              type: 'insert',
              userId: 'alice',
            },
            text: '',
          },
        ],
        type: 'p',
      },
    ]);
  });

  it('stops cleanly when deletion would cross blocks without a previous block element', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'one' }],
          type: 'p',
        },
        {
          children: [{ text: 'two' }],
          type: 'p',
        },
      ],
    });

    expect(() =>
      editor.update.suggestion.delete({
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [0, 0] },
      })
    ).not.toThrow();
  });
});
