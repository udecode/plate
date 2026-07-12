import type { Emoji, EmojiMartData } from '@emoji-mart/data';

import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import { type PluginConfig, createBasePlugin } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { DEFAULT_EMOJI_LIBRARY } from './constants';

export type EmojiInputConfig = PluginConfig<
  'emoji',
  {
    /**
     * The emoji data.
     *
     * @example
     *   import emojiMartData from '@emoji-mart/data';
     */
    data: EmojiMartData;
    createEmojiNode: (
      emoji: Emoji
    ) => Exclude<
      Parameters<EditorUpdateTransaction['nodes']['insert']>[0],
      unknown[]
    >;
  } & TriggerComboboxPluginOptions
>;

export const BaseEmojiInputPlugin = createBasePlugin({
  key: KEYS.emojiInput,
  editOnly: true,
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseEmojiPlugin = createBasePlugin<EmojiInputConfig>({
  key: KEYS.emoji,
  editOnly: true,
  options: {
    data: DEFAULT_EMOJI_LIBRARY,
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: KEYS.emojiInput,
    }),
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
  },
  plugins: [BaseEmojiInputPlugin],
}).extendExtension(withTriggerCombobox);
