import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseAudioPlugin = createBasePlugin({
  key: KEYS.audio,
  node: { isElement: true, isVoid: true },
});
