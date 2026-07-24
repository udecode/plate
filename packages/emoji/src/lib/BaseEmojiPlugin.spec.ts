import type { Emoji } from '@emoji-mart/data';
import { createBaseEditor } from '@platejs/core';
import { schema } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { BaseEmojiInputPlugin, BaseEmojiPlugin } from './BaseEmojiPlugin';
import { DEFAULT_EMOJI_LIBRARY } from './constants';
import { EmojiInputPlugin, EmojiPlugin } from '../react/EmojiPlugin';

describe('BaseEmojiPlugin', () => {
  const fireEmoji: Emoji = {
    id: 'fire',
    keywords: ['flame'],
    name: 'Fire',
    skins: [{ native: '🔥', unified: '1f525' }],
    version: 1,
  };

  it('configures the emoji input plugin as an inline void edit-only node', () => {
    const editor = createBaseEditor({
      plugins: [BaseEmojiPlugin],
    });

    const inputPlugin = editor.getPlugin(BaseEmojiInputPlugin);
    const input = { children: [{ text: '' }], type: NODES.emojiInput };
    const inputHandle = editor.read.schema.handle(BaseEmojiInputPlugin);
    const value = schema.handle.property(inputHandle, 'value');

    expect(inputPlugin.key).toBe('emojiInput');
    expect(inputPlugin.type).toBe(NODES.emojiInput);
    expect(inputPlugin.editOnly).toBe(true);
    expect(editor.read.schema.isInline(input)).toBe(true);
    expect(editor.read.schema.isVoid(input)).toBe(true);
    expect(editor.read.schema.property(value)?.value.kind).toBe('string');
  });

  it('declares the input as an exact required Base and React dependency', () => {
    expect(BaseEmojiPlugin.dependencies).toEqual([BaseEmojiInputPlugin]);
    expect(EmojiPlugin.dependencies).toEqual([EmojiInputPlugin]);
  });

  it('rejects a disabled required emoji-input dependency', () => {
    expect(() =>
      createBaseEditor({
        plugins: [
          BaseEmojiPlugin,
          BaseEmojiInputPlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(/emoji.*disabled.*emojiInput|emojiInput.*disabled.*emoji/i);
  });

  it('ships the default trigger, library, and node builders', () => {
    const editor = createBaseEditor({
      plugins: [BaseEmojiPlugin],
    });

    const plugin = editor.getPlugin(BaseEmojiPlugin);
    const triggerPreviousCharPattern =
      plugin.options.triggerPreviousCharPattern;
    const createComboboxInput = plugin.options.createComboboxInput;
    const createEmojiNode = plugin.options.createEmojiNode;

    if (
      !triggerPreviousCharPattern ||
      !createComboboxInput ||
      !createEmojiNode
    ) {
      throw new Error('Missing required emoji plugin options');
    }

    expect(plugin.editOnly).toBe(true);
    expect(plugin.options.data).toEqual(DEFAULT_EMOJI_LIBRARY);
    expect(plugin.options.trigger).toBe(':');
    expect(triggerPreviousCharPattern.test('')).toBe(true);
    expect(triggerPreviousCharPattern.test(' ')).toBe(true);
    expect(triggerPreviousCharPattern.test('x')).toBe(false);
    expect(createComboboxInput('')).toEqual({
      children: [{ text: '' }],
      type: NODES.emojiInput,
    });
    expect(createEmojiNode(fireEmoji)).toEqual({
      text: '🔥',
    });
  });

  it('installs the required emoji input plugin', () => {
    const editor = createBaseEditor({
      plugins: [BaseEmojiPlugin],
    });

    expect(editor.getPlugin(BaseEmojiInputPlugin).key).toBe(KEYS.emojiInput);
  });
});
