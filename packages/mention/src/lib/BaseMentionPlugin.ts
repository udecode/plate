import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

export type InsertMentionOptions = {
  value: string;
  key?: string;
  search?: string;
};

type MentionPluginOptions = {
  insertSpaceAfterMention?: boolean;
} & TriggerComboboxPluginOptions;

const defaultOptions: MentionPluginOptions = {
  trigger: '@',
  triggerPreviousCharPattern: /^\s?$/,
  createComboboxInput: (trigger) => ({
    children: [{ text: '' }],
    trigger,
    type: NODES.mentionInput,
  }),
};

export const BaseMentionInputPlugin = createBasePlugin({
  key: KEYS.mentionInput,
  schema: {
    element: {
      properties: {
        trigger: property.string(),
        userId: property.string(),
        value: property.string(),
      },
      void: 'inline',
    },
  },
  type: NODES.mentionInput,
});

/** Enables support for autocompleting @mentions. */
export const BaseMentionPlugin = createBasePlugin({
  key: KEYS.mention,
  dependencies: [BaseMentionInputPlugin],
  schema: {
    element: {
      properties: {
        key: property.string(),
        value: property.string(),
      },
      void: 'markable-inline',
    },
  },
  options: defaultOptions,
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

export type MentionConfig = InferConfig<typeof BaseMentionPlugin>;
