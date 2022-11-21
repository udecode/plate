import { createPluginFactory } from '@udecode/plate-core';
import { ELEMENT_EMOJI, ELEMENT_EMOJI_INPUT } from './constants';
import { emojiOnKeyDownHandler } from './handlers';
import { EmojiPluginOptions } from './types';
import { EmojiTriggeringController } from './utils';
import { withEmoji } from './withEmoji';

export const createEmojiPlugin = createPluginFactory<EmojiPluginOptions>({
  key: ELEMENT_EMOJI,
  isElement: true,
  isInline: true,
  isVoid: true,
  handlers: {
    onKeyDown: emojiOnKeyDownHandler(),
  },
  withOverrides: withEmoji,
  options: {
    createEmoji: (item) => item.text,
    emojiTriggeringController: new EmojiTriggeringController(':'),
  },
  plugins: [
    {
      key: ELEMENT_EMOJI_INPUT,
      isElement: true,
      isInline: true,
    },
  ],
  then: (_, { key, options: { createEmoji, emojiTriggeringController } }) => ({
    options: {
      id: key,
      createEmoji,
      emojiTriggeringController,
    },
  }),
});
