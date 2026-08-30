import { toPlatePlugin } from '../../react/core';
import { BaseEmojiInputPlugin, BaseEmojiPlugin } from '../lib';

export const EmojiInputPlugin = toPlatePlugin(BaseEmojiInputPlugin);

export const EmojiPlugin = toPlatePlugin(BaseEmojiPlugin, {
  dependencies: [EmojiInputPlugin],
});
