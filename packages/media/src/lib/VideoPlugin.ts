import { createSlatePlugin } from '@udecode/plate-common';

import type { TMediaElement } from '..';

export interface TVideoElement extends TMediaElement {}

export const VideoPlugin = createSlatePlugin({
  isElement: true,
  isVoid: true,
  key: 'video',
});
