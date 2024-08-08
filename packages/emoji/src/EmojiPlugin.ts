import { withTriggerCombobox } from '@udecode/plate-combobox';
import { createPlugin } from '@udecode/plate-common/server';

import type { EmojiPluginOptions } from './types';

export const KEY_EMOJI = 'emoji';

export const ELEMENT_EMOJI_INPUT = 'emoji_input';

export const EmojiInputPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_EMOJI_INPUT,
});

export const EmojiPlugin = createPlugin<'emoji', EmojiPluginOptions>({
  key: KEY_EMOJI,
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: ELEMENT_EMOJI_INPUT,
    }),
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [EmojiInputPlugin],
  withOverrides: withTriggerCombobox,
});
