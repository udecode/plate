import { getRenderLeafDefault } from "@udecode/slate-plugins-common";
import { DEFAULTS_BOLD } from "./defaults";
import { BoldRenderLeafOptions } from "./types";

export const renderLeafBold = (options?: BoldRenderLeafOptions) =>
  getRenderLeafDefault({
    key: "bold",
    defaultOptions: DEFAULTS_BOLD,
    options,
  });
