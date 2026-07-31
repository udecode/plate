import type { Emoji, EmojiMartData } from '@emoji-mart/data';

import {
  createTriggerComboboxExtension,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import { createBasePlugin } from '@platejs/core';
import { type EditorUpdateTransaction, property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { DEFAULT_EMOJI_LIBRARY } from './EmojiLibrary';

export type EmojiPluginState = {
  /**
   * The emoji data.
   *
   * @example
   *   import emojiMartData from '@emoji-mart/data';
   */
  data: EmojiMartData;
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

export const BaseEmojiInputPlugin = createBasePlugin({
  name: KEYS.emojiInput,
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
  type: NODES.emojiInput,
  editOnly: true,
});

const emojiInitialState: EmojiPluginState = {
  data: DEFAULT_EMOJI_LIBRARY,
  trigger: ':',
  triggerPreviousCharPattern: /^\s?$/,
  createComboboxInput: () => ({
    children: [{ text: '' }],
    type: NODES.emojiInput,
  }),
  createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
};

export const BaseEmojiPlugin = createBasePlugin({
  name: KEYS.emoji,
  dependencies: [BaseEmojiInputPlugin],
  initialState: emojiInitialState,

  editOnly: true,
  update: ({ store, tx }) => ({
    insert: (emoji: Emoji) => {
      tx.nodes.insert(store.get('createEmojiNode')(emoji));
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
