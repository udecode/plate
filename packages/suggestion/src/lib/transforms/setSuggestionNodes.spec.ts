import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { ElementApi, property, TextApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from '../utils';
import { setSuggestionNodes } from './setSuggestionNodes';

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

describe('setSuggestionNodes', () => {
  it('marks the selection and each inline node with shared suggestion metadata', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin, MentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 2] },
      },
      value: [
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

    setSuggestionNodes(editor, {
      createdAt: 123,
      suggestionId: 's-1',
    });

    const children = editor.read.children()[0].children;
    const markedTextNodes = children.filter(
      (node) =>
        TextApi.isText(node) && getInlineSuggestionData(node)?.id === 's-1'
    );
    const mentionNode = children.find(
      (node) => 'type' in node && node.type === KEYS.mention
    );
    const mentionData = mentionNode && getInlineSuggestionData(mentionNode);
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
      mentionChild && getInlineSuggestionData(mentionChild)
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
      value: [
        {
          children: [
            { text: 'abc' },
            { children: [{ text: '' }], type: KEYS.mention, value: 'Ada' },
          ],
          type: 'p',
        },
      ],
    });

    setSuggestionNodes(editor, {
      createdAt: 123,
      includeInlineElements: false,
      suggestionId: 's-1',
    });

    const children = editor.read.children()[0].children;
    const markedTextNode = children.find(
      (node) => getInlineSuggestionData(node)?.id === 's-1'
    );
    const mentionNode = children.find(
      (node) => 'type' in node && node.type === KEYS.mention
    );

    expect(markedTextNode?.text).toBe('b');
    expect(mentionNode && getInlineSuggestionData(mentionNode)).toBeUndefined();
  });
});
