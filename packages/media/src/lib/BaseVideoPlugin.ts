import { createSlatePlugin, KEYS } from '@udecode/plate';

import type { TMediaElement } from '..';

export interface TVideoElement extends TMediaElement {}

export const BaseVideoPlugin = createSlatePlugin({
  key: KEYS.video,
  node: {
    dangerouslyAllowAttributes: ['width', 'height'],
    isElement: true,
    isVoid: true,
  },
});
