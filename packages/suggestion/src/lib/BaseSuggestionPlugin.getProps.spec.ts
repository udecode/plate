import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  BaseSuggestionPlugin,
  SUGGESTION_TRANSIENT_KEY,
} from './BaseSuggestionPlugin';

const InlineSuggestionTargetPlugin = createBasePlugin({
  key: 'inlineSuggestionTarget',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

describe('BaseSuggestionPlugin.api.getProps', () => {
  const createEditor = () =>
    createBaseEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: { currentUserId: 'user-1' },
        }),
        InlineSuggestionTargetPlugin,
      ],
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });

  it('returns inline suggestion props for text nodes', () => {
    const editor = createEditor();
    const result = editor.plugin(BaseSuggestionPlugin).api.getProps(
      { text: 'hello' },
      {
        createdAt: 123,
        id: 'abc',
      }
    );

    expect(result).toEqual({
      [KEYS.suggestion]: true,
      [editor.plugin(BaseSuggestionPlugin).api.key('abc')]: {
        createdAt: 123,
        id: 'abc',
        type: 'insert',
        userId: 'user-1',
      },
    });
  });

  it('returns element suggestion props for element nodes', () => {
    const editor = createEditor();
    const result = editor
      .plugin(BaseSuggestionPlugin)
      .api.getProps(
        { children: [], type: 'p' },
        { createdAt: 456, id: 'def', suggestionDeletion: true }
      );

    expect(result).toEqual({
      [KEYS.suggestion]: {
        createdAt: 456,
        id: 'def',
        type: 'remove',
        userId: 'user-1',
      },
    });
  });

  it('returns inline suggestion props for inline element nodes', () => {
    const editor = createEditor();
    const result = editor.plugin(BaseSuggestionPlugin).api.getProps(
      {
        children: [{ text: '' }],
        type: InlineSuggestionTargetPlugin.key,
      },
      { createdAt: 456, id: 'def', suggestionDeletion: true }
    );

    expect(result).toEqual({
      [KEYS.suggestion]: true,
      [editor.plugin(BaseSuggestionPlugin).api.key('def')]: {
        createdAt: 456,
        id: 'def',
        type: 'remove',
        userId: 'user-1',
      },
    });
  });

  it('marks inline suggestions as transient when requested', () => {
    const editor = createEditor();
    const result = editor.plugin(BaseSuggestionPlugin).api.getProps(
      { text: 'hello' },
      {
        createdAt: 789,
        id: 'ghi',
        transient: true,
      }
    );

    expect(result).toHaveProperty(SUGGESTION_TRANSIENT_KEY, true);
  });
});
