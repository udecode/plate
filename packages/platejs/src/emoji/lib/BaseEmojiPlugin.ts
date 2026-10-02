import type { Emoji } from '@emoji-mart/data';

import {
  definePlugin,
  type EditorUpdateTransaction,
  PLUGINS,
} from '../../core';
import type { ComboboxState } from '../../features/combobox';

const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\s?$/;
const SHORTCODE_CHARACTER = /^[\p{L}\p{N}_+\-:]$/u;

export type EmojiPluginState = ComboboxState & {
  createEmojiNode: (
    emoji: Emoji
  ) => Exclude<
    Parameters<EditorUpdateTransaction['nodes']['insert']>[0],
    unknown[]
  >;
};

export const BaseEmojiPlugin = definePlugin(PLUGINS.emoji, {
  initialState: (): EmojiPluginState => ({
    maxQueryLength: 75,
    queryPattern: SHORTCODE_CHARACTER,
    trigger: ':',
    triggerQuery: null,
    triggerPreviousCharPattern: TRIGGER_PREVIOUS_CHAR_PATTERN,
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
  }),

  editOnly: true,
  update: ({ store, tx }) => ({
    insert: (emoji: Emoji) => {
      tx.nodes.insert(store.get('createEmojiNode')(emoji));
    },
  }),
});
