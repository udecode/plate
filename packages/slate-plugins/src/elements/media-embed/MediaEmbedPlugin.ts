import { setDefaults } from "@udecode/slate-plugins-common";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { DEFAULTS_MEDIA_EMBED } from "./defaults";
import { deserializeIframe } from "./deserializeIframe";
import { renderElementMediaEmbed } from "./renderElementMediaEmbed";
import { MediaEmbedPluginOptions } from "./types";

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const MediaEmbedPlugin = (
  options?: MediaEmbedPluginOptions
): SlatePlugin => {
  const { media_embed } = setDefaults(options, DEFAULTS_MEDIA_EMBED);

  return {
    renderElement: renderElementMediaEmbed(options),
    deserialize: deserializeIframe(options),
    voidTypes: [media_embed.type],
  };
};
