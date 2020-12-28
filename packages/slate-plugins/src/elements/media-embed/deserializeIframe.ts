import {
  getNodeDeserializer,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { DeserializeHtml } from "@udecode/slate-plugins-core";
import { DEFAULTS_MEDIA_EMBED } from "./defaults";
import { MediaEmbedDeserializeOptions } from "./types";

export const deserializeIframe = (
  options?: MediaEmbedDeserializeOptions
): DeserializeHtml => {
  const { media_embed } = setDefaults(options, DEFAULTS_MEDIA_EMBED);

  return {
    element: getNodeDeserializer({
      type: media_embed.type,
      node: (el: HTMLElement) => {
        let url = el.getAttribute("src");
        if (url) {
          [url] = url.split("?");

          return {
            type: media_embed.type,
            url,
          };
        }
      },
      rules: [
        { nodeNames: "IFRAME" },
        { className: media_embed.rootProps.className },
      ],
      ...options?.media_embed?.deserialize,
    }),
  };
};
