import { createBaseEditor } from '@platejs/core';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

describe('BaseSuggestionPlugin.api.keys', () => {
  it('finds suggestion keys and resolves real user ids from suggestion data', () => {
    const editor = createBaseEditor({ plugins: [BaseSuggestionPlugin] });
    const api = editor.plugin(BaseSuggestionPlugin).api;
    const node = {
      bold: true,
      suggestion: true,
      [api.key('id-1')]: {
        id: 'id-1',
        createdAt: 1,
        type: 'insert',
        userId: 'user-a',
      },
      [api.key('id-2')]: {
        id: 'id-2',
        createdAt: 2,
        type: 'remove',
        userId: 'user-b',
      },
      text: 'x',
    } as any;

    expect(api.key('id-1')).toBe('suggestion_id-1');
    expect(api.keys(node)).toEqual(['suggestion_id-1', 'suggestion_id-2']);
    expect(api.userIds(node)).toEqual(['user-a', 'user-b']);
    expect(api.userId(node)).toBe('user-a');
  });
});
