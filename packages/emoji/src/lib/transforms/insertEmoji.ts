import type { Emoji } from '@emoji-mart/data';
import type { SlateEditor } from 'platejs';

import { BaseEmojiPlugin } from '../BaseEmojiPlugin';

export const insertEmoji = <TEmoji extends Emoji = Emoji>(
  editor: SlateEditor,
  emoji: TEmoji
) => {
  const { createEmojiNode } = editor.plugin(BaseEmojiPlugin).getOptions();

  const emojiNode = createEmojiNode!(emoji);
  editor.tf.insertNodes(emojiNode);
};
