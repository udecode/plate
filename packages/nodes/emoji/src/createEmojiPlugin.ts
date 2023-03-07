import { createPluginFactory } from '@udecode/plate-common';
import { EMOJI_TRIGGER, KEY_EMOJI } from './constants';
import { EmojiPlugin } from './types';
import { EmojiTriggeringController } from './utils';
import { withEmoji } from './withEmoji';

export const createEmojiPlugin = createPluginFactory<EmojiPlugin>({
  key: KEY_EMOJI,
  // handlers: {
  //   onKeyDown: getOnKeyDownEmoji(),
  // },
  withOverrides: withEmoji,
  options: {
    trigger: EMOJI_TRIGGER,
    createEmoji: (item) => item.data.emoji,
    emojiTriggeringController: new EmojiTriggeringController(EMOJI_TRIGGER),
  },
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
