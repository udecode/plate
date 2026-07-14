import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export type InsertMentionOptions = {
  value: string;
  key?: string;
  search?: string;
};

export type MentionConfig = PluginConfig<
  'mention',
  {
    insertSpaceAfterMention?: boolean;
  } & TriggerComboboxPluginOptions,
  {}
>;

export const BaseMentionInputPlugin = createBasePlugin({
  key: KEYS.mentionInput,
  node: { isElement: true, isInline: true, isVoid: true },
});

/** Enables support for autocompleting @mentions. */
export const BaseMentionPlugin = createBasePlugin<MentionConfig>({
  key: KEYS.mention,
  node: {
    isElement: true,
    isInline: true,
    isMarkableVoid: true,
    isVoid: true,
  },
  options: {
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: KEYS.mentionInput,
    }),
  },
  plugins: [BaseMentionInputPlugin],
})
  .extendExtension(withTriggerCombobox)
  .extendTx(({ type }) => (tx) => ({
    insert: ({ key, value }: InsertMentionOptions) => {
      tx.nodes.insert({
        key,
        children: [{ text: '' }],
        type,
        value,
      });
    },
  }));
