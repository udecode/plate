import type { Emoji } from '@emoji-mart/data';
import type { SlateEditor } from '@udecode/plate';

import { BaseEmojiPlugin } from '../BaseEmojiPlugin';

export const insertEmoji = <TEmoji extends Emoji = Emoji>(
  editor: SlateEditor,
  emoji: TEmoji
) => {
  const { createEmojiNode } = editor.getOptions(BaseEmojiPlugin);

  const emojiNode = createEmojiNode!(emoji);
  editor.tf.insertNodes(emojiNode);
};
