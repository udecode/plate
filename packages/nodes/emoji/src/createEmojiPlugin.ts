import { createPluginFactory } from '@udecode/plate-core';
import { ELEMENT_EMOJI, ELEMENT_EMOJI_INPUT, TRIGGER } from './constants';
import { getOnKeyDownEmoji } from './handlers';
import { EmojiPlugin } from './types';
import { EmojiTriggeringController } from './utils';
import { withEmoji } from './withEmoji';

export const createEmojiPlugin = createPluginFactory<EmojiPlugin>({
  key: ELEMENT_EMOJI,
  isElement: true,
  isInline: true,
  isVoid: true,
  handlers: {
    onKeyDown: getOnKeyDownEmoji(),
  },
  withOverrides: withEmoji,
  options: {
    trigger: TRIGGER,
    createEmoji: (item) => item.data.emoji,
    emojiTriggeringController: new EmojiTriggeringController(TRIGGER),
  },
  plugins: [
    {
      key: ELEMENT_EMOJI_INPUT,
      isElement: true,
      isInline: true,
    },
  ],
  then: (
    _,
    { key, options: { trigger, createEmoji, emojiTriggeringController } }
  ) => ({
    options: {
      id: key,
      trigger,
      createEmoji,
      emojiTriggeringController,
    },
  }),
});
