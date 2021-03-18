import { getPluginRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_MEDIA_EMBED } from './defaults';
import { useDeserializeIframe } from './useDeserializeIframe';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const MediaEmbedPlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_MEDIA_EMBED,
  renderElement: getPluginRenderElement(ELEMENT_MEDIA_EMBED),
  deserialize: useDeserializeIframe(),
  // voidTypes: [useEditorPluginType(ELEMENT_MEDIA_EMBED)],
});
