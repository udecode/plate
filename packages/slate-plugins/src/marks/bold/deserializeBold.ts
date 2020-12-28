import {
  getLeafDeserializer,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { DeserializeHtml } from "@udecode/slate-plugins-core";
import { DEFAULTS_BOLD } from "./defaults";
import { BoldDeserializeOptions } from "./types";

export const deserializeBold = (
  options?: BoldDeserializeOptions
): DeserializeHtml => {
  const { bold } = setDefaults(options, DEFAULTS_BOLD);

  return {
    leaf: getLeafDeserializer({
      type: bold.type,
      rules: [
        { nodeNames: ["STRONG"] },
        {
          style: {
            fontWeight: ["600", "700", "bold"],
          },
        },
      ],
      ...options?.bold?.deserialize,
    }),
  };
};
