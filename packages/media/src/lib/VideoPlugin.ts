import { createSlatePlugin } from '@udecode/plate-common';

import type { TMediaElement } from '..';

export interface TVideoElement extends TMediaElement {}

export const VideoPlugin = createSlatePlugin({
  key: 'video',
  node: { isElement: true, isVoid: true },
});
