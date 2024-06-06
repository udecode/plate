import { createPluginFactory } from '@udecode/plate-common';

import type { AudioPlugin } from './types';

export const ELEMENT_AUDIO = 'audio';

export const createAudioPlugin = createPluginFactory<AudioPlugin>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_AUDIO,
});
