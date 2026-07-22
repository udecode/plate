import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils';
import { getTransientSuggestionKey } from '../utils/getTransientSuggestionKey';
import { getSuggestionProps } from './getSuggestionProps';

const InlineSuggestionTargetPlugin = createBasePlugin({
  key: 'inlineSuggestionTarget',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

describe('getSuggestionProps', () => {
  const createEditor = () =>
    createBaseEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: { currentUserId: 'user-1' },
        }),
        InlineSuggestionTargetPlugin,
      ],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

  it('returns inline suggestion props for text nodes', () => {
    const result = getSuggestionProps(
      createEditor(),
      { text: 'hello' },
      {
        createdAt: 123,
        id: 'abc',
      }
    );

    expect(result).toEqual({
      [KEYS.suggestion]: true,
      [getSuggestionKey('abc')]: {
        createdAt: 123,
        id: 'abc',
        type: 'insert',
        userId: 'user-1',
      },
    });
  });

  it('returns element suggestion props for element nodes', () => {
    const result = getSuggestionProps(
      createEditor(),
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
    const result = getSuggestionProps(
      createEditor(),
      {
        children: [{ text: '' }],
        type: InlineSuggestionTargetPlugin.key,
      },
      { createdAt: 456, id: 'def', suggestionDeletion: true }
    );

    expect(result).toEqual({
      [KEYS.suggestion]: true,
      [getSuggestionKey('def')]: {
        createdAt: 456,
        id: 'def',
        type: 'remove',
        userId: 'user-1',
      },
    });
  });

  it('marks inline suggestions as transient when requested', () => {
    const result = getSuggestionProps(
      createEditor(),
      { text: 'hello' },
      {
        createdAt: 789,
        id: 'ghi',
        transient: true,
      }
    );

    expect(result).toHaveProperty(getTransientSuggestionKey(), true);
  });
});
