import { withTriggerCombobox } from '@udecode/plate-combobox';
import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { MentionPluginOptions } from './types';

export type MentionConfig = PluginConfig<'mention', MentionPluginOptions>;

export const MentionInputPlugin = createSlatePlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: 'mention_input',
});

/** Enables support for autocompleting @mentions. */
export const MentionPlugin = createTSlatePlugin<MentionConfig>({
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
