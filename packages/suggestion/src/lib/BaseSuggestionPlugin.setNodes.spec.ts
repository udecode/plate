import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { ElementApi, property, TextApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: { currentUserId: 'user-1' },
});

const MentionPlugin = createBasePlugin({
  key: KEYS.mention,
  schema: {
    element: {
      inline: true,
      properties: {
        value: property.string(),
      },
      void: 'markable-inline',
    },
  },
});

describe('editor.update.suggestion.setNodes', () => {
  it('marks the selection and each inline node with shared suggestion metadata', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin, MentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'ab ' },
            { children: [{ text: '' }], type: KEYS.mention, value: 'Ada' },
            { text: ' cd' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.suggestion.setNodes({
      createdAt: 123,
      suggestionId: 's-1',
    });

    const children = editor.read.children()[0].children;
    const markedTextNodes = children.filter(
      (node) =>
        TextApi.isText(node) &&
        editor.plugin(BaseSuggestionPlugin).api.inlineData(node)?.id === 's-1'
    );
    const mentionNode = children.find(
      (node) => 'type' in node && node.type === KEYS.mention
    );
    const mentionData =
      mentionNode &&
      editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionNode);
    const mentionChild =
      mentionNode && ElementApi.isElement(mentionNode)
        ? mentionNode.children[0]
        : undefined;

    expect(markedTextNodes.map((node) => node.text)).toEqual(['b ', ' ']);
    expect(mentionData).toMatchObject({
      createdAt: 123,
      id: 's-1',
      type: 'remove',
      userId: 'user-1',
    });
    expect(
      mentionChild &&
        editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionChild)
    ).toBeUndefined();
  });

  it('can skip marking outer inline elements', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin, MentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'abc' },
            { children: [{ text: '' }], type: KEYS.mention, value: 'Ada' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.suggestion.setNodes({
      createdAt: 123,
      includeInlineElements: false,
      suggestionId: 's-1',
    });

    const children = editor.read.children()[0].children;
    const markedTextNode = children.find(
      (node) =>
        editor.plugin(BaseSuggestionPlugin).api.inlineData(node)?.id === 's-1'
    );
    const mentionNode = children.find(
      (node) => 'type' in node && node.type === KEYS.mention
    );

    expect(markedTextNode?.text).toBe('b');
    expect(
      mentionNode &&
        editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionNode)
    ).toBeUndefined();
  });
});
