import { MediaEmbedElement } from './components/MediaEmbedElement';
import { MediaEmbedKeyOption, MediaEmbedPluginOptionsValues } from './types';

export const ELEMENT_MEDIA_EMBED = 'media_embed';

export const DEFAULTS_MEDIA_EMBED: Record<
  MediaEmbedKeyOption,
  MediaEmbedPluginOptionsValues
> = {
  media_embed: {
    component: MediaEmbedElement,
    type: ELEMENT_MEDIA_EMBED,
    rootProps: {
      className: 'slate-media-embed',
    },
  },
};
