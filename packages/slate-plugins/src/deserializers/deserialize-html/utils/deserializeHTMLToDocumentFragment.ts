import {
  normalizeDescendantsToDocumentFragment,
  SlateDocumentFragment,
} from "@udecode/slate-plugins-common";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { Descendant } from "slate";
import { htmlStringToDOMNode } from "../../../serializers/serialize-html/utils/htmlStringToDOMNode";
import { deserializeHTMLElement } from "./deserializeHTMLElement";

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHTMLToDocumentFragment = ({
  plugins,
  element,
}: {
  plugins: SlatePlugin[];
  element: HTMLElement | string;
}): SlateDocumentFragment => {
  if (typeof element === "string") {
    element = htmlStringToDOMNode(element);
  }

  const fragment = deserializeHTMLElement({
    plugins,
    element,
  }) as Descendant[];

  return normalizeDescendantsToDocumentFragment(fragment);
};
