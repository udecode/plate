import { createSlatePlugin } from '@udecode/plate';

import type { TMediaElement } from '..';

export interface TVideoElement extends TMediaElement {}

export const BaseVideoPlugin = createSlatePlugin({
  key: 'video',
  node: {
    isElement: true,
    isVoid: true,
  },
});
