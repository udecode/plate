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
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    audioPlaceholder: bindFirst(insertAudioPlaceholder, editor),
    filePlaceholder: bindFirst(insertFilePlaceholder, editor),
    imagePlaceholder: bindFirst(insertImagePlaceholder, editor),
    videoPlaceholder: bindFirst(insertVideoPlaceholder, editor),
  },
}));
