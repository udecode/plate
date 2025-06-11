import type { Emoji, EmojiMartData } from '@emoji-mart/data';

import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import {
  type Descendant,
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

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
    data?: EmojiMartData;
    createEmojiNode?: (emoji: Emoji) => Descendant;
  } & TriggerComboboxPluginOptions
>;

export const BaseEmojiInputPlugin = createSlatePlugin({
  key: KEYS.emojiInput,
  editOnly: true,
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseEmojiPlugin = createTSlatePlugin<EmojiInputConfig>({
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
}).overrideEditor(withTriggerCombobox);
