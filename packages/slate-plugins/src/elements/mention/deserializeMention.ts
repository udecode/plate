import {
  getNodeDeserializer,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { DeserializeHtml } from "@udecode/slate-plugins-core";
import { DEFAULTS_MENTION } from "./defaults";
import { MentionDeserializeOptions } from "./types";

export const deserializeMention = (
  options?: MentionDeserializeOptions
): DeserializeHtml => {
  const { mention } = setDefaults(options, DEFAULTS_MENTION);

  return {
    element: getNodeDeserializer({
      type: mention.type,
      node: (el) => ({
        type: mention.type,
        value: el.getAttribute("data-slate-value"),
      }),
      rules: [{ className: mention.rootProps.className }],
      ...options?.mention?.deserialize,
    }),
  };
};
