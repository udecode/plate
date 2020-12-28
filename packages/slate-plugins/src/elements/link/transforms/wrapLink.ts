import { setDefaults, wrapNodes } from "@udecode/slate-plugins-common";
import { Editor, Location } from "slate";
import { DEFAULTS_LINK } from "../defaults";
import { LinkOptions } from "../types";

/**
 * Wrap selected nodes with a link and collapse at the end.
 */
export const wrapLink = (
  editor: Editor,
  url: string,
  options?: {
    at?: Location;
  } & LinkOptions
) => {
  const { at, link } = setDefaults(options, DEFAULTS_LINK);

  wrapNodes(
    editor,
    {
      type: link.type,
      url,
      children: [],
    },
    { at, split: true }
  );
};
