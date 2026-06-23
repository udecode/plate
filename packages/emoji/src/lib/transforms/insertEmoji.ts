import type { Emoji } from '@emoji-mart/data';
import type { BasePlateEditor } from 'platejs';

import { BaseEmojiPlugin } from '../BaseEmojiPlugin';

export const insertEmoji = <TEmoji extends Emoji = Emoji>(
  editor: BasePlateEditor,
  emoji: TEmoji
) => {
  const { createEmojiNode } = editor.getOptions(BaseEmojiPlugin);

  const emojiNode = createEmojiNode!(emoji);
  editor.update((tx) => {
    tx.nodes.insert(emojiNode);
  });
};
