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
export const createMediaEmbedPlugin = ({
  pluginKey = ELEMENT_MEDIA_EMBED,
}): SlatePlugin => ({
  pluginKeys: pluginKey,
  renderElement: getRenderElement(pluginKey),
  deserialize: getMediaEmbedDeserialize(pluginKey),
  voidTypes: getSlatePluginTypes(pluginKey),
});
