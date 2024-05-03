import { withTriggerCombobox } from '@udecode/plate-combobox';
import { createPluginFactory } from '@udecode/plate-common';

import { MentionPlugin } from './types';

export const ELEMENT_MENTION = 'mention';
export const ELEMENT_MENTION_INPUT = 'mention_input';

/**
 * Enables support for autocompleting @mentions.
 */
export const createMentionPlugin = createPluginFactory<MentionPlugin>({
  key: ELEMENT_MENTION,
  isElement: true,
  isInline: true,
  isVoid: true,
  isMarkableVoid: true,
  withOverrides: withTriggerCombobox,
  options: {
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: (trigger) => ({
      type: ELEMENT_MENTION_INPUT,
      trigger,
      children: [{ text: '' }],
    }),
    createMentionNode: (item) => ({ value: item.text }),
  },
  plugins: [
    {
      key: ELEMENT_MENTION_INPUT,
      isElement: true,
      isInline: true,
      isVoid: true,
    },
  ],
});
