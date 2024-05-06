import { withTriggerCombobox } from '@udecode/plate-combobox';
import { createPluginFactory } from '@udecode/plate-common';

import type { MentionPlugin } from './types';

export const ELEMENT_MENTION = 'mention';

export const ELEMENT_MENTION_INPUT = 'mention_input';

/** Enables support for autocompleting @mentions. */
export const createMentionPlugin = createPluginFactory<MentionPlugin>({
  isElement: true,
  isInline: true,
  isMarkableVoid: true,
  isVoid: true,
  key: ELEMENT_MENTION,
  options: {
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: ELEMENT_MENTION_INPUT,
    }),
    createMentionNode: (item) => ({ value: item.text }),
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [
    {
      isElement: true,
      isInline: true,
      isVoid: true,
      key: ELEMENT_MENTION_INPUT,
    },
  ],
  withOverrides: withTriggerCombobox,
});
