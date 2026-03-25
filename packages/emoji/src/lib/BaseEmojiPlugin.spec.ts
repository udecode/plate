import { createSlateEditor, KEYS } from 'platejs';

import { BaseEmojiInputPlugin, BaseEmojiPlugin } from './BaseEmojiPlugin';
import { DEFAULT_EMOJI_LIBRARY } from './constants';

describe('BaseEmojiPlugin', () => {
  it('configures the emoji input plugin as an inline void edit-only node', () => {
    const editor = createSlateEditor({
      plugins: [BaseEmojiPlugin],
    } as any);

    const inputPlugin = editor.getPlugin(BaseEmojiInputPlugin);

    expect(inputPlugin.editOnly).toBe(true);
    expect(inputPlugin.node.isElement).toBe(true);
    expect(inputPlugin.node.isInline).toBe(true);
    expect(inputPlugin.node.isVoid).toBe(true);
  });

  it('ships the default trigger, library, and node builders', () => {
    const editor = createSlateEditor({
      plugins: [BaseEmojiPlugin],
    } as any);

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
    expect(plugin.options.data).toBe(DEFAULT_EMOJI_LIBRARY);
    expect(plugin.options.trigger).toBe(':');
    expect(triggerPreviousCharPattern.test('')).toBe(true);
    expect(triggerPreviousCharPattern.test(' ')).toBe(true);
    expect(triggerPreviousCharPattern.test('x')).toBe(false);
    expect(createComboboxInput('')).toEqual({
      children: [{ text: '' }],
      type: KEYS.emojiInput,
    });
    expect(createEmojiNode({ skins: [{ native: '🔥' }] } as any)).toEqual({
      text: '🔥',
    });
  });

  it('includes the nested emoji input plugin', () => {
    const editor = createSlateEditor({
      plugins: [BaseEmojiPlugin],
    } as any);

    const plugin = editor.getPlugin(BaseEmojiPlugin);

    expect(
      plugin.plugins.some((child: any) => child.key === KEYS.emojiInput)
    ).toBe(true);
  });
});
