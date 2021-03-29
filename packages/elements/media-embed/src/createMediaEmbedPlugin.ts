import {
  getRenderElement,
  getSlatePluginTypes,
  SlatePlugin,
} from '@udecode/slate-plugins-core';
import { ELEMENT_MEDIA_EMBED } from './defaults';
import { getMediaEmbedDeserialize } from './getMediaEmbedDeserialize';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const createMediaEmbedPlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_MEDIA_EMBED,
  renderElement: getRenderElement(ELEMENT_MEDIA_EMBED),
  deserialize: getMediaEmbedDeserialize(),
  voidTypes: getSlatePluginTypes(ELEMENT_MEDIA_EMBED),
});
