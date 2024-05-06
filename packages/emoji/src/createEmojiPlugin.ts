import { createPluginFactory } from '@udecode/plate-common/server';

import type { EmojiPlugin } from './types';

import { EMOJI_TRIGGER, KEY_EMOJI } from './constants';
import { EmojiTriggeringController } from './utils/index';
import { withEmoji } from './withEmoji';

export const createEmojiPlugin = createPluginFactory<EmojiPlugin>({
  key: KEY_EMOJI,
  options: {
    createEmoji: (item) => item.data.emoji,
    emojiTriggeringController: new EmojiTriggeringController(),
    trigger: EMOJI_TRIGGER,
  },
  then: (
    _,
    { key, options: { createEmoji, emojiTriggeringController, trigger } }
  ) => ({
    options: {
      createEmoji,
      emojiTriggeringController,
      id: key,
      trigger,
    },
  }),
  withOverrides: withEmoji,
});
