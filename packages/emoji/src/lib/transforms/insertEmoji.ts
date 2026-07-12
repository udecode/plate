import type { Emoji } from '@emoji-mart/data';
import type { BaseEditor } from '@platejs/core';

import { BaseEmojiPlugin } from '../BaseEmojiPlugin';

export const insertEmoji = <TEmoji extends Emoji = Emoji>(
  editor: BaseEditor,
  emoji: TEmoji
) => {
  const { createEmojiNode } = editor.plugin(BaseEmojiPlugin).getOptions();

  editor.update((tx) => {
    const emojiNode = createEmojiNode(emoji);
    tx.nodes.insert(emojiNode);
  });
};
