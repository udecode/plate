import { getRenderLeafDefault } from "@udecode/slate-plugins-common";
import { DEFAULTS_UNDERLINE } from "./defaults";
import { UnderlineRenderLeafOptions } from "./types";

export const renderLeafUnderline = (options?: UnderlineRenderLeafOptions) =>
  getRenderLeafDefault({
    key: "underline",
    defaultOptions: DEFAULTS_UNDERLINE,
    options,
  });
