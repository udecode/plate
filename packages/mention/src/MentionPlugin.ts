import { withTriggerCombobox } from '@udecode/plate-combobox';
import { createPlugin } from '@udecode/plate-common';

import type { MentionPluginOptions } from './types';

export const MentionInputPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: 'mention_input',
});

/** Enables support for autocompleting @mentions. */
export const MentionPlugin = createPlugin<'mention', MentionPluginOptions>({
  isElement: true,
  isInline: true,
  isMarkableVoid: true,
  isVoid: true,
  key: 'mention',
  options: {
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: MentionInputPlugin.key,
    }),
    createMentionNode: (item) => ({ value: item.text }),
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [MentionInputPlugin],
  withOverrides: withTriggerCombobox,
});
