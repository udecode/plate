import {
  getSuggestionKey,
  getSuggestionKeys,
  getSuggestionUserId,
  getSuggestionUserIds,
  isSuggestionKey,
} from './getSuggestionKeys';

describe('getSuggestionKeys', () => {
  it('finds suggestion keys and resolves real user ids from suggestion data', () => {
    const node = {
      bold: true,
      suggestion: true,
      [getSuggestionKey('id-1')]: {
        id: 'id-1',
        createdAt: 1,
        type: 'insert',
        userId: 'user-a',
      },
      [getSuggestionKey('id-2')]: {
        id: 'id-2',
        createdAt: 2,
        type: 'remove',
        userId: 'user-b',
      },
      text: 'x',
    } as any;

    expect(getSuggestionKey('id-1')).toBe('suggestion_id-1');
    expect(isSuggestionKey('suggestion_id-1')).toBe(true);
    expect(isSuggestionKey('bold')).toBe(false);
    expect(getSuggestionKeys(node)).toEqual([
      'suggestion_id-1',
      'suggestion_id-2',
    ]);
    expect(getSuggestionUserIds(node)).toEqual(['user-a', 'user-b']);
    expect(getSuggestionUserId(node)).toBe('user-a');
  });
});
