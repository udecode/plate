import { getRenderElement, setDefaults } from "@udecode/slate-plugins-common";
import { DEFAULTS_CODE_BLOCK } from "./defaults";
import { CodeBlockRenderElementOptions } from "./types";

export const renderElementCodeBlock = (
  options?: CodeBlockRenderElementOptions
) => {
  const { code_block } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return getRenderElement(code_block);
};
