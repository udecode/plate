import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_MEDIA_EMBED } from './defaults';
import { getMediaEmbedDeserialize } from './getMediaEmbedDeserialize';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const createMediaEmbedPlugin = ({
  key = ELEMENT_MEDIA_EMBED,
}: {
  key?: string;
} = {}): PlatePlugin => ({
  key,
  isElement: true,
  deserialize: getMediaEmbedDeserialize(key),
  isVoid: true,
});
