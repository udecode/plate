import { withTriggerCombobox } from '@udecode/plate-combobox';
import { createPlugin } from '@udecode/plate-common';

import type { EmojiPluginOptions } from './types';

export const EmojiInputPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: 'emoji_input',
});

export const EmojiPlugin = createPlugin<'emoji', EmojiPluginOptions>({
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
