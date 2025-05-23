import { createSlatePlugin, KEYS } from '@udecode/plate';

import type { TMediaElement } from './media';

export interface TFileElement extends TMediaElement {}

export const BaseFilePlugin = createSlatePlugin({
  key: KEYS.file,
  node: { isElement: true, isVoid: true },
});
