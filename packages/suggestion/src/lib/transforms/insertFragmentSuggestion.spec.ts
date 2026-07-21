import { createBaseEditor } from '@platejs/core';
import { ElementApi, TextApi } from '@platejs/plite';
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
        kind: 'text',
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

    const suggestionNodes = editor.plugin(BaseSuggestionPlugin).api.nodes();
    const inline = suggestionNodes.find(([node]) => TextApi.isText(node))?.[0];
    const block = suggestionNodes.find(([node]) =>
      ElementApi.isElement(node)
    )?.[0];

    expect(inline && TextApi.isText(inline)).toBe(true);
    expect(block && ElementApi.isElement(block)).toBe(true);

    const inlineData =
      inline && TextApi.isText(inline)
        ? getInlineSuggestionData(inline)
        : undefined;
    const blockSuggestion = block?.[KEYS.suggestion];

    expect(fragment[0]).toHaveProperty(getSuggestionKey('other-user'));
    expect(inlineData).toMatchObject({
      type: 'insert',
      userId: 'user-1',
    });
    expect(blockSuggestion).toMatchObject({
      id: inlineData?.id,
      type: 'insert',
      userId: 'user-1',
    });
    expect(suggestionNodes).toHaveLength(2);
  });
});
