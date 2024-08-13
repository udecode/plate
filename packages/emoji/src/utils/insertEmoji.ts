import type { Emoji } from '@emoji-mart/data';

import {
  type PlateEditor,
  getPluginOptions,
  insertNodes,
} from '@udecode/plate-common';

import type { EmojiPluginOptions } from '../types';

import { EmojiPlugin } from '../EmojiPlugin';

export const insertEmoji = <TEmoji extends Emoji = Emoji>(
  editor: PlateEditor,
  emoji: TEmoji
) => {
  const { createEmojiNode } = getPluginOptions<EmojiPluginOptions>(
    editor,
    EmojiPlugin.key
  );

  const emojiNode = createEmojiNode!(emoji);
  insertNodes(editor, emojiNode);
};
