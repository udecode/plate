import type { Emoji } from '@emoji-mart/data';

import { createEditor, definePlugin, property, schema } from '../../core';
import { BaseEmojiPlugin } from './BaseEmojiPlugin';

describe('BaseEmojiPlugin', () => {
  const fireEmoji: Emoji = {
    id: 'fire',
    keywords: ['flame'],
    name: 'Fire',
    skins: [{ native: '🔥', unified: '1f525' }],
    version: 1,
  };

  it('inserts the first native skin text by default', () => {
    const editor = createEditor({
      plugins: [BaseEmojiPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hi ' }], type: 'paragraph' }],
    });

    editor.plugin(BaseEmojiPlugin).update.insert(fireEmoji);

    expect(editor.read.text.string([0])).toBe('hi 🔥');
  });

  it('uses the configured createEmojiNode override', () => {
    const EmojiChipPlugin = definePlugin('emojiChip', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const editor = createEditor({
      plugins: [
        EmojiChipPlugin,
        BaseEmojiPlugin.configure({
          initialState: {
            createEmojiNode: (emoji) => ({
              children: [{ text: emoji.id }],
              type: 'emojiChip',
            }),
          },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.plugin(BaseEmojiPlugin).update.insert(fireEmoji);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'x' }], type: 'paragraph' },
      {
        children: [{ text: 'fire' }],
        type: 'emojiChip',
      },
    ]);
  });

  it('preserves custom properties on text emoji nodes', () => {
    const EmojiIdPlugin = definePlugin('emojiId', {
      schema: { mark: property.string() },
    });
    const editor = createEditor({
      plugins: [
        EmojiIdPlugin,
        BaseEmojiPlugin.configure({
          initialState: {
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
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.plugin(BaseEmojiPlugin).update.insert(fireEmoji);

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'x' }, { emojiId: 'fire', text: '🔥' }],
        type: 'paragraph',
      },
    ]);
  });
});
