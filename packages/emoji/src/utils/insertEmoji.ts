import type { Emoji } from '@emoji-mart/data';

import {
  type EElementOrText,
  type PlateEditor,
  type Value,
  getPluginOptions,
  insertNodes,
} from '@udecode/plate-common';

import type { EmojiPlugin } from '../types';

import { KEY_EMOJI } from '../createEmojiPlugin';

export const insertEmoji = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  TEmoji extends Emoji = Emoji,
>(
  editor: E,
  emoji: TEmoji
) => {
  const { createEmojiNode } = getPluginOptions<EmojiPlugin, V, E>(
    editor,
    KEY_EMOJI
  );

  const emojiNode = createEmojiNode!(emoji);
  insertNodes(editor, emojiNode as EElementOrText<V>);
};
