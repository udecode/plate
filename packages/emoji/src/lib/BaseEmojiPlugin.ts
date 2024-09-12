import { withTriggerCombobox } from '@udecode/plate-combobox';
import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { EmojiPluginOptions } from './types';

export type EmojiInputConfig = PluginConfig<'emoji', EmojiPluginOptions>;

export const BaseEmojiInputPlugin = createSlatePlugin({
  key: 'emoji_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseEmojiPlugin = createTSlatePlugin<EmojiInputConfig>({
  extendEditor: withTriggerCombobox,
  key: 'emoji',
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: BaseEmojiInputPlugin.key,
    }),
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [BaseEmojiInputPlugin],
});
