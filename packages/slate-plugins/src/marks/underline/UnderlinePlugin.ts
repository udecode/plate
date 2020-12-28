import { getOnHotkeyToggleMarkDefault } from "@udecode/slate-plugins-common";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { DEFAULTS_UNDERLINE } from "./defaults";
import { deserializeUnderline } from "./deserializeUnderline";
import { renderLeafUnderline } from "./renderLeafUnderline";
import { UnderlinePluginOptions } from "./types";

/**
 * Enables support for underline formatting.
 */
export const UnderlinePlugin = (
  options?: UnderlinePluginOptions
): SlatePlugin => ({
  renderLeaf: renderLeafUnderline(options),
  deserialize: deserializeUnderline(options),
  onKeyDown: getOnHotkeyToggleMarkDefault({
    key: "underline",
    defaultOptions: DEFAULTS_UNDERLINE,
    options,
  }),
});
