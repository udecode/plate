import type { Emoji } from '@emoji-mart/data';
import {
  triggerCombobox,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import { defineBasePlugin } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type ElementOf,
  property,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\s?$/;

export type EmojiPluginState = {
  createEmojiNode: (
    emoji: Emoji
  ) => Exclude<
    Parameters<EditorUpdateTransaction['nodes']['insert']>[0],
    unknown[]
  >;
  createComboboxInput: NonNullable<
    TriggerComboboxPluginState['createComboboxInput']
  >;
  trigger: NonNullable<TriggerComboboxPluginState['trigger']>;
  triggerPreviousCharPattern: NonNullable<
    TriggerComboboxPluginState['triggerPreviousCharPattern']
  >;
} & TriggerComboboxPluginState;

export const BaseEmojiInputPlugin = defineBasePlugin(PLUGINS.emojiInput, {
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
  editOnly: true,
});

export type EmojiInputElement = ElementOf<typeof BaseEmojiInputPlugin>;

export const BaseEmojiPlugin = defineBasePlugin(PLUGINS.emoji, {
  dependencies: [BaseEmojiInputPlugin],
  initialState: ({ editor }): EmojiPluginState => ({
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: editor.plugin(BaseEmojiInputPlugin).schema.type,
    }),
    trigger: ':',
    triggerPreviousCharPattern: TRIGGER_PREVIOUS_CHAR_PATTERN,
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
  }),

  editOnly: true,
  update: ({ store, tx }) => ({
    insert: (emoji: Emoji) => {
      tx.nodes.insert(store.get('createEmojiNode')(emoji));
    },
  }),
}).extend(({ editor, store }) => ({
  commands: (context) =>
    triggerCombobox(context, {
      editor,
      getState: () => store.get(),
      type: editor.plugin(BaseEmojiInputPlugin).schema.type,
    }),
}));
