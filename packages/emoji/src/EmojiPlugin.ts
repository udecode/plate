import { withTriggerCombobox } from '@udecode/plate-combobox';
import {
  type PluginConfig,
  createPlugin,
  createTPlugin,
} from '@udecode/plate-common';

import type { EmojiPluginOptions } from './types';

export type EmojiInputConfig = PluginConfig<'emoji', EmojiPluginOptions>;

export const EmojiInputPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: 'emoji_input',
});

export const EmojiPlugin = createTPlugin<EmojiInputConfig>({
  key: 'emoji',
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: EmojiInputPlugin.key,
    }),
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [EmojiInputPlugin],
  withOverrides: withTriggerCombobox,
});
