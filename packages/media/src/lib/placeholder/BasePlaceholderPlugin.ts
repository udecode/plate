import {
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertImagePlaceholder,
  insertVideoPlaceholder,
} from './transforms';

export type MediaPlaceholderOptions = {
  rules?: PlaceholderRule[];
};

export type PlaceholderConfig = PluginConfig<
  'placeholder',
  MediaPlaceholderOptions
>;

export type PlaceholderRule = {
  mediaType: string;
};

export const BasePlaceholderPlugin = createTSlatePlugin<PlaceholderConfig>({
  key: KEYS.placeholder,
  node: { isElement: true, isVoid: true },
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    audioPlaceholder: bindFirst(insertAudioPlaceholder, editor),
    filePlaceholder: bindFirst(insertFilePlaceholder, editor),
    imagePlaceholder: bindFirst(insertImagePlaceholder, editor),
    videoPlaceholder: bindFirst(insertVideoPlaceholder, editor),
  },
}));
