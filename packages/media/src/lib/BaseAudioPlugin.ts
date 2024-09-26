import { createSlatePlugin } from '@udecode/plate-common';

import type { TMediaElement } from './media';

export interface TAudioElement extends TMediaElement {}

export const BaseAudioPlugin = createSlatePlugin({
  key: 'audio',
  node: { isElement: true, isVoid: true },
});
