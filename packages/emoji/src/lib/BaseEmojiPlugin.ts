import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate';
import { withTriggerCombobox } from '@udecode/plate-combobox';

import type { EmojiPluginOptions } from './types';

import { DEFAULT_EMOJI_LIBRARY } from './constants';

export type EmojiInputConfig = PluginConfig<'emoji', EmojiPluginOptions>;

export const BaseEmojiInputPlugin = createSlatePlugin({
  key: 'emoji_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseEmojiPlugin = createTSlatePlugin<EmojiInputConfig>({
  key: 'emoji',
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: BaseEmojiInputPlugin.key,
    }),
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
    data: DEFAULT_EMOJI_LIBRARY,
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [BaseEmojiInputPlugin],
}).overrideEditor(withTriggerCombobox);
