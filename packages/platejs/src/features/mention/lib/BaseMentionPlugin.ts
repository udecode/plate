import {
  definePlugin,
  type DefinitionOf,
  type ElementOf,
  type NodeInsertOptions,
  PLUGINS,
  property,
} from '../../../core';
import {
  BaseComboboxPlugin,
  triggerCombobox,
  type TriggerComboboxPluginState,
} from '../../combobox';

const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\s?$/;
const MENTION_URL_PREFIX = 'mention:';

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
  insertSpaceAfterMention: boolean;
  trigger: NonNullable<TriggerComboboxPluginState['trigger']>;
  triggerPreviousCharPattern: NonNullable<
    TriggerComboboxPluginState['triggerPreviousCharPattern']
  >;
} & TriggerComboboxPluginState;

export const BaseMentionInputPlugin = definePlugin(PLUGINS.mentionInput, {
  dependencies: [BaseComboboxPlugin],
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
export const BaseMentionPlugin = definePlugin(PLUGINS.mention, {
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
    triggerQuery: null,
    triggerPreviousCharPattern: TRIGGER_PREVIOUS_CHAR_PATTERN,
  }),
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ node }) => `@${node.label ?? node.ref}`,
      },
      html: {
        decode: ({ element, preserve }) => {
          const ref = element.getAttribute('data-editor-mention-ref');

          if (!isNonBlankRef(ref)) return undefined;

          const label = element.getAttribute('data-editor-mention-label');

          preserve(
            'data-editor-mention',
            'data-editor-mention-label',
            'data-editor-mention-ref'
          );

          return {
            children: [{ text: '' }],
            ...(label === null ? {} : { label }),
            ref,
          };
        },
        encode: ({ content, node, preserve }) => {
          preserve('label', 'ref');

          return {
            attributes: {
              'data-editor-mention': true,
              'data-editor-mention-label': node.label,
              'data-editor-mention-ref': node.ref,
            },
            children: [content, { text: `@${node.label ?? node.ref}` }],
            tag: 'span',
          };
        },
        match: [{ attributes: { 'data-editor-mention': true }, tag: 'span' }],
        priority: 10,
      },

      markdown: {
        // `[label](mention:ref)` links; any other link falls through to Link.
        node: 'link',
        priority: 10,
        decode: ({ node }) => {
          if (!node.url.startsWith(MENTION_URL_PREFIX)) return undefined;
          let ref: string;

          try {
            ref = decodeURIComponent(node.url.slice(MENTION_URL_PREFIX.length));
          } catch {
            return undefined;
          }
          if (!isNonBlankRef(ref)) return undefined;
          const [first] = node.children;
          const label =
            node.children.length === 1 && first?.type === 'text'
              ? first.value
              : undefined;

          return {
            ...(label && label !== ref ? { label } : {}),
            children: [{ text: '' }],
            ref,
            type,
          };
        },
        encode: ({ node, preserve }) => {
          // Without a distinct label, the reference is the label.
          preserve('label', 'ref');
          const encodedId = encodeURIComponent(node.ref)
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');

          return {
            children: [{ type: 'text', value: node.label ?? node.ref }],
            type: 'link',
            url: `${MENTION_URL_PREFIX}${encodedId}`,
          };
        },
      },
    }),
  update: ({ store, tx, schema: { type } }) => ({
    insert: (
      { label, ref }: { ref: string; label?: string },
      options: NodeInsertOptions = {}
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
