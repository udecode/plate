import type { Emoji } from '@emoji-mart/data';
import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property, schema } from '@platejs/plite';

import { BaseEmojiPlugin } from '../BaseEmojiPlugin';
import { insertEmoji } from './insertEmoji';

const EmojiChipPlugin = createBasePlugin({
  key: 'emoji-chip',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const EmojiIdPlugin = createBasePlugin({
  key: 'emojiId',
  schema: { mark: property.string() },
});

describe('insertEmoji', () => {
  const fireEmoji: Emoji = {
    id: 'fire',
    keywords: ['flame'],
    name: 'Fire',
    skins: [{ native: '🔥', unified: '1f525' }],
    version: 1,
  };

  it('inserts the first native skin text by default', () => {
    const editor = createBaseEditor({
      plugins: [BaseEmojiPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hi ' }],
          type: 'p',
        },
      ],
    });

    insertEmoji(editor, fireEmoji);

    expect(editor.read.text.string([0])).toBe('hi 🔥');
  });

  it('uses the configured createEmojiNode override', () => {
    const editor = createBaseEditor({
      plugins: [
        EmojiChipPlugin,
        BaseEmojiPlugin.configure({
          options: {
            createEmojiNode: (emoji) => ({
              children: [{ text: emoji.id }],
              type: 'emoji-chip',
            }),
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
          children: [{ text: 'x' }],
          type: 'p',
        },
      ],
    });

    insertEmoji(editor, fireEmoji);

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'x' }],
        type: 'p',
      },
      {
        children: [{ text: 'fire' }],
        type: 'emoji-chip',
      },
    ]);
  });

  it('preserves custom properties on text emoji nodes', () => {
    const editor = createBaseEditor({
      plugins: [
        EmojiIdPlugin,
        BaseEmojiPlugin.configure({
          options: {
            createEmojiNode: (emoji) => ({
              emojiId: emoji.id,
              text: emoji.skins[0].native,
            }),
          },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [{ children: [{ text: 'x' }], type: 'p' }],
    });

    insertEmoji(editor, fireEmoji);

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: 'x' },
          {
            emojiId: 'fire',
            text: '🔥',
          },
        ],
        type: 'p',
      },
    ]);
  });
});
