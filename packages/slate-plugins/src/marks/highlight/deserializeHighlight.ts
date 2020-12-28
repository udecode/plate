import {
  getLeafDeserializer,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { DeserializeHtml } from "@udecode/slate-plugins-core";
import { DEFAULTS_HIGHLIGHT } from "./defaults";
import { HighlightDeserializeOptions } from "./types";

export const deserializeHighlight = (
  options?: HighlightDeserializeOptions
): DeserializeHtml => {
  const { highlight } = setDefaults(options, DEFAULTS_HIGHLIGHT);

  return {
    leaf: getLeafDeserializer({
      type: highlight.type,
      rules: [{ nodeNames: ["MARK"] }],
      ...options?.highlight?.deserialize,
    }),
  };
};
