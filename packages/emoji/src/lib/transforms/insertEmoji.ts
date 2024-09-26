import type { Emoji } from '@emoji-mart/data';

import { type SlateEditor, insertNodes } from '@udecode/plate-common';

import { BaseEmojiPlugin } from '../BaseEmojiPlugin';

export const insertEmoji = <TEmoji extends Emoji = Emoji>(
  editor: SlateEditor,
  emoji: TEmoji
) => {
  const { createEmojiNode } = editor.getOptions(BaseEmojiPlugin);

  const emojiNode = createEmojiNode!(emoji);
  insertNodes(editor, emojiNode);
};
