import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils';
import { getTransientSuggestionKey } from '../utils/getTransientSuggestionKey';
import { getSuggestionProps } from './getSuggestionProps';

describe('getSuggestionProps', () => {
  const createEditor = () =>
    createBaseEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: { currentUserId: 'user-1' },
        }),
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
