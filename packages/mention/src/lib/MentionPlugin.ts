import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';
import {
  type PluginConfig,
  createSlatePlugin,
  insertNodes,
} from '@udecode/plate-common';

import type { TMentionElement } from './types';

export type MentionConfig = PluginConfig<
  'mention',
  {
    insertSpaceAfterMention?: boolean;
  } & TriggerComboboxPluginOptions,
  {},
  {
    insert: {
      mention: (options: { search: string; value: any }) => void;
    };
  }
>;

export const MentionInputPlugin = createSlatePlugin({
  key: 'mention_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

/** Enables support for autocompleting @mentions. */
export const MentionPlugin = createSlatePlugin({
  extendEditor: withTriggerCombobox,
  key: 'mention',
  node: { isElement: true, isInline: true, isMarkableVoid: true, isVoid: true },
  options: {
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: MentionInputPlugin.key,
    }),
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [MentionInputPlugin],
}).extendEditorTransforms<MentionConfig['transforms']>(({ editor, type }) => ({
  insert: {
    mention: ({ value }) => {
      insertNodes<TMentionElement>(editor, {
        children: [{ text: '' }],
        type,
        value,
      });
    },
  },
}));
