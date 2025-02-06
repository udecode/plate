import type { Emoji, EmojiMartData } from '@emoji-mart/data';

import {
  type Descendant,
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate';
import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';

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
  key: 'emoji_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseEmojiPlugin = createTSlatePlugin<EmojiInputConfig>({
  key: 'emoji',
  options: {
    data: DEFAULT_EMOJI_LIBRARY,
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: BaseEmojiInputPlugin.key,
    }),
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
  },
  plugins: [BaseEmojiInputPlugin],
}).overrideEditor(withTriggerCombobox);
