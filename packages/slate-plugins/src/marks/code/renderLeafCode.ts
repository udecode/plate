import { getRenderLeafDefault } from "@udecode/slate-plugins-common";
import { DEFAULTS_CODE } from "./defaults";
import { CodeRenderLeafOptions } from "./types";

export const renderLeafCode = (options?: CodeRenderLeafOptions) =>
  getRenderLeafDefault({
    key: "code",
    defaultOptions: DEFAULTS_CODE,
    options,
  });
