import { getRenderElements, setDefaults } from "@udecode/slate-plugins-common";
import { DEFAULTS_ALIGN } from "./defaults";
import { AlignRenderElementOptions } from "./types";

export const renderElementAlign = (options?: AlignRenderElementOptions) => {
  const { align_left, align_center, align_right } = setDefaults(
    options,
    DEFAULTS_ALIGN
  );

  return getRenderElements([{ ...align_left }, align_center, align_right]);
};
