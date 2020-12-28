import { SlateDocument } from "@udecode/slate-plugins-common";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { deserializeHTMLToDocumentFragment } from "./deserializeHTMLToDocumentFragment";

/**
 * Deserialize HTML to a valid Slate value.
 */
export const deserializeHTMLToDocument = ({
  plugins,
  element,
}: {
  plugins: SlatePlugin[];
  element: HTMLElement;
}): SlateDocument => {
  const nodes = deserializeHTMLToDocumentFragment({ plugins, element });

  return [{ children: nodes }];
};
