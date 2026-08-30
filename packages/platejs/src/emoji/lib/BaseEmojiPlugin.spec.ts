import type { Emoji } from '@emoji-mart/data';

import {
  createEditor,
  defineBasePlugin,
  property,
  schema,
  PLUGINS,
} from '../../core';
import { EmojiInputPlugin, EmojiPlugin } from '../react/EmojiPlugin';
import { BaseEmojiInputPlugin, BaseEmojiPlugin } from './BaseEmojiPlugin';

describe('BaseEmojiPlugin', () => {
  const fireEmoji: Emoji = {
    id: 'fire',
    keywords: ['flame'],
    name: 'Fire',
    skins: [{ native: '🔥', unified: '1f525' }],
    version: 1,
  };

  it('configures the emoji input plugin as an inline void edit-only node', () => {
    const editor = createEditor({
      plugins: [BaseEmojiPlugin],
    });

    const inputPlugin = editor.plugin(BaseEmojiInputPlugin);
    const input = { children: [{ text: '' }], type: 'emojiInput' };
    const inputHandle = schema.handle.element(
      BaseEmojiInputPlugin,
      editor.plugin(BaseEmojiInputPlugin).schema.type
    );
    const value = schema.handle.property(inputHandle, 'value');

    expect(inputPlugin.name).toBe('emojiInput');
    expect(inputPlugin.name).toBe(PLUGINS.emojiInput);
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
      createEditor({
        plugins: [
          BaseEmojiPlugin,
          BaseEmojiInputPlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(/emoji.*disabled.*emojiInput|emojiInput.*disabled.*emoji/i);
  });

  it('ships the default trigger and node builders', () => {
    const editor = createEditor({
      plugins: [BaseEmojiPlugin],
    });

    const plugin = editor.plugin(BaseEmojiPlugin);
    const state = editor.plugin(BaseEmojiPlugin).store.get();
    const { triggerPreviousCharPattern } = state;
    const { createComboboxInput } = state;
    const { createEmojiNode } = state;

    if (
      !triggerPreviousCharPattern ||
      !createComboboxInput ||
      !createEmojiNode
    ) {
      throw new Error('Missing required emoji plugin state');
    }

    expect(plugin.editOnly).toBe(true);
    expect(state.trigger).toBe(':');
    expect(triggerPreviousCharPattern.test('')).toBe(true);
    expect(triggerPreviousCharPattern.test(' ')).toBe(true);
    expect(triggerPreviousCharPattern.test('x')).toBe(false);
    expect(createComboboxInput('')).toEqual({
      children: [{ text: '' }],
      type: 'emojiInput',
    });
    expect(createEmojiNode(fireEmoji)).toEqual({
      text: '🔥',
    });
  });

  it('creates transient inputs with the configured schema type', () => {
    const editor = createEditor({
      plugins: [BaseEmojiPlugin],
      schema: {
        overrides: [
          schema.override(BaseEmojiInputPlugin, {
            element: { type: 'customEmojiInput' },
          }),
        ],
      },
    });

    expect(
      editor.plugin(BaseEmojiPlugin).store.get('createComboboxInput')(':')
    ).toMatchObject({ type: 'customEmojiInput' });
  });

  it('installs the required emoji input plugin', () => {
    const editor = createEditor({
      plugins: [BaseEmojiPlugin],
    });

    expect(editor.plugin(BaseEmojiInputPlugin).name).toBe(PLUGINS.emojiInput);
  });

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
    const EmojiChipPlugin = defineBasePlugin('emojiChip', {
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
    const EmojiIdPlugin = defineBasePlugin('emojiId', {
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
