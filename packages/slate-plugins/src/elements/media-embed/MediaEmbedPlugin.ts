import { SlatePlugin } from '../../common';
import { deserializeIframe } from './deserializeIframe';
import { renderElementMediaEmbed } from './renderElementMediaEmbed';
import { MEDIA_EMBED, MediaEmbedPluginOptions } from './types';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const MediaEmbedPlugin = (
  options?: MediaEmbedPluginOptions
): SlatePlugin => ({
  renderElement: renderElementMediaEmbed(options),
  deserialize: deserializeIframe(options),
  inlineTypes: options?.inlineTypes || [],
  voidTypes: [options?.typeMediaEmbed || MEDIA_EMBED],
});
