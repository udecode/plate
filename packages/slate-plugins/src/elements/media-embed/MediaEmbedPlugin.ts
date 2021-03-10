import { useRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin, useEditorType } from '@udecode/slate-plugins-core';
import { ELEMENT_MEDIA_EMBED } from './defaults';
import { useDeserializeIframe } from './useDeserializeIframe';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const MediaEmbedPlugin = (): SlatePlugin => ({
  elementKeys: ELEMENT_MEDIA_EMBED,
  renderElement: useRenderElement(ELEMENT_MEDIA_EMBED),
  deserialize: useDeserializeIframe(),
  voidTypes: [useEditorType(ELEMENT_MEDIA_EMBED)],
});
