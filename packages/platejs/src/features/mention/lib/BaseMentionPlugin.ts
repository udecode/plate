import {
  defineBasePlugin,
  type DefinitionOf,
  type ElementOf,
  type PlateNodeInsertOptions,
  PLUGINS,
  property,
} from '../../../core';
import {
  triggerCombobox,
  type TriggerComboboxPluginState,
} from '../../combobox';

const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\s?$/;
const isNonBlankRef = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export type TMentionItemBase<TRef = string> = {
  label: string;
  ref: TRef;
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
        label: property.string(),
        ref: property.string({
          required: true,
          validate: isNonBlankRef,
          validationVersion: 1,
        }),
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
          const ref = element.getAttribute('data-plate-mention-ref');

          if (!isNonBlankRef(ref)) return undefined;

          const label = element.getAttribute('data-plate-mention-label');

          return {
            children: [{ text: '' }],
            ...(label === null ? {} : { label }),
            ref,
          };
        },
        encode: ({ content, node }) => ({
          attributes: {
            'data-plate-mention': true,
            'data-plate-mention-label': node.label,
            'data-plate-mention-ref': node.ref,
          },
          children: [content, { text: `@${node.label ?? node.ref}` }],
          tag: 'span',
        }),
        match: [{ attributes: { 'data-plate-mention': true }, tag: 'span' }],
        priority: 10,
      },

      'text/markdown': {
        decode: ({ node }) => {
          if (!isNonBlankRef(node.username)) return undefined;

          return {
            ...(node.displayText && node.displayText !== node.username
              ? { label: node.displayText }
              : {}),
            children: [{ text: '' }],
            ref: node.username,
            type,
          };
        },
        encode: ({ node }) => {
          const encodedId = encodeURIComponent(node.ref)
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');

          return {
            children: [{ type: 'text', value: node.label ?? node.ref }],
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
      { label, ref }: { ref: string; label?: string },
      options: PlateNodeInsertOptions = {}
    ) => {
      if (!isNonBlankRef(ref)) {
        throw new TypeError('Mention ref must be a non-empty string.');
      }

      const selection =
        options.at === undefined && tx.selection.nodes().length === 0
          ? tx.selection()
          : undefined;
      const blockPath = selection
        ? tx.nodes.block({ at: selection.focus })?.[1]
        : undefined;
      const insertSpaceAfter =
        store.get().insertSpaceAfterMention &&
        blockPath &&
        selection &&
        tx.points.isEnd(selection.anchor, blockPath);
      const mention = {
        children: [{ text: '' }],
        ...(label === undefined ? {} : { label }),
        ref,
        type,
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
