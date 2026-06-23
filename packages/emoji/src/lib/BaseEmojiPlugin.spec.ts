import type { Emoji } from '@emoji-mart/data';

import { createSlateEditor, KEYS } from 'platejs';

import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';

import { BaseEmojiInputPlugin, BaseEmojiPlugin } from './BaseEmojiPlugin';
import { DEFAULT_EMOJI_LIBRARY } from './constants';

describe('BaseEmojiPlugin', () => {
  it('configures the emoji input plugin as an inline void edit-only node', () => {
    const editor = createSlateEditor({
      plugins: [BaseEmojiPlugin],
    });

    const inputPlugin = editor.getPlugin(BaseEmojiInputPlugin);

    expect(inputPlugin.editOnly).toBe(true);
    expect(inputPlugin.node.isElement).toBe(true);
    expect(inputPlugin.node.isInline).toBe(true);
    expect(inputPlugin.node.isVoid).toBe(true);
  });

  it('ships the default trigger, library, and node builders', () => {
    const editor = createSlateEditor({
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
    expect(plugin.options.data).toBe(DEFAULT_EMOJI_LIBRARY);
    expect(plugin.options.trigger).toBe(':');
    expect(triggerPreviousCharPattern.test('')).toBe(true);
    expect(triggerPreviousCharPattern.test(' ')).toBe(true);
    expect(triggerPreviousCharPattern.test('x')).toBe(false);
    expect(createComboboxInput('')).toEqual({
      children: [{ text: '' }],
      type: KEYS.emojiInput,
    });
    expect(createEmojiNode({ skins: [{ native: '🔥' }] } as Emoji)).toEqual({
      text: '🔥',
    });
  });

  it('includes the nested emoji input plugin', () => {
    const editor = createSlateEditor({
      plugins: [BaseEmojiPlugin],
    });

    expect(editor.getPlugin(BaseEmojiInputPlugin).key).toBe(KEYS.emojiInput);
  });

  it('routes the emoji trigger through the Slate v2 runtime combobox path', () => {
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello ' }], type: 'p' }],
      plugins: [BaseEmojiPlugin],
      userId: 'user-1',
    });

    const handled = getCurrentRuntimeTransforms(editor).insertText(
      ':'
    ) as unknown;

    expect(handled).toBe(true);
    expect(editor.read((state) => state.value.root()) as unknown).toEqual([
      {
        children: [
          { text: 'hello ' },
          {
            children: [{ text: '' }],
            type: KEYS.emojiInput,
            userId: 'user-1',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ]);
  });
});
