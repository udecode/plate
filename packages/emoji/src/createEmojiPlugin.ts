import { withTriggerCombobox } from '@udecode/plate-combobox';
import { createPluginFactory } from '@udecode/plate-common/server';

import type { EmojiPlugin } from './types';

export const KEY_EMOJI = 'emoji';

export const ELEMENT_EMOJI_INPUT = 'emoji_input';

export const createEmojiPlugin = createPluginFactory<EmojiPlugin>({
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
  plugins: [
    {
      isElement: true,
      isInline: true,
      isVoid: true,
      key: ELEMENT_EMOJI_INPUT,
    },
  ],
  withOverrides: withTriggerCombobox,
});
