import { KEYS } from 'platejs';

import { getSuggestionKey } from '../utils';
import { getTransientSuggestionKey } from '../utils/getTransientSuggestionKey';
import { getSuggestionProps } from './getSuggestionProps';

describe('getSuggestionProps', () => {
  const editor = {
    getOptions: () => ({ currentUserId: 'user-1' }),
  } as any;

  it('returns inline suggestion props for text nodes', () => {
    const result = getSuggestionProps(editor, { text: 'hello' } as any, {
      createdAt: 123,
      id: 'abc',
    });

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
      editor,
      { children: [], type: 'p' } as any,
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
    const result = getSuggestionProps(editor, { text: 'hello' } as any, {
      createdAt: 789,
      id: 'ghi',
      transient: true,
    });

    expect((result as any)[getTransientSuggestionKey()]).toBe(true);
  });
});
