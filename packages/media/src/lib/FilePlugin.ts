import { createSlatePlugin } from '@udecode/plate-common';

import type { TMediaElement } from './media';

export interface TFileElement extends TMediaElement {}

export const FilePlugin = createSlatePlugin({
  isElement: true,
  isVoid: true,
  key: 'file',
});
