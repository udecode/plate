import { createSlatePlugin, KEYS } from '@udecode/plate';

import type { TMediaElement } from './media';

export interface TAudioElement extends TMediaElement {}

export const BaseAudioPlugin = createSlatePlugin({
  key: KEYS.audio,
  node: { isElement: true, isVoid: true },
});
