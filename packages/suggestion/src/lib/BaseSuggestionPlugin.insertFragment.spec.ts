import { createBaseEditor } from '@platejs/core';
import { ElementApi, TextApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: { currentUserId: 'user-1' },
});

describe('editor.update.suggestion.insertFragment', () => {
  it('rewrites fragment nodes with the active insert suggestion metadata', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });
    const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
    const fragment = [
      {
        [KEYS.suggestion]: true,
        [suggestionApi.key('other-user')]: { id: 'other-user' },
        text: 'text',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ];

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
    editor.update.suggestion.insertFragment(fragment);

    const suggestionNodes = editor.plugin(BaseSuggestionPlugin).api.nodes();
    const inline = suggestionNodes.find(([node]) => TextApi.isText(node))?.[0];
    const block = suggestionNodes.find(([node]) =>
      ElementApi.isElement(node)
    )?.[0];

    expect(inline && TextApi.isText(inline)).toBe(true);
    expect(block && ElementApi.isElement(block)).toBe(true);

    const inlineData =
      inline && TextApi.isText(inline)
        ? suggestionApi.inlineData(inline)
        : undefined;
    const blockSuggestion = block?.[KEYS.suggestion];

    expect(fragment[0]).toHaveProperty(suggestionApi.key('other-user'));
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
