import type { Emoji } from '@emoji-mart/data';
import { createBaseEditor } from '@platejs/core';

import { BaseEmojiPlugin } from '../BaseEmojiPlugin';
import { insertEmoji } from './insertEmoji';

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
