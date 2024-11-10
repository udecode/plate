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
      mention: (options: { key?: any; search: string; value: any; }) => void;
    };
  }
>;

export const BaseMentionInputPlugin = createSlatePlugin({
  key: 'mention_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

/** Enables support for autocompleting @mentions. */
export const BaseMentionPlugin = createSlatePlugin({
  key: 'mention',
  extendEditor: withTriggerCombobox,
  node: { isElement: true, isInline: true, isMarkableVoid: true, isVoid: true },
  options: {
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: BaseMentionInputPlugin.key,
    }),
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [BaseMentionInputPlugin],
}).extendEditorTransforms<MentionConfig['transforms']>(({ editor, type }) => ({
  insert: {
    mention: ({ key, value }) => {
      insertNodes<TMentionElement>(editor, {
        children: [{ text: '' }],
        key,
        type,
        value,
      });
    },
  },
}));
