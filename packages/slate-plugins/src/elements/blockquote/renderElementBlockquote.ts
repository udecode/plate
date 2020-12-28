import { getRenderElement, setDefaults } from "@udecode/slate-plugins-common";
import { DEFAULTS_BLOCKQUOTE } from "./defaults";
import { BlockquoteRenderElementOptions } from "./types";

export const renderElementBlockquote = (
  options?: BlockquoteRenderElementOptions
) => {
  const { blockquote } = setDefaults(options, DEFAULTS_BLOCKQUOTE);

  return getRenderElement(blockquote);
};
