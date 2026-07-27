import {
  createTriggerComboboxExtension,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

export type InsertMentionOptions = {
  value: string;
  key?: string;
  search?: string;
};

type MentionPluginState = {
  insertSpaceAfterMention?: boolean;
} & TriggerComboboxPluginState;

const initialState: MentionPluginState = {
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
  initialState,
  extension: (context) => createTriggerComboboxExtension(context),
  update: ({ store, tx, type }) => ({
    insert: ({ key, value }: InsertMentionOptions) => {
      const blockPath = tx.nodes.block()?.[1];
      const selection = tx.selection();
      const insertSpaceAfter =
        store.get().insertSpaceAfterMention &&
        blockPath &&
        selection &&
        tx.points.isEnd(selection.anchor, blockPath);
      const mention = {
        key,
        children: [{ text: '' }],
        type,
        value,
      };

      tx.nodes.insert(insertSpaceAfter ? [mention, { text: ' ' }] : mention);

      if (insertSpaceAfter && blockPath) {
        const at = tx.points.end(blockPath);

        if (at) tx.selection.set(at);
      } else {
        tx.selection.move({ unit: 'offset' });
      }
    },
  }),
});

export type MentionConfig = InferConfig<typeof BaseMentionPlugin>;
