import {
  createTriggerComboboxExtension,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import { type DefinitionOf, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

export type InsertMentionOptions = {
  value: string;
  key?: string;
};

export type TMentionItemBase<TKey = unknown> = {
  text: string;
  key?: TKey;
};

export type MentionPluginState = {
  createComboboxInput: NonNullable<
    TriggerComboboxPluginState['createComboboxInput']
  >;
  insertSpaceAfterMention?: boolean;
  trigger: NonNullable<TriggerComboboxPluginState['trigger']>;
  triggerPreviousCharPattern: NonNullable<
    TriggerComboboxPluginState['triggerPreviousCharPattern']
  >;
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
  name: KEYS.mentionInput,
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
  name: KEYS.mention,
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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        decode: ({ node, type }) => ({
          children: [{ text: '' }],
          type,
          value: node.displayText || node.username,
          ...(node.displayText && { key: node.username }),
        }),
        encode: ({ node }) => {
          const mentionId = node.key || node.value;
          const encodedId = encodeURIComponent(String(mentionId))
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');

          return {
            children: [{ type: 'text', value: String(node.value ?? '') }],
            type: 'link',
            url: `mention:${encodedId}`,
          };
        },
        from: 'mention',
        kind: 'node',
      },
    }),
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
}).extend(({ editor, plugin, store, type }) =>
  createTriggerComboboxExtension({
    editor,
    getState: () => store.get(),
    name: plugin.name,
    type,
  })
);

export type MentionDefinition = DefinitionOf<typeof BaseMentionPlugin>;
