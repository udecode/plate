import {
  triggerCombobox,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import {
  type DefinitionOf,
  defineBasePlugin,
  type PlateNodeInsertOptions,
} from '@platejs/core';
import { type ElementOf, property } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\s?$/;

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

export const BaseMentionInputPlugin = defineBasePlugin(PLUGINS.mentionInput, {
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
});

export type MentionInputElement = ElementOf<typeof BaseMentionInputPlugin>;

/** Enables support for autocompleting @mentions. */
export const BaseMentionPlugin = defineBasePlugin(PLUGINS.mention, {
  dependencies: [BaseMentionInputPlugin],
  schema: {
    element: {
      properties: {
        key: property.string(),
        value: property.string({ required: true }),
      },
      void: 'markable-inline',
    },
  },
  initialState: ({ editor }): MentionPluginState => ({
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: editor.plugin(BaseMentionInputPlugin).schema.type,
    }),
    insertSpaceAfterMention: false,
    trigger: '@',
    triggerPreviousCharPattern: TRIGGER_PREVIOUS_CHAR_PATTERN,
  }),
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const value = element.getAttribute('data-plate-mention-value');

          if (value === null) return;

          const key = element.getAttribute('data-plate-mention-key');

          return {
            children: [{ text: '' }],
            ...(key === null ? {} : { key }),
            value,
          };
        },
        encode: ({ content, node }) => ({
          attributes: {
            'data-plate-mention': true,
            'data-plate-mention-key': node.key,
            'data-plate-mention-value': node.value,
          },
          children: [content, { text: `@${node.value}` }],
          tag: 'span',
        }),
        match: [{ attributes: { 'data-plate-mention': true }, tag: 'span' }],
        priority: 10,
      },

      'text/markdown': {
        decode: ({ node }) => ({
          ...(node.displayText && { key: node.username }),
          children: [{ text: '' }],
          type,
          value: node.displayText || node.username,
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
  update: ({ store, tx, schema: { type } }) => ({
    insert: (
      { key, value }: { value: string; key?: string },
      options: PlateNodeInsertOptions = {}
    ) => {
      const selection = options.at === undefined ? tx.selection() : undefined;
      const blockPath = selection ? tx.nodes.block()?.[1] : undefined;
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

      tx.nodes.insert(
        insertSpaceAfter ? [mention, { text: ' ' }] : mention,
        options
      );

      if (options.at !== undefined || options.select) return;

      if (insertSpaceAfter && blockPath) {
        const at = tx.points.end(blockPath);

        if (at) tx.selection.set(at);
      } else {
        tx.selection.move({ unit: 'offset' });
      }
    },
  }),
}).extend(({ editor, store, schema: { type } }) => ({
  commands: (context) =>
    triggerCombobox(context, {
      editor,
      getState: () => store.get(),
      type,
    }),
}));

export type MentionDefinition = DefinitionOf<typeof BaseMentionPlugin>;
export type MentionElement = ElementOf<typeof BaseMentionPlugin>;
