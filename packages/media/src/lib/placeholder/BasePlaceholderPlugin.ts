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
  insertAudioPlaceholder: bindFirst(insertAudioPlaceholder, editor),
  insertFilePlaceholder: bindFirst(insertFilePlaceholder, editor),
  insertImagePlaceholder: bindFirst(insertImagePlaceholder, editor),
  insertVideoPlaceholder: bindFirst(insertVideoPlaceholder, editor),
}));
