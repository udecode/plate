import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from './findSuggestionProps';

describe('findSuggestionProps', () => {
  const MentionPlugin = createBasePlugin({
    key: KEYS.mention,
    node: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
        properties: {
          key: property.string(),
          value: property.string(),
        },
        void: 'markable-inline',
      },
    },
  });

  it('reuses metadata only for same-type current-user suggestions', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: {
            currentUserId: 'user-1',
          },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          type: 'p',
          children: [
            {
              text: 'a',
              suggestion: true,
              suggestion_same: {
                id: 'same',
                createdAt: 11,
                type: 'insert',
                userId: 'user-1',
              },
            },
          ],
        },
      ],
    });

    expect(
      findSuggestionProps(editor, {
        at: editor.read.selection()!,
        type: 'insert',
      })
    ).toEqual({
      createdAt: 11,
      id: 'same',
    });

    expect(
      findSuggestionProps(editor, {
        at: editor.read.selection()!,
        type: 'remove',
      })
    ).not.toEqual({
      createdAt: 11,
      id: 'same',
    });
  });

  it('falls back to the previous line-break suggestion at the start of the next block', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: {
            currentUserId: 'user-1',
          },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        {
          type: 'p',
          suggestion: {
            id: 'line-break',
            createdAt: 42,
            isLineBreak: true,
            type: 'insert',
            userId: 'user-1',
          },
          children: [{ text: 'one' }],
        },
        { type: 'p', children: [{ text: '' }] },
      ],
    });

    expect(
      findSuggestionProps(editor, {
        at: editor.read.selection()!,
        type: 'insert',
      })
    ).toEqual({
      createdAt: 42,
      id: 'line-break',
    });
  });

  it('reuses remove metadata from the adjacent inline void suggestion when continuing backward deletion', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: {
            currentUserId: 'user-1',
          },
        }),
        MentionPlugin,
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [
        {
          type: 'p',
          children: [
            { text: 'like ' },
            {
              type: KEYS.mention,
              value: 'Alice',
              key: 'u1',
              suggestion: true,
              suggestion_same: {
                id: 'same',
                createdAt: 77,
                type: 'remove',
                userId: 'user-1',
              },
              children: [{ text: '' }],
            },
            { text: ',or' },
          ],
        },
      ],
    });

    expect(
      findSuggestionProps(editor, {
        at: editor.read.selection()!,
        type: 'remove',
      })
    ).toEqual({
      createdAt: 77,
      id: 'same',
    });
  });
});
