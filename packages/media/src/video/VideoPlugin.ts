import { createPlugin } from '@udecode/plate-common';

import type { VideoPluginOptions } from './types';

export const ELEMENT_VIDEO = 'video';

export const VideoPlugin = createPlugin<'video', VideoPluginOptions>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_VIDEO,
});
