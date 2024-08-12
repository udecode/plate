import { withTriggerCombobox } from '@udecode/plate-combobox';
import { createPlugin } from '@udecode/plate-common';

import type { MentionPluginOptions } from './types';

export const ELEMENT_MENTION = 'mention';

export const ELEMENT_MENTION_INPUT = 'mention_input';

export const MentionInputPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_MENTION_INPUT,
});

/** Enables support for autocompleting @mentions. */
export const MentionPlugin = createPlugin<'mention', MentionPluginOptions>({
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
  plugins: [MentionInputPlugin],
  withOverrides: withTriggerCombobox,
});
