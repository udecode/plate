import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData, getSuggestionKey } from '../utils';
import { insertFragmentSuggestion } from './insertFragmentSuggestion';

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: { currentUserId: 'user-1' },
});

describe('insertFragmentSuggestion', () => {
  it('rewrites fragment nodes with the active insert suggestion metadata', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const fragment = [
      {
        [KEYS.suggestion]: true,
        [getSuggestionKey('other-user')]: { id: 'other-user' },
        text: 'text',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ];

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
    insertFragmentSuggestion(editor, fragment);

    const inlineData = getInlineSuggestionData(fragment[0]);
    const blockSuggestion = fragment[1][KEYS.suggestion];

    expect(fragment[0]).not.toHaveProperty(getSuggestionKey('other-user'));
    expect(inlineData).toMatchObject({
      type: 'insert',
      userId: 'user-1',
    });
    expect(blockSuggestion).toMatchObject({
      id: inlineData?.id,
      type: 'insert',
      userId: 'user-1',
    });
    expect(editor.plugin(BaseSuggestionPlugin).api.nodes()).toHaveLength(2);
  });
});
