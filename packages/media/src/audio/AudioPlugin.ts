import { createPlugin } from '@udecode/plate-common';

import type { AudioPluginOptions } from './types';

export const ELEMENT_AUDIO = 'audio';

export const AudioPlugin = createPlugin<'audio', AudioPluginOptions>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_AUDIO,
});
