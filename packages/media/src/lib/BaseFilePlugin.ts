import { createSlatePlugin } from '@udecode/plate';

import type { TMediaElement } from './media';

export interface TFileElement extends TMediaElement {}

export const BaseFilePlugin = createSlatePlugin({
  key: 'file',
  node: { isElement: true, isVoid: true },
});
