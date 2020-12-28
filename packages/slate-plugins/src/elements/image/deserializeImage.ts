import {
  getNodeDeserializer,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { DeserializeHtml } from "@udecode/slate-plugins-core";
import { DEFAULTS_IMAGE } from "./defaults";
import { ImageDeserializeOptions } from "./types";

export const deserializeImage = (
  options?: ImageDeserializeOptions
): DeserializeHtml => {
  const { img } = setDefaults(options, DEFAULTS_IMAGE);

  return {
    element: getNodeDeserializer({
      type: img.type,
      node: (el) => ({
        type: img.type,
        url: el.getAttribute("src"),
      }),
      rules: [{ nodeNames: "IMG" }],
      ...options?.img?.deserialize,
    }),
  };
};
