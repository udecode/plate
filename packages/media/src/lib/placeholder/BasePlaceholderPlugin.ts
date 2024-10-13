import {
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { MediaPlaceholder } from './types';

import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertImagePlaceholder,
  insertVideoPlaceholder,
} from './transforms';

export type PlaceholderConfig = PluginConfig<'placeholder', MediaPlaceholder>;

export const BasePlaceholderPlugin = createTSlatePlugin<PlaceholderConfig>({
  key: 'placeholder',
  node: { isElement: true, isVoid: true },
}).extendTransforms(({ editor }) => ({
  insertAudio: bindFirst(insertAudioPlaceholder, editor),
  insertFile: bindFirst(insertFilePlaceholder, editor),
  insertImage: bindFirst(insertImagePlaceholder, editor),
  insertVideo: bindFirst(insertVideoPlaceholder, editor),
}));
