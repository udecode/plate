import { createPluginFactory } from '@udecode/plate-core';
import { ELEMENT_EMOJI, ELEMENT_EMOJI_INPUT } from './constants';
import { emojiOnKeyDownHandler } from './handlers';
import { EmojiPlugin } from './types';
// import { isSelectionInMentionInput } from './queries';
// import { withMention } from './withMention';

export const createEmojiPlugin = createPluginFactory<EmojiPlugin>({
  key: ELEMENT_EMOJI,
  isElement: true,
  isInline: true,
  isVoid: true,
  handlers: {
    onKeyDown: emojiOnKeyDownHandler(),
    // onKeyDown: emojiOnKeyDownHandler({ query: isSelectionInMentionInput }),
  },
  // withOverrides: withMention,
  options: {
    trigger: ':',
    createEmojiNode: (item) => ({ value: item.text }),
  },
  plugins: [
    {
      key: ELEMENT_EMOJI_INPUT,
      isElement: true,
      isInline: true,
    },
  ],
  then: (_, { key }) => ({
    options: {
      id: key,
    },
  }),
});
