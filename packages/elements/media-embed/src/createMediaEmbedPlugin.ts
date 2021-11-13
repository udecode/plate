import { createPluginFactory } from '@udecode/plate-core';
import { getMediaEmbedDeserialize } from './getMediaEmbedDeserialize';

export const ELEMENT_MEDIA_EMBED = 'media_embed';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const createMediaEmbedPlugin = createPluginFactory({
  key: ELEMENT_MEDIA_EMBED,
  isElement: true,
  isVoid: true,
  deserialize: getMediaEmbedDeserialize(),
});
