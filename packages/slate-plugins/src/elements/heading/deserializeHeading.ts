import {
  getElementDeserializer,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { DeserializeHtml } from "@udecode/slate-plugins-core";
import { DEFAULTS_HEADING } from "./defaults";
import { HeadingDeserializeOptions } from "./types";

export const deserializeHeading = (
  options?: HeadingDeserializeOptions
): DeserializeHtml => {
  const { h1, h2, h3, h4, h5, h6, levels } = setDefaults(
    options,
    DEFAULTS_HEADING
  );

  let deserializers = getElementDeserializer({
    type: h1.type,
    rules: [{ nodeNames: "H1" }],
    ...options?.h1?.deserialize,
  });

  if (levels >= 2)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h2.type,
        rules: [{ nodeNames: "H2" }],
        ...options?.h2?.deserialize,
      }),
    ];
  if (levels >= 3)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h3.type,
        rules: [{ nodeNames: "H3" }],
        ...options?.h3?.deserialize,
      }),
    ];
  if (levels >= 4)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h4.type,
        rules: [{ nodeNames: "H4" }],
        ...options?.h4?.deserialize,
      }),
    ];
  if (levels >= 5)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h5.type,
        rules: [{ nodeNames: "H5" }],
        ...options?.h5?.deserialize,
      }),
    ];
  if (levels >= 6)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h6.type,
        rules: [{ nodeNames: "H6" }],
        ...options?.h6?.deserialize,
      }),
    ];

  return {
    element: deserializers,
  };
};
