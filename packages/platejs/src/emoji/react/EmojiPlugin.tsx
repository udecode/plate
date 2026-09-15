import { toReactPlugin } from '../../react/core';
import { BaseEmojiInputPlugin, BaseEmojiPlugin } from '../lib';

export const EmojiInputPlugin = toReactPlugin(BaseEmojiInputPlugin);

export const EmojiPlugin = toReactPlugin(BaseEmojiPlugin, {
  dependencies: [EmojiInputPlugin],
});
