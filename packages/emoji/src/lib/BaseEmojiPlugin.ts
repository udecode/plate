import type { Emoji, EmojiMartData } from '@emoji-mart/data';

import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import { type InferConfig, createBasePlugin } from '@platejs/core';
import { type EditorUpdateTransaction, property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { DEFAULT_EMOJI_LIBRARY } from './constants';

type EmojiPluginOptions = {
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
} & TriggerComboboxPluginOptions;

export const BaseEmojiInputPlugin = createBasePlugin({
  key: KEYS.emojiInput,
  editOnly: true,
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
});

const emojiPluginOptions: EmojiPluginOptions = {
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
  key: KEYS.emoji,
  editOnly: true,
  options: emojiPluginOptions,
  plugins: [BaseEmojiInputPlugin],
}).extendExtension(withTriggerCombobox);

export type EmojiInputConfig = InferConfig<typeof BaseEmojiPlugin>;
