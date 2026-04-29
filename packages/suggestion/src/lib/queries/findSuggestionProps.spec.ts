import { createSlateEditor, createSlatePlugin, KEYS } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from './findSuggestionProps';

describe('findSuggestionProps', () => {
  const MentionPlugin = createSlatePlugin({
    key: KEYS.mention,
    node: {
      isElement: true,
      isInline: true,
      isMarkableVoid: true,
      isVoid: true,
    },
  });

  it('reuses metadata only for same-type current-user suggestions', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: {
            currentUserId: 'user-1',
          },
        }),
      ],
      selection: {
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
        at: editor.selection!,
        type: 'insert',
      })
    ).toEqual({
      createdAt: 11,
      id: 'same',
    });

    expect(
      findSuggestionProps(editor, {
        at: editor.selection!,
        type: 'remove',
      })
    ).not.toEqual({
      createdAt: 11,
      id: 'same',
    });
  });

  it('falls back to the previous line-break suggestion at the start of the next block', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: {
            currentUserId: 'user-1',
          },
        }),
      ],
      selection: {
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
        at: editor.selection!,
        type: 'insert',
      })
    ).toEqual({
      createdAt: 42,
      id: 'line-break',
    });
  });

  it('reuses remove metadata from the adjacent inline void suggestion when continuing backward deletion', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: {
            currentUserId: 'user-1',
          },
        }),
        MentionPlugin,
      ],
      selection: {
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
        at: editor.selection!,
        type: 'remove',
      })
    ).toEqual({
      createdAt: 77,
      id: 'same',
    });
  });
});
