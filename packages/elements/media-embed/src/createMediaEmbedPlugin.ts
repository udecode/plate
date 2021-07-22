import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate-core';
import { ELEMENT_MEDIA_EMBED } from './defaults';
import { getMediaEmbedDeserialize } from './getMediaEmbedDeserialize';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const createMediaEmbedPlugin = ({
  pluginKey = ELEMENT_MEDIA_EMBED,
}: {
  pluginKey?: string;
} = {}): PlatePlugin => ({
  pluginKeys: pluginKey,
  renderElement: getRenderElement(pluginKey),
  deserialize: getMediaEmbedDeserialize(pluginKey),
  voidTypes: getPlatePluginTypes(pluginKey),
});
