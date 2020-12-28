import {
  getElementDeserializer,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { DeserializeHtml } from "@udecode/slate-plugins-core";
import { DEFAULTS_TABLE } from "./defaults";
import { TableDeserializeOptions } from "./types";

export const deserializeTable = (
  options?: TableDeserializeOptions
): DeserializeHtml => {
  const { table, td, th, tr } = setDefaults(options, DEFAULTS_TABLE);

  return {
    element: [
      ...getElementDeserializer({
        type: table.type,
        rules: [{ nodeNames: "TABLE" }],
        ...options?.table?.deserialize,
      }),
      ...getElementDeserializer({
        type: tr.type,
        rules: [{ nodeNames: "TR" }],
        ...options?.tr?.deserialize,
      }),
      ...getElementDeserializer({
        type: td.type,
        attributes: ["rowspan", "colspan"],
        rules: [{ nodeNames: "TD" }],
        ...options?.td?.deserialize,
      }),
      ...getElementDeserializer({
        type: th.type,
        attributes: ["rowspan", "colspan"],
        rules: [{ nodeNames: "TH" }],
        ...options?.th?.deserialize,
      }),
    ],
  };
};
