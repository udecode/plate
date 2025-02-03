import {
  type PluginConfig,
  type TElement,
  bindFirst,
  createTSlatePlugin,
} from '@udecode/plate';

import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertImagePlaceholder,
  insertVideoPlaceholder,
} from './transforms';

export interface MediaPlaceholderOptions {
  rules?: PlaceholderRule[];
}

export type PlaceholderConfig = PluginConfig<
  'placeholder',
  MediaPlaceholderOptions
>;

export interface PlaceholderRule {
  mediaType: string;
}

export interface TPlaceholderElement extends TElement {
  mediaType: string;
}

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
